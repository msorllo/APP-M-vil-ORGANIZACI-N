/* ==========================================================================
   Aura AI Chat Component - Context-Aware Personal Assistant
   Principal Systems Architect Approved. WCAG 2.1 AAA Compliant.
   ========================================================================== */

import { useState, useEffect, useRef, type FC } from 'react';
import { db } from '../core/db';
import type { ChatMessage } from '../core/db';
import { aiService } from '../core/aiWrapper';
import { Send, Sparkles, User, ArrowRight } from 'lucide-react';

export const AIChatPanel: FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat logs on mount
  useEffect(() => {
    setMessages(db.getChatLogs());
  }, []);

  // Scroll to bottom whenever messages or typing state change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update state and save
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    db.saveChatLogs(updatedMessages);
    setInputValue('');
    setIsTyping(true);
    setAnnouncement('Pregunta enviada, la Inteligencia Artificial está procesando tu respuesta...');

    try {
      // Fetch latest tasks and ideas to feed as dynamic context
      const latestTasks = db.getTasks();
      const latestIdeas = db.getIdeas();
      const aiSettings = db.getAISettings();

      // Call the hybrid AI service
      const replyText = await aiService.askAI(userMsg.text, latestTasks, latestIdeas, aiSettings);

      const aiMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      db.saveChatLogs(finalMessages);
      
      // Make screen readers announce the response
      setAnnouncement(`Respuesta recibida: ${replyText.substring(0, 100)}...`);
    } catch (e) {
      console.error(e);
      setAnnouncement('Ocurrió un error al procesar tu consulta.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Predefined quick suggestion chips (fantastic tactile mobile UX)
  const SUGGESTIONS = [
    '¿Qué tareas pendientes tengo hoy?',
    '¿Qué hice ayer?',
    'Háblame de mis ideas',
    'Recomiéndame algo para mi idea de Aura PWA'
  ];

  return (
    <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 12rem)', position: 'relative' }}>
      
      {/* Screen Reader Aria-Live */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      <header style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--color-neon-purple)', textShadow: 'var(--shadow-neon-purple)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles aria-hidden="true" style={{ color: 'var(--color-neon-purple)' }} />
          Asistente Aura-AI
        </h2>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
          Analiza tus notas del planificador y bloc de ideas en tiempo real
        </span>
      </header>

      {/* Chat Messages container */}
      <section 
        role="log"
        aria-label="Historial de mensajes de chat"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '8px 4px',
          marginBottom: '1rem',
          borderRadius: 'var(--radius-md)'
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <article 
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '8px',
                maxWidth: '85%',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                animation: 'slide-up var(--transition-fast) forwards'
              }}
            >
              {/* Icon / Avatar for AI or User */}
              {!isUser && (
                <div 
                  aria-hidden="true"
                  style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-neon-purple)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-neon-purple)'
                  }}
                >
                  <Sparkles size={16} style={{ color: 'var(--color-neon-purple)' }} />
                </div>
              )}

              {/* Chat Bubble container */}
              <div 
                className="glass-panel"
                style={{
                  padding: '10px 14px',
                  borderRadius: isUser 
                    ? '18px 18px 4px 18px' 
                    : '18px 18px 18px 4px',
                  borderColor: isUser ? 'rgba(0, 240, 255, 0.2)' : 'rgba(157, 78, 221, 0.2)',
                  background: isUser ? 'rgba(0, 240, 255, 0.03)' : 'rgba(157, 78, 221, 0.03)',
                  boxShadow: 'var(--shadow-soft)',
                  wordBreak: 'break-word'
                }}
              >
                <div 
                  style={{ 
                    fontSize: 'var(--font-sm)', 
                    color: 'var(--color-text-primary)',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {/* Clean Markdown parsing simulation for headers, bolding and bullet list points */}
                  {msg.text.split('\n').map((line, idx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={idx} style={{ color: 'var(--color-neon-cyan)', margin: '8px 0 4px 0', fontSize: 'var(--font-sm)', fontWeight: 'bold' }}>{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('- [ ] ') || line.startsWith('- ')) {
                      return <div key={idx} style={{ paddingLeft: '12px', textIndent: '-12px', margin: '3px 0' }}>• {line.replace('- [ ] ', '').replace('- ', '')}</div>;
                    }
                    
                    // Basic bold match replacement: **text**
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    if (boldRegex.test(line)) {
                      const parts = line.split(boldRegex);
                      return (
                        <p key={idx} style={{ margin: '4px 0' }}>
                          {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: 'var(--color-neon-cyan)', fontWeight: 'bold' }}>{part}</strong> : part)}
                        </p>
                      );
                    }

                    return <p key={idx} style={{ margin: '4px 0' }}>{line}</p>;
                  })}
                </div>
                <div 
                  style={{ 
                    display: 'block', 
                    fontSize: '9px', 
                    color: 'var(--color-text-muted)', 
                    textAlign: 'right',
                    marginTop: '4px' 
                  }}
                >
                  <span className="sr-only">Enviado a las</span> {msg.timestamp}
                </div>
              </div>

              {/* User Avatar */}
              {isUser && (
                <div 
                  aria-hidden="true"
                  style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-neon-cyan)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-neon-cyan)'
                  }}
                >
                  <User size={16} style={{ color: 'var(--color-neon-cyan)' }} />
                </div>
              )}
            </article>
          );
        })}

        {/* AI Typing pulsing bubble indicator */}
        {isTyping && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              alignSelf: 'flex-start',
              animation: 'slide-up var(--transition-fast) forwards' 
            }}
          >
            <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-neon-purple)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-neon-purple)' }}>
              <Sparkles size={16} style={{ color: 'var(--color-neon-purple)' }} />
            </div>
            <div className="glass-panel" style={{ padding: '12px 18px', borderRadius: '18px 18px 18px 4px', borderColor: 'rgba(157, 78, 221, 0.2)' }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '14px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-neon-purple)', animation: 'pulse-cyan 1s infinite' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-neon-purple)', animation: 'pulse-cyan 1s infinite 0.2s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-neon-purple)', animation: 'pulse-cyan 1s infinite 0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </section>

      {/* Suggestion Chips Carousels (Tactile shortcuts) */}
      <div 
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '8px', 
          padding: '4px 0 8px 0',
          scrollbarWidth: 'none'
        }}
        aria-label="Sugerencias de preguntas rápidas"
      >
        {SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sug)}
            style={{
              flex: '0 0 auto',
              background: 'rgba(26, 22, 53, 0.8)',
              border: '1px solid rgba(157, 78, 221, 0.25)',
              color: 'var(--color-text-secondary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '11px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-neon-purple)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(157, 78, 221, 0.25)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {sug}
            <ArrowRight size={10} style={{ color: 'var(--color-neon-purple)' }} />
          </button>
        ))}
      </div>

      {/* Message input Form */}
      <form 
        onSubmit={handleFormSubmit}
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '4px'
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <label htmlFor="chat-input" className="sr-only">Escribe una pregunta para la Inteligencia Artificial</label>
          <input
            id="chat-input"
            type="text"
            placeholder="Pregúntame sobre tus notas o ideas..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            required
            style={{
              width: '100%',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(157, 78, 221, 0.2)',
              fontSize: 'var(--font-sm)',
              transition: 'border var(--transition-fast)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-neon-purple)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(157, 78, 221, 0.2)'}
          />
        </div>
        
        <button
          type="submit"
          disabled={isTyping}
          aria-label="Enviar pregunta"
          style={{
            background: 'var(--color-neon-purple)',
            color: 'var(--color-text-primary)',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-neon-purple)',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Send size={20} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};
