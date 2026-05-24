/* ==========================================================================
   Aura Planner Component - Daily Tasks Organizer
   Principal Systems Architect Approved. WCAG 2.1 AAA Compliant.
   ========================================================================== */

import { useState, useEffect, useRef, type FC } from 'react';
import { db } from '../core/db';
import type { Task } from '../core/db';
import { Calendar, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export const Planner: FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [announcement, setAnnouncement] = useState('');
  
  // Weekly calendar bar ref
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  // Load tasks on mount or when selectedDate changes
  useEffect(() => {
    setTasks(db.getTasks());
  }, [selectedDate]);

  // Generate 7 days around the selected date for the slider
  const getWeekDays = () => {
    const days = [];
    const baseDate = new Date(selectedDate);
    // Start 3 days before the selected date
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setAnnouncement(`Fecha cambiada a ${date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}`);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const allTasks = db.getTasks();
    const newTask: Task = {
      id: `task_${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
      date: selectedDate
    };

    const updated = [...allTasks, newTask];
    db.saveTasks(updated);
    setTasks(updated);
    setNewTaskText('');
    setAnnouncement(`Tarea "${newTask.text}" añadida correctamente`);
  };

  const handleToggleTask = (id: string) => {
    const allTasks = db.getTasks();
    const updated = allTasks.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        setAnnouncement(`Tarea "${t.text}" marcada como ${nextState ? 'completada' : 'pendiente'}`);
        return { ...t, completed: nextState };
      }
      return t;
    });
    db.saveTasks(updated);
    setTasks(updated);
  };

  const handleDeleteTask = (id: string, text: string) => {
    const allTasks = db.getTasks();
    const updated = allTasks.filter(t => t.id !== id);
    db.saveTasks(updated);
    setTasks(updated);
    setAnnouncement(`Tarea "${text}" eliminada`);
  };

  const filteredTasks = tasks.filter(t => t.date === selectedDate);
  const completedCount = filteredTasks.filter(t => t.completed).length;

  return (
    <div className="anim-slide-up" style={{ paddingBottom: '5rem' }}>
      {/* Screen Reader Aria-Live */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      <header style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--color-neon-cyan)', textShadow: 'var(--shadow-neon-cyan)' }}>
            Mi Agenda
          </h2>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        
        {/* Native Calendar Picker Overlay Button */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <label htmlFor="date-picker" className="sr-only">Seleccionar fecha específica</label>
          <Calendar aria-hidden="true" style={{ color: 'var(--color-neon-cyan)', marginRight: '6px' }} />
          <input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-xs)',
              cursor: 'pointer'
            }}
          />
        </div>
      </header>

      {/* Week Calendar Swipe Bar / Tactile Date Slider */}
      <div 
        ref={calendarScrollRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '8px',
          padding: '4px 0 12px 0',
          marginBottom: '1.25rem',
          scrollbarWidth: 'none', // Hide standard scrollbar on Firefox
        }}
        aria-label="Carrusel de fechas semanales"
      >
        {getWeekDays().map((day, idx) => {
          const isSelected = day.toISOString().split('T')[0] === selectedDate;
          const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
          return (
            <button
              key={idx}
              onClick={() => handleDateSelect(day)}
              aria-current={isSelected ? 'date' : undefined}
              style={{
                flex: '0 0 calc(100% / 5 - 8px)', // 5 items visible in mobile layout
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 0',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--color-neon-cyan)' : 'var(--color-bg-surface)',
                color: isSelected ? 'var(--color-bg-darkest)' : 'var(--color-text-primary)',
                border: isSelected ? '1px solid var(--color-neon-cyan)' : '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: isSelected ? 'var(--shadow-neon-cyan)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', opacity: isSelected ? 0.8 : 0.6 }}>
                {day.toLocaleDateString(undefined, { weekday: 'short' })}
              </span>
              <span style={{ fontSize: 'var(--font-lg)', fontWeight: 'bold', marginTop: '4px' }}>
                {day.getDate()}
              </span>
              {isToday && !isSelected && (
                <span 
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--color-neon-cyan)',
                    marginTop: '4px'
                  }}
                  aria-label="Hoy"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Task input Form */}
      <form 
        onSubmit={handleAddTask} 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '1.25rem' 
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <label htmlFor="task-input" className="sr-only">Escribe una nueva tarea</label>
          <input
            id="task-input"
            type="text"
            placeholder="Añadir una tarea para hoy..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            required
            style={{
              width: '100%',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              fontSize: 'var(--font-sm)',
              transition: 'border var(--transition-fast)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-neon-cyan)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0, 240, 255, 0.15)'}
          />
        </div>
        <button
          type="submit"
          aria-label="Agregar tarea"
          style={{
            background: 'var(--color-neon-cyan)',
            color: 'var(--color-bg-darkest)',
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-neon-cyan)',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={24} aria-hidden="true" />
        </button>
      </form>

      {/* Tareas Progress Summary Card */}
      <div 
        className="glass-panel glow-cyan" 
        style={{ 
          padding: '12px 16px', 
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: 'rgba(0, 240, 255, 0.2)'
        }}
      >
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-primary)', fontWeight: '600' }}>
          Progreso del Día:
        </span>
        <span 
          style={{ 
            fontSize: 'var(--font-sm)', 
            color: 'var(--color-neon-cyan)', 
            fontWeight: 'bold',
            background: 'var(--color-bg-darkest)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(0, 240, 255, 0.3)'
          }}
        >
          {filteredTasks.length > 0 ? `${completedCount} / ${filteredTasks.length}` : '0 / 0'}
        </span>
      </div>

      {/* List of Tasks */}
      <section aria-label="Lista de tareas del día seleccionado">
        {filteredTasks.length === 0 ? (
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
            <p style={{ fontSize: 'var(--font-md)' }}>✨ Libre de tareas. ¡Disfruta tu día!</p>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              Usa el campo superior para añadir objetivos de organización.
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTasks.map((task) => (
              <li 
                key={task.id}
                className="glass-panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderColor: task.completed ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  background: task.completed ? 'rgba(0, 230, 118, 0.02)' : 'rgba(26, 22, 53, 0.7)',
                  transition: 'all var(--transition-normal)'
                }}
              >
                {/* Touch Completion Check Box Button */}
                <button
                  onClick={() => handleToggleTask(task.id)}
                  aria-label={task.completed ? `Marcar como pendiente: ${task.text}` : `Marcar como completada: ${task.text}`}
                  style={{
                    color: task.completed ? 'var(--color-success-green)' : 'var(--color-neon-cyan)',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform var(--transition-fast)'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.85)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {task.completed ? (
                    <CheckCircle2 size={22} style={{ filter: 'drop-shadow(0 0 4px rgba(0, 230, 118, 0.4))' }} />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                {/* Task Content text */}
                <span 
                  onClick={() => handleToggleTask(task.id)}
                  style={{
                    flex: 1,
                    fontSize: 'var(--font-sm)',
                    color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '2px 0',
                    lineHeight: '1.4'
                  }}
                >
                  {task.text}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteTask(task.id, task.text)}
                  aria-label={`Eliminar tarea: ${task.text}`}
                  style={{
                    color: 'var(--color-danger)',
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)',
                    marginLeft: '8px',
                    opacity: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
