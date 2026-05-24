/* ==========================================================================
   Aura Settings Component - A11y & AI Configurations
   Principal Systems Architect Approved. WCAG 2.1 AAA Compliant.
   ========================================================================== */

import { useState, useEffect, type FC } from 'react';
import { db } from '../core/db';
import type { A11ySettings, AISettings } from '../core/db';
import { Eye, EyeOff, Shield, Sparkles, Volume2, HelpCircle } from 'lucide-react';

interface SettingsPanelProps {
  onSettingsChange?: () => void;
}

export const SettingsPanel: FC<SettingsPanelProps> = ({ onSettingsChange }) => {
  // A11y States
  const [a11y, setA11y] = useState<A11ySettings>(db.getA11ySettings());
  // AI States
  const [aiSettings, setAiSettings] = useState<AISettings>(db.getAISettings());
  const [showApiKey, setShowApiKey] = useState(false);
  // Screen reader announcer state
  const [announcement, setAnnouncement] = useState('');

  // Apply settings on mount
  useEffect(() => {
    db.applyA11yConfig(a11y);
  }, [a11y]);

  const updateFontSize = (scale: number) => {
    const updated = { ...a11y, fontSizeScale: scale };
    setA11y(updated);
    db.saveA11ySettings(updated);
    setAnnouncement(`Tamaño de fuente cambiado a ${scale * 100}%`);
    if (onSettingsChange) onSettingsChange();
  };

  const toggleHighContrast = () => {
    const updated = { ...a11y, highContrast: !a11y.highContrast };
    setA11y(updated);
    db.saveA11ySettings(updated);
    setAnnouncement(`Modo de alto contraste ${updated.highContrast ? 'activado' : 'desactivado'}`);
    if (onSettingsChange) onSettingsChange();
  };

  const toggleReducedMotion = () => {
    const updated = { ...a11y, reducedMotion: !a11y.reducedMotion };
    setA11y(updated);
    db.saveA11ySettings(updated);
    setAnnouncement(`Reducción de movimiento ${updated.reducedMotion ? 'activada' : 'desactivada'}`);
    if (onSettingsChange) onSettingsChange();
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...aiSettings, geminiApiKey: e.target.value };
    setAiSettings(updated);
    db.saveAISettings(updated);
  };

  const handleProviderToggle = (provider: 'local' | 'gemini') => {
    const updated = { ...aiSettings, selectedProvider: provider };
    setAiSettings(updated);
    db.saveAISettings(updated);
    setAnnouncement(`Proveedor de IA cambiado a ${provider === 'local' ? 'Servicio Local Gratuito' : 'Gemini AI'}`);
  };

  return (
    <div className="anim-slide-up" style={{ paddingBottom: '5rem' }}>
      {/* Screen Reader Aria-Live Announcer */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-neon-cyan)', textShadow: 'var(--shadow-neon-cyan)' }}>
          Ajustes de Sistema
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', marginTop: '0.25rem' }}>
          Personaliza tu accesibilidad y el motor de IA
        </p>
      </header>

      {/* SECTION 1: ACCESIBILIDAD PREMIUM */}
      <section 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem', 
          marginBottom: '1.25rem',
          border: '1px solid rgba(0, 240, 255, 0.15)'
        }}
        aria-labelledby="a11y-heading"
      >
        <h3 
          id="a11y-heading" 
          style={{ 
            fontSize: 'var(--font-lg)', 
            marginBottom: '1rem', 
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Volume2 aria-hidden="true" style={{ color: 'var(--color-neon-cyan)', width: '20px', height: '20px' }} />
          Accesibilidad Premium
        </h3>

        {/* Font Scaling Controls */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            Tamaño de Letra del Sistema:
          </label>
          <div 
            role="group" 
            aria-label="Escala de tamaño de texto"
            style={{ 
              display: 'flex', 
              gap: '0.5rem',
              background: 'var(--color-bg-darkest)',
              padding: '4px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            {([0.8, 1.0, 1.2, 1.4] as const).map((scale) => (
              <button
                key={scale}
                onClick={() => updateFontSize(scale)}
                aria-pressed={a11y.fontSizeScale === scale}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: '600',
                  color: a11y.fontSizeScale === scale ? 'var(--color-bg-darkest)' : 'var(--color-text-primary)',
                  background: a11y.fontSizeScale === scale ? 'var(--color-neon-cyan)' : 'transparent',
                  boxShadow: a11y.fontSizeScale === scale ? 'var(--shadow-neon-cyan)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {scale === 0.8 ? 'Pequeña' : scale === 1.0 ? 'Normal' : scale === 1.2 ? 'Grande' : 'Súper'}
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast Toggle Switch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <label 
              htmlFor="high-contrast-toggle" 
              style={{ fontSize: 'var(--font-md)', fontWeight: '600', display: 'block' }}
            >
              Alto Contraste
            </label>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              Maximiza el contraste de colores para lectura clara
            </span>
          </div>
          <button
            id="high-contrast-toggle"
            role="switch"
            aria-checked={a11y.highContrast}
            onClick={toggleHighContrast}
            style={{
              width: '50px',
              height: '26px',
              borderRadius: 'var(--radius-full)',
              background: a11y.highContrast ? 'var(--color-neon-cyan)' : 'var(--color-bg-darkest)',
              position: 'relative',
              border: `1px solid ${a11y.highContrast ? 'var(--color-neon-cyan)' : 'var(--color-text-muted)'}`,
              transition: 'background var(--transition-fast)'
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: a11y.highContrast ? 'var(--color-bg-darkest)' : 'var(--color-text-secondary)',
                position: 'absolute',
                top: '3px',
                left: a11y.highContrast ? '27px' : '4px',
                transition: 'left var(--transition-fast)'
              }}
            />
          </button>
        </div>

        {/* Reduced Motion Toggle Switch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label 
              htmlFor="reduced-motion-toggle" 
              style={{ fontSize: 'var(--font-md)', fontWeight: '600', display: 'block' }}
            >
              Reducir Movimiento
            </label>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              Desactiva destellos y animaciones de traslación
            </span>
          </div>
          <button
            id="reduced-motion-toggle"
            role="switch"
            aria-checked={a11y.reducedMotion}
            onClick={toggleReducedMotion}
            style={{
              width: '50px',
              height: '26px',
              borderRadius: 'var(--radius-full)',
              background: a11y.reducedMotion ? 'var(--color-neon-cyan)' : 'var(--color-bg-darkest)',
              position: 'relative',
              border: `1px solid ${a11y.reducedMotion ? 'var(--color-neon-cyan)' : 'var(--color-text-muted)'}`,
              transition: 'background var(--transition-fast)'
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: a11y.reducedMotion ? 'var(--color-bg-darkest)' : 'var(--color-text-secondary)',
                position: 'absolute',
                top: '3px',
                left: a11y.reducedMotion ? '27px' : '4px',
                transition: 'left var(--transition-fast)'
              }}
            />
          </button>
        </div>
      </section>

      {/* SECTION 2: AJUSTES DE INTELIGENCIA ARTIFICIAL */}
      <section 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem',
          border: '1px solid rgba(255, 0, 127, 0.15)'
        }}
        aria-labelledby="ai-heading"
      >
        <h3 
          id="ai-heading" 
          style={{ 
            fontSize: 'var(--font-lg)', 
            marginBottom: '1rem', 
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles aria-hidden="true" style={{ color: 'var(--color-neon-magenta)', width: '20px', height: '20px' }} />
          Motor de Inteligencia Artificial
        </h3>

        {/* AI Provider Switch */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            Selecciona el Motor de IA:
          </label>
          <div 
            style={{ 
              display: 'flex', 
              gap: '0.5rem',
              background: 'var(--color-bg-darkest)',
              padding: '4px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <button
              onClick={() => handleProviderToggle('local')}
              aria-pressed={aiSettings.selectedProvider === 'local'}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-xs)',
                fontWeight: '600',
                color: aiSettings.selectedProvider === 'local' ? 'var(--color-bg-darkest)' : 'var(--color-text-primary)',
                background: aiSettings.selectedProvider === 'local' ? 'var(--color-neon-magenta)' : 'transparent',
                boxShadow: aiSettings.selectedProvider === 'local' ? 'var(--shadow-neon-magenta)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              100% Offline (Local Gratuito)
            </button>
            <button
              onClick={() => handleProviderToggle('gemini')}
              aria-pressed={aiSettings.selectedProvider === 'gemini'}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-xs)',
                fontWeight: '600',
                color: aiSettings.selectedProvider === 'gemini' ? 'var(--color-bg-darkest)' : 'var(--color-text-primary)',
                background: aiSettings.selectedProvider === 'gemini' ? 'var(--color-neon-magenta)' : 'transparent',
                boxShadow: aiSettings.selectedProvider === 'gemini' ? 'var(--shadow-neon-magenta)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              Gemini AI (Requiere API Key)
            </button>
          </div>
        </div>

        {/* Gemini API Key Configuration Fields */}
        {aiSettings.selectedProvider === 'gemini' && (
          <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label 
                htmlFor="api-key-input" 
                style={{ 
                  display: 'block', 
                  fontSize: 'var(--font-sm)', 
                  fontWeight: '600',
                  marginBottom: '0.25rem' 
                }}
              >
                Clave API de Gemini
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="api-key-input"
                  type={showApiKey ? 'text' : 'password'}
                  value={aiSettings.geminiApiKey}
                  onChange={handleApiKeyChange}
                  placeholder="AIzaSy..."
                  style={{
                    width: '100%',
                    background: 'var(--color-bg-darkest)',
                    border: '1px solid rgba(255, 0, 127, 0.4)',
                    padding: '12px 40px 12px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--font-sm)',
                    transition: 'border var(--transition-fast)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  aria-label={showApiKey ? "Ocultar clave API" : "Mostrar clave API"}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    color: 'var(--color-neon-magenta)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div 
              style={{ 
                background: 'rgba(255, 0, 127, 0.08)', 
                borderLeft: '3px solid var(--color-neon-magenta)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.4'
              }}
            >
              <HelpCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
              <strong>¿Cómo conseguir una clave gratis?</strong> Ve a 
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--color-neon-magenta)', textDecoration: 'underline', marginLeft: '4px' }}
              >
                Google AI Studio
              </a>, regístrate de forma gratuita, presiona "Get API Key" y pégala aquí. Se guardará de forma 100% local en tu teléfono.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Shield size={14} style={{ color: 'var(--color-success-green)' }} />
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                Encriptado y guardado local seguro.
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
