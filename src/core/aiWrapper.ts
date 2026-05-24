/* ==========================================================================
   Aura AI Layer - Hybrid Local & Generative AI Wrapper
   Principal Systems Architect Approved.
   ========================================================================== */

import type { Task, Idea, AISettings } from './db';

/**
 * Normalizes strings for simple offline matching
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * High-quality offline local NLP engine
 * Simulates intelligent responses by parsing tasks & ideas contextually
 */
const runLocalOfflineAI = (userInput: string, tasks: Task[], ideas: Idea[]): string => {
  const query = normalizeText(userInput);
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Check for questions about Daily Notes / Tasks ("qué hice", "tareas", "tengo que hacer")
  if (query.includes('hacer') || query.includes('tarea') || query.includes('hice') || query.includes('plan') || query.includes('dia')) {
    // Determine which date the user is asking about
    let targetDate = todayStr;
    let dateLabel = 'hoy';

    if (query.includes('ayer') || query.includes('pasado')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      targetDate = yesterday.toISOString().split('T')[0];
      dateLabel = 'ayer';
    } else if (query.includes('manana')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = tomorrow.toISOString().split('T')[0];
      dateLabel = 'mañana';
    }

    const filteredTasks = tasks.filter(t => t.date === targetDate);

    if (filteredTasks.length === 0) {
      return `🔮 **Aura-AI Local:** He escaneado tu agenda. Para **${dateLabel}** no tienes tareas registradas. ¿Te gustaría añadir alguna tarea importante desde el planificador diario?`;
    }

    const completed = filteredTasks.filter(t => t.completed);
    const pending = filteredTasks.filter(t => !t.completed);

    let response = `🔮 **Aura-AI Local:** He consultado tu planificador diario para **${dateLabel} (${targetDate})**.\n\n`;
    response += `📊 Tienes **${filteredTasks.length}** tareas en total. (**${completed.length}** completadas, **${pending.length}** pendientes).\n\n`;
    
    if (completed.length > 0) {
      response += `✅ **Completado:**\n`;
      completed.forEach(t => {
        response += `- ${t.text}\n`;
      });
      response += `\n`;
    }
    
    if (pending.length > 0) {
      response += `⚡ **Pendientes:**\n`;
      pending.forEach(t => {
        response += `- [ ] ${t.text}\n`;
      });
      response += `\n💡 *Tip: Puedes completar las tareas tocándolas directamente en el panel principal.*`;
    } else {
      response += `🎉 ¡Increíble! Has completado el 100% de tus objetivos para este día.`;
    }

    return response;
  }

  // 2. Check for questions about Ideas ("idea", "ideas", "proyecto", "negocio")
  if (query.includes('idea') || query.includes('proyecto') || query.includes('negocio') || query.includes('crear') || query.includes('apunte')) {
    if (ideas.length === 0) {
      return `🔮 **Aura-AI Local:** Actualmente no tienes ideas guardadas en tu bloc. ¡Toca la pestaña de **Ideas** y apunta tu primera gran ocurrencia para que pueda ayudarte a estructurarla!`;
    }

    // Try to match a specific idea by keyword
    const matchedIdea = ideas.find(idea => 
      normalizeText(idea.title).split(' ').some(word => word.length > 3 && query.includes(word)) ||
      normalizeText(idea.content).split(' ').some(word => word.length > 3 && query.includes(word))
    );

    if (matchedIdea) {
      return `🔮 **Aura-AI Local (Cerebro Offline):** Analizando tu idea **"${matchedIdea.title}"**...\n\n` +
             `📝 **Resumen actual:** *${matchedIdea.content}*\n\n` +
             `🚀 **Recomendaciones de Desarrollo:**\n` +
             `1. **Validación de Concepto:** Identifica a 3 personas en tu entorno que sufran el problema que soluciona tu idea y pregúntales su opinión.\n` +
             `2. **MVP (Producto Mínimo Viable):** Diseña un prototipo inicial ultra-simple utilizando herramientas no-code o maquetas visuales en 48 horas.\n` +
             `3. **Próximo Paso:** Agrega la tarea *"Crear primer boceto de ${matchedIdea.title}"* en tu planificador diario de hoy para ponerte en marcha.\n\n` +
             `💡 *¿Quieres que elabore un plan de marketing para esta idea? Introduce una API Key de Gemini en los ajustes para desbloquear capacidades creativas avanzadas e ilimitadas.*`;
    }

    // General ideas list
    let response = `🔮 **Aura-AI Local:** He encontrado **${ideas.length}** ideas innovadoras en tu bloc de notas:\n\n`;
    ideas.forEach((idea, index) => {
      response += `${index + 1}. **${idea.title}** [${idea.category}]: *${idea.content}*\n`;
    });
    response += `\n💡 *Si me preguntas por alguna de ellas específicamente (por ejemplo: "qué me recomiendas para mi idea de ${ideas[0].title.split(' ')[0]}"), te daré pautas de ejecución personalizadas.*`;
    
    return response;
  }

  // 3. Check for help
  if (query.includes('ayuda') || query.includes('que puedes') || query.includes('como funciona') || query.includes('hola')) {
    return `🔮 **¡Hola! Bienvenido a Aura AI.**\n\n` +
           `Como tu asistente local, puedo ayudarte a analizar tu día a día. Puedes preguntarme:\n` +
           `- *"¿Qué tareas pendientes tengo hoy?"*\n` +
           `- *"¿Qué hice ayer?"*\n` +
           `- *"¿Qué ideas de negocio tengo guardadas?"*\n` +
           `- *"Recomiéndame algo sobre mi idea [nombre de la idea]"*\n\n` +
           `⚙️ *Para respuestas con total capacidad creativa y generativa, puedes ingresar tu API Key gratuita de Gemini (Google) desde la pestaña de Ajustes.*`;
  }

  // 4. Default intelligent response
  return `🔮 **Aura-AI Local:** He recibido tu consulta: *"${userInput}"*.\n\n` +
         `Actualmente estoy funcionando en **Modo Local Offline** (100% privado y gratuito). Para responder consultas generales complejas fuera de tus notas e ideas, te sugiero activar tu clave de **Gemini** en Ajustes.\n\n` +
         `**¿Sabías qué?** Tengo acceso a tu agenda diaria (${tasks.length} tareas) y a tu bloc de ideas (${ideas.length} ideas). Prueba a preguntarme: *"¿Qué tengo pendiente hoy?"* o *"Háblame de mis ideas"* y te daré un informe instantáneo.`;
};

/**
 * Sends a query to the Gemini API with structured note-taking context
 */
const runGeminiAI = async (userInput: string, tasks: Task[], ideas: Idea[], apiKey: string): Promise<string> => {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Prepare notes and ideas context to feed into the LLM
  const tasksContext = tasks.map(t => `- [${t.completed ? 'x' : ' '}] [Fecha: ${t.date}] ${t.text}`).join('\n');
  const ideasContext = ideas.map(i => `- [Categoría: ${i.category}] Título: ${i.title}. Descripción: ${i.content}`).join('\n');

  const systemInstruction = 
    `Eres Aura-AI, una inteligencia artificial elegante, moderna y con estilo Cyberpunk integrada en una aplicación móvil de organización personal.\n` +
    `Tu misión es ayudar al usuario a organizar su vida diaria, planificar tareas y expandir sus ideas creativas de forma amigable y concisa (ideal para leer en pantallas de teléfonos).\n` +
    `Tienes acceso al contexto del usuario en tiempo real:\n\n` +
    `=== TAREAS Y NOTAS DIARIAS ===\n${tasksContext || '(Sin tareas registradas)'}\n\n` +
    `=== BLOC DE IDEAS ===\n${ideasContext || '(Sin ideas registradas)'}\n\n` +
    `=== INSTRUCCIONES ===\n` +
    `1. Responde de forma concisa y visual, utilizando emojis y Markdown (negritas, listas, subtítulos).\n` +
    `2. Cuando te pregunten qué hiciste el día tal, busca en el contexto las tareas completadas y pendientes de esa fecha.\n` +
    `3. Si te preguntan sobre recomendaciones para una idea, da consejos creativos estructurados, inspiradores y realistas con estilo emprendedor.\n` +
    `4. Responde SIEMPRE en español.\n` +
    `5. Mantén un tono tecnológico, optimista y sofisticado.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nPregunta del usuario: ${userInput}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP error ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return reply;
  } catch (error) {
    console.error('Error calling Gemini API, falling back to Local AI:', error);
    return `⚠️ **Error de conexión con Gemini:** No he podido conectar con el servidor externo. Para que no te quedes sin respuesta, he activado el motor local de emergencia:\n\n` + runLocalOfflineAI(userInput, tasks, ideas);
  }
};

export const aiService = {
  async askAI(userInput: string, tasks: Task[], ideas: Idea[], settings: AISettings): Promise<string> {
    // If provider is set to Gemini and API key exists, call Gemini API
    if (settings.selectedProvider === 'gemini' && settings.geminiApiKey && settings.geminiApiKey.trim() !== '') {
      return await runGeminiAI(userInput, tasks, ideas, settings.geminiApiKey.trim());
    }
    
    // Fallback to zero-latency smart offline local AI
    // Simulate a tiny network latency of 400ms for natural premium bubble transition vibe
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(runLocalOfflineAI(userInput, tasks, ideas));
      }, 500);
    });
  }
};
