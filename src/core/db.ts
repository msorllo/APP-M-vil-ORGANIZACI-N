/* ==========================================================================
   Aura Database Layer - Local Persistence Store
   Principal Systems Architect Approved.
   ========================================================================== */

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  category: 'Negocio' | 'Proyecto' | 'Creativo' | 'Personal';
  color: 'cyan' | 'magenta' | 'purple' | 'yellow';
  createdAt: string;
}

export interface AISettings {
  geminiApiKey: string;
  selectedProvider: 'local' | 'gemini';
}

export interface A11ySettings {
  fontSizeScale: number; // 0.8, 1.0, 1.2, 1.4
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// Initial Mock Seed Data to WOW the user on first load
const DEFAULT_TASKS: Task[] = [
  {
    id: 't1',
    text: 'Revisar la arquitectura del organizador Aura con el equipo',
    completed: true,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 't2',
    text: 'Implementar el motor de IA híbrido offline',
    completed: false,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 't3',
    text: 'Asegurar accesibilidad de nivel AAA en la barra de navegación',
    completed: false,
    date: new Date().toISOString().split('T')[0]
  }
];

const DEFAULT_IDEAS: Idea[] = [
  {
    id: 'i1',
    title: 'Aura PWA Móvil',
    content: 'Una aplicación para teléfonos que organiza notas, ideas y usa IA local gratuita para analizar hábitos.',
    category: 'Proyecto',
    color: 'cyan',
    createdAt: new Date().toLocaleDateString()
  },
  {
    id: 'i2',
    title: 'Marca de Café Cyberpunk',
    content: 'Cafetería temática con luces de neón y café de especialidad servido en tazas inteligentes que cambian de color.',
    category: 'Negocio',
    color: 'magenta',
    createdAt: new Date().toLocaleDateString()
  }
];

const DEFAULT_AI_SETTINGS: AISettings = {
  geminiApiKey: '',
  selectedProvider: 'local'
};

const DEFAULT_A11Y_SETTINGS: A11ySettings = {
  fontSizeScale: 1.0,
  highContrast: false,
  reducedMotion: false
};

const DEFAULT_CHAT: ChatMessage[] = [
  {
    id: 'c1',
    sender: 'ai',
    text: '¡Hola! Soy tu asistente de IA personal integrado. Estoy sincronizado con tu planificador y bloc de ideas de Aura. Puedes preguntarme sobre tus planes del día, sugerencias para desarrollar tus ideas, ¡o lo que necesites!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

// Keys for LocalStorage
const KEYS = {
  TASKS: 'aura_tasks',
  IDEAS: 'aura_ideas',
  AI_SETTINGS: 'aura_ai_settings',
  A11Y_SETTINGS: 'aura_a11y_settings',
  CHAT_LOGS: 'aura_chat_logs'
};

export const db = {
  // --- TASKS PLANNER ---
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(KEYS.TASKS);
      if (!data) {
        this.saveTasks(DEFAULT_TASKS);
        return DEFAULT_TASKS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading tasks database', e);
      return DEFAULT_TASKS;
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks database', e);
    }
  },

  // --- IDEAS VAULT ---
  getIdeas(): Idea[] {
    try {
      const data = localStorage.getItem(KEYS.IDEAS);
      if (!data) {
        this.saveIdeas(DEFAULT_IDEAS);
        return DEFAULT_IDEAS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading ideas database', e);
      return DEFAULT_IDEAS;
    }
  },

  saveIdeas(ideas: Idea[]): void {
    try {
      localStorage.setItem(KEYS.IDEAS, JSON.stringify(ideas));
    } catch (e) {
      console.error('Error saving ideas database', e);
    }
  },

  // --- AI SETTINGS ---
  getAISettings(): AISettings {
    try {
      const data = localStorage.getItem(KEYS.AI_SETTINGS);
      if (!data) {
        this.saveAISettings(DEFAULT_AI_SETTINGS);
        return DEFAULT_AI_SETTINGS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading AI settings', e);
      return DEFAULT_AI_SETTINGS;
    }
  },

  saveAISettings(settings: AISettings): void {
    try {
      localStorage.setItem(KEYS.AI_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving AI settings', e);
    }
  },

  // --- A11Y SETTINGS ---
  getA11ySettings(): A11ySettings {
    try {
      const data = localStorage.getItem(KEYS.A11Y_SETTINGS);
      if (!data) {
        this.saveA11ySettings(DEFAULT_A11Y_SETTINGS);
        return DEFAULT_A11Y_SETTINGS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading accessibility settings', e);
      return DEFAULT_A11Y_SETTINGS;
    }
  },

  saveA11ySettings(settings: A11ySettings): void {
    try {
      localStorage.setItem(KEYS.A11Y_SETTINGS, JSON.stringify(settings));
      // Proactively apply HTML overrides for Accessibility
      this.applyA11yConfig(settings);
    } catch (e) {
      console.error('Error saving accessibility settings', e);
    }
  },

  applyA11yConfig(settings: A11ySettings): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // 1. Font scaling
    root.style.setProperty('--text-scale', settings.fontSizeScale.toString());
    
    // 2. High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // 3. Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  },

  // --- CHAT LOGS ---
  getChatLogs(): ChatMessage[] {
    try {
      const data = localStorage.getItem(KEYS.CHAT_LOGS);
      if (!data) {
        this.saveChatLogs(DEFAULT_CHAT);
        return DEFAULT_CHAT;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading chat logs', e);
      return DEFAULT_CHAT;
    }
  },

  saveChatLogs(logs: ChatMessage[]): void {
    try {
      localStorage.setItem(KEYS.CHAT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving chat logs', e);
    }
  }
};
