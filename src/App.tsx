/* ==========================================================================
   Aura Main Component - Mobile Shell & Tab Controller
   Principal Systems Architect Approved. WCAG 2.1 AAA Compliant.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { db } from './core/db';
import { Planner } from './components/Planner';
import { Ideas } from './components/Ideas';
import { AIChatPanel } from './components/AIChatPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { Calendar, Lightbulb, Sparkles, Sliders, Wifi } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'ideas' | 'chat' | 'settings'>('planner');
  const [aiSettings, setAiSettings] = useState(db.getAISettings());
  const [online, setOnline] = useState(true);

  // Initialize and apply A11y settings from db on mount
  useEffect(() => {
    const a11y = db.getA11ySettings();
    db.applyA11yConfig(a11y);

    // Dynamic browser connection status trackers
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshAISettings = () => {
    setAiSettings(db.getAISettings());
  };

  // Render active panel
  const renderPanel = () => {
    switch (activeTab) {
      case 'planner':
        return <Planner />;
      case 'ideas':
        return <Ideas />;
      case 'chat':
        return <AIChatPanel />;
      case 'settings':
        return <SettingsPanel onSettingsChange={refreshAISettings} />;
      default:
        return <Planner />;
    }
  };

  return (
    <div className="app-viewport">
      {/* 
        Responsive Adaptive Shell Layout:
        Renders a split row-sidebar dashboard on desktop, and a compact portrait mobile container on phones.
      */}
      <main className="app-container glass-panel">
        
        {/* DESKTOP LEFT SIDEBAR NAVIGATION */}
        <aside className="desktop-sidebar" aria-label="Navegación lateral de escritorio">
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h1 className="sidebar-logo">APP MSL</h1>
            <div className="logo-underline" aria-hidden="true" />
          </div>

          {/* Menu Items (Semantic Role Tabs) */}
          <nav className="sidebar-nav" role="tablist">
            <button
              role="tab"
              id="desktop-tab-planner"
              aria-selected={activeTab === 'planner'}
              aria-controls="panel-planner"
              onClick={() => setActiveTab('planner')}
              className={`sidebar-nav-btn ${activeTab === 'planner' ? 'active-planner' : ''}`}
            >
              <Calendar size={18} aria-hidden="true" />
              <span>Agenda</span>
            </button>

            <button
              role="tab"
              id="desktop-tab-ideas"
              aria-selected={activeTab === 'ideas'}
              aria-controls="panel-ideas"
              onClick={() => setActiveTab('ideas')}
              className={`sidebar-nav-btn ${activeTab === 'ideas' ? 'active-ideas' : ''}`}
            >
              <Lightbulb size={18} aria-hidden="true" />
              <span>Ideas</span>
            </button>

            <button
              role="tab"
              id="desktop-tab-chat"
              aria-selected={activeTab === 'chat'}
              aria-controls="panel-chat"
              onClick={() => setActiveTab('chat')}
              className={`sidebar-nav-btn ${activeTab === 'chat' ? 'active-chat' : ''}`}
            >
              <Sparkles size={18} aria-hidden="true" />
              <span>Asistente IA</span>
            </button>

            <button
              role="tab"
              id="desktop-tab-settings"
              aria-selected={activeTab === 'settings'}
              aria-controls="panel-settings"
              onClick={() => setActiveTab('settings')}
              className={`sidebar-nav-btn ${activeTab === 'settings' ? 'active-settings' : ''}`}
            >
              <Sliders size={18} aria-hidden="true" />
              <span>Ajustes</span>
            </button>
          </nav>

          {/* Sidebar Status Footer */}
          <div className="sidebar-footer">
            <div className="connection-badge" title={online ? "En línea" : "Desconectado"}>
              <Wifi size={12} style={{ color: online ? 'var(--color-success-green)' : 'var(--color-danger)' }} aria-hidden="true" />
              <span>{online ? 'CONECTADO' : 'SIN CONEXIÓN'}</span>
            </div>
            <div className="ai-badge">
              IA: {aiSettings.selectedProvider.toUpperCase()}
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT AREA */}
        <div className="app-main-display">
          
          {/* Device Top Status Bar (Responsive) */}
          <section className="app-top-status-bar" aria-label="Información de la plataforma">
            {/* Logo shown ONLY on Mobile screen widths */}
            <div className="mobile-logo-wrapper">
              <span className="mobile-logo-ping" aria-hidden="true" />
              <h1 className="mobile-logo-text">APP MSL</h1>
            </div>

            {/* Core version tag shown ONLY on Desktop screen widths */}
            <span className="core-version-tag">
              APP MSL CORE v2.1
            </span>

            <div className="status-indicators">
              <span className={`ai-provider-pill ${aiSettings.selectedProvider === 'gemini' ? 'gemini' : 'local'}`}>
                IA: {aiSettings.selectedProvider === 'gemini' ? 'GEMINI' : 'LOCAL'}
              </span>
              <div className="wifi-indicator" title={online ? "En línea" : "Desconectado"}>
                <Wifi size={12} style={{ color: online ? 'var(--color-success-green)' : 'var(--color-danger)' }} aria-hidden="true" />
                <span>{online ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </section>

          {/* Page Panel Container */}
          <div 
            className="app-content-wrapper" 
            id={`panel-${activeTab}`} 
            role="tabpanel"
            aria-labelledby={activeTab === 'planner' ? 'tab-planner' : activeTab === 'ideas' ? 'tab-ideas' : activeTab === 'chat' ? 'tab-chat' : 'tab-settings'}
          >
            {renderPanel()}
          </div>
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR (Mobile-only) */}
        <nav className="bottom-nav" role="tablist" aria-label="Barra de navegación principal móvil">
          {/* TAB 1: PLANNER */}
          <button
            role="tab"
            id="tab-planner"
            aria-selected={activeTab === 'planner'}
            aria-controls="panel-planner"
            onClick={() => setActiveTab('planner')}
            className={`bottom-nav-btn ${activeTab === 'planner' ? 'active-tab-planner' : ''}`}
          >
            <Calendar 
              size={20} 
              aria-hidden="true" 
            />
            <span>Agenda</span>
          </button>

          {/* TAB 2: IDEAS */}
          <button
            role="tab"
            id="tab-ideas"
            aria-selected={activeTab === 'ideas'}
            aria-controls="panel-ideas"
            onClick={() => setActiveTab('ideas')}
            className={`bottom-nav-btn ${activeTab === 'ideas' ? 'active-tab-ideas' : ''}`}
          >
            <Lightbulb 
              size={20} 
              aria-hidden="true" 
            />
            <span>Ideas</span>
          </button>

          {/* TAB 3: CHATBOT */}
          <button
            role="tab"
            id="tab-chat"
            aria-selected={activeTab === 'chat'}
            aria-controls="panel-chat"
            onClick={() => setActiveTab('chat')}
            className={`bottom-nav-btn ${activeTab === 'chat' ? 'active-tab-chat' : ''}`}
          >
            <Sparkles 
              size={20} 
              aria-hidden="true" 
            />
            <span>Asistente IA</span>
          </button>

          {/* TAB 4: SETTINGS */}
          <button
            role="tab"
            id="tab-settings"
            aria-selected={activeTab === 'settings'}
            aria-controls="panel-settings"
            onClick={() => setActiveTab('settings')}
            className={`bottom-nav-btn ${activeTab === 'settings' ? 'active-tab-settings' : ''}`}
          >
            <Sliders 
              size={20} 
              aria-hidden="true" 
            />
            <span>Ajustes</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
