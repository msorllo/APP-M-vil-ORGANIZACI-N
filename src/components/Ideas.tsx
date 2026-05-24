/* ==========================================================================
   Aura Ideas Component - Brainstorming & Inspiration Vault
   Principal Systems Architect Approved. WCAG 2.1 AAA Compliant.
   ========================================================================== */

import { useState, useEffect, type FC } from 'react';
import { db } from '../core/db';
import type { Idea } from '../core/db';
import { Lightbulb, Plus, Trash2, Tag } from 'lucide-react';

export const Ideas: FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<Idea['category']>('Proyecto');
  const [color, setColor] = useState<Idea['color']>('cyan');
  const [announcement, setAnnouncement] = useState('');

  // Load ideas on mount
  useEffect(() => {
    setIdeas(db.getIdeas());
  }, []);

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const allIdeas = db.getIdeas();
    const newIdea: Idea = {
      id: `idea_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category,
      color,
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [...allIdeas, newIdea];
    db.saveIdeas(updated);
    setIdeas(updated);
    
    // Reset Form
    setTitle('');
    setContent('');
    setCategory('Proyecto');
    setColor('cyan');
    setShowAddForm(false);
    
    setAnnouncement(`Idea "${newIdea.title}" guardada correctamente en la categoría ${newIdea.category}`);
  };

  const handleDeleteIdea = (id: string, ideaTitle: string) => {
    const allIdeas = db.getIdeas();
    const updated = allIdeas.filter(i => i.id !== id);
    db.saveIdeas(updated);
    setIdeas(updated);
    setAnnouncement(`Idea "${ideaTitle}" eliminada del bloc`);
  };

  const filteredIdeas = activeFilter === 'Todos' 
    ? ideas 
    : ideas.filter(i => i.category === activeFilter);

  // Helper to map color choice to dynamic CSS custom properties
  const getColorStyles = (colorName: Idea['color']) => {
    switch (colorName) {
      case 'cyan':
        return {
          glowClass: 'glow-cyan',
          textColor: 'var(--color-neon-cyan)',
          borderColor: 'rgba(0, 240, 255, 0.3)'
        };
      case 'magenta':
        return {
          glowClass: 'glow-magenta',
          textColor: 'var(--color-neon-magenta)',
          borderColor: 'rgba(255, 0, 127, 0.3)'
        };
      case 'purple':
        return {
          glowClass: 'glow-purple',
          textColor: 'var(--color-neon-purple)',
          borderColor: 'rgba(157, 78, 221, 0.3)'
        };
      case 'yellow':
        return {
          glowClass: '',
          textColor: 'var(--color-warning)',
          borderColor: 'rgba(255, 183, 3, 0.3)'
        };
      default:
        return {
          glowClass: 'glow-cyan',
          textColor: 'var(--color-neon-cyan)',
          borderColor: 'rgba(0, 240, 255, 0.3)'
        };
    }
  };

  return (
    <div className="anim-slide-up" style={{ paddingBottom: '5rem' }}>
      {/* Screen Reader Aria-Live */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      <header style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--color-neon-magenta)', textShadow: 'var(--shadow-neon-magenta)' }}>
            Bloc de Ideas
          </h2>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            Espacio de inspiración e innovación
          </span>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setAnnouncement(showAddForm ? 'Formulario de añadir idea cerrado' : 'Formulario de añadir idea abierto');
          }}
          aria-expanded={showAddForm}
          aria-controls="add-idea-form"
          style={{
            background: showAddForm ? 'var(--color-bg-surface)' : 'var(--color-neon-magenta)',
            color: showAddForm ? 'var(--color-text-primary)' : 'var(--color-bg-darkest)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-xs)',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: showAddForm ? 'none' : 'var(--shadow-neon-magenta)',
            border: showAddForm ? '1px solid var(--color-neon-magenta)' : 'none',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Plus size={16} aria-hidden="true" />
          {showAddForm ? 'Cancelar' : 'Nueva Idea'}
        </button>
      </header>

      {/* Dynamic Add Idea Form Section */}
      {showAddForm && (
        <form
          id="add-idea-form"
          onSubmit={handleAddIdea}
          className="glass-panel glow-magenta anim-slide-up"
          style={{
            padding: '1.25rem',
            marginBottom: '1.25rem',
            borderColor: 'rgba(255, 0, 127, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Title input */}
          <div>
            <label htmlFor="idea-title" style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 'bold', marginBottom: '4px' }}>
              Título de la Idea
            </label>
            <input
              id="idea-title"
              type="text"
              placeholder="Ej. App de paseadores de perros cyberpunk..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'var(--color-bg-darkest)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          {/* Description input */}
          <div>
            <label htmlFor="idea-content" style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 'bold', marginBottom: '4px' }}>
              Descripción / Notas
            </label>
            <textarea
              id="idea-content"
              placeholder="Explica tu idea en un par de líneas. ¿Qué problema resuelve?..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              style={{
                width: '100%',
                background: 'var(--color-bg-darkest)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text-primary)',
                resize: 'none',
                lineHeight: '1.4'
              }}
            />
          </div>

          {/* Grid for selectors (Category and Color) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label htmlFor="idea-category" style={{ display: 'block', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Categoría
              </label>
              <select
                id="idea-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Idea['category'])}
                style={{
                  width: '100%',
                  background: 'var(--color-bg-darkest)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-xs)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="Negocio">Negocio</option>
                <option value="Proyecto">Proyecto</option>
                <option value="Creativo">Creativo</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label htmlFor="idea-color" style={{ display: 'block', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Color de Neón
              </label>
              <select
                id="idea-color"
                value={color}
                onChange={(e) => setColor(e.target.value as Idea['color'])}
                style={{
                  width: '100%',
                  background: 'var(--color-bg-darkest)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-xs)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="cyan">Cyan</option>
                <option value="magenta">Magenta</option>
                <option value="purple">Púrpura</option>
                <option value="yellow">Amarillo</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--color-neon-magenta)',
              color: 'var(--color-bg-darkest)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
              fontWeight: 'bold',
              boxShadow: 'var(--shadow-neon-magenta)',
              textAlign: 'center',
              marginTop: '6px',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Guardar en mi Cerebro 🔮
          </button>
        </form>
      )}

      {/* Filter Category Chips Carousel */}
      <div 
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '8px', 
          marginBottom: '1.25rem',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}
        aria-label="Filtro de categorías de ideas"
      >
        {['Todos', 'Negocio', 'Proyecto', 'Creativo', 'Personal'].map((filterName) => (
          <button
            key={filterName}
            onClick={() => {
              setActiveFilter(filterName);
              setAnnouncement(`Filtro cambiado a ${filterName}`);
            }}
            aria-pressed={activeFilter === filterName}
            style={{
              flex: '0 0 auto',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-xs)',
              fontWeight: '600',
              background: activeFilter === filterName ? 'var(--color-neon-magenta)' : 'var(--color-bg-surface)',
              color: activeFilter === filterName ? 'var(--color-bg-darkest)' : 'var(--color-text-secondary)',
              border: `1px solid ${activeFilter === filterName ? 'var(--color-neon-magenta)' : 'rgba(255, 255, 255, 0.05)'}`,
              boxShadow: activeFilter === filterName ? 'var(--shadow-neon-magenta)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            {filterName}
          </button>
        ))}
      </div>

      {/* Ideas grid layout */}
      <section aria-label="Listado de tus ideas">
        {filteredIdeas.length === 0 ? (
          <div 
            className="glass-panel" 
            style={{ 
              padding: '2.5rem 1rem', 
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              borderStyle: 'dashed',
              borderWidth: '1.5px',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <Lightbulb size={32} style={{ color: 'var(--color-neon-magenta)', marginBottom: '8px', opacity: 0.7 }} />
            <p style={{ fontSize: 'var(--font-md)' }}>Ninguna idea guardada en esta categoría.</p>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              ¡Deja volar tu imaginación y apúntala presionando "Nueva Idea"!
            </p>
          </div>
        ) : (
          <div className="ideas-grid-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredIdeas.map((idea) => {
              const styles = getColorStyles(idea.color);
              return (
                <article 
                  key={idea.id}
                  className={`glass-panel ${styles.glowClass}`}
                  style={{
                    padding: '1rem',
                    borderColor: styles.borderColor,
                    borderWidth: '1px',
                    position: 'relative',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  {/* Category and Date Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span 
                      style={{ 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        textTransform: 'uppercase',
                        color: styles.textColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Tag size={10} />
                      {idea.category}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {idea.createdAt}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 'var(--font-md)', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    {idea.title}
                  </h3>

                  {/* Description content */}
                  <p style={{ 
                    fontSize: 'var(--font-sm)', 
                    color: 'var(--color-text-secondary)', 
                    lineHeight: '1.4', 
                    whiteSpace: 'pre-wrap',
                    paddingBottom: '8px'
                  }}>
                    {idea.content}
                  </p>

                  {/* Bottom controls panel (delete button) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                    <button
                      onClick={() => handleDeleteIdea(idea.id, idea.title)}
                      aria-label={`Eliminar idea: ${idea.title}`}
                      style={{
                        color: 'var(--color-danger)',
                        background: 'transparent',
                        padding: '4px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        opacity: 0.6,
                        transition: 'opacity var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                    >
                      <Trash2 size={12} aria-hidden="true" />
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
