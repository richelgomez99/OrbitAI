import OpenAI from 'openai';

// Initialize OpenAI client 
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate task breakdown based on a task title
 * @param taskTitle - The title of the task to break down
 * @returns A list of subtask titles
 */
export async function generateTaskBreakdown(taskTitle: string): Promise<string[]> {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Using fallback subtasks.');
      return [
        "Research and gather requirements",
        "Create initial draft or outline",
        "Review and refine content",
        "Finalize and deliver"
      ];
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an emotionally intelligent productivity assistant that specializes in breaking down complex tasks into smaller, actionable subtasks.

Your task is to analyze the provided task title and create a set of clear, specific subtasks that will help the user make progress.

Follow these guidelines:
1. Create 4-6 specific, actionable subtasks directly related to the main task
2. Start with an easy "quick win" subtask that can be completed in under 10 minutes
3. Order subtasks from easiest/quickest to most complex/time-consuming
4. Each subtask should feel achievable in a single work session
5. Use simple, direct language without fluff or explanation
6. Make subtasks concrete and specific - avoid vague language
7. Adapt the breakdown based on the nature of the task (creative, analytical, etc.)
8. Each subtask should represent meaningful progress toward the larger goal

Your output must be a JSON array of subtask strings with no other text or explanation.`
        },
        {
          role: "user",
          content: `Break down the following task into actionable subtasks, suitable for productivity planning. Keep the subtasks simple, specific, and relevant to the main task:

Task: "${taskTitle}"

Output format should be a JSON object with a "subtasks" array.`
        }
      ],
      response_format: { type: "json_object" }
    });

    if (!response.choices[0].message.content) {
      throw new Error("Failed to generate subtasks");
    }

    const content = JSON.parse(response.choices[0].message.content);
    return content.subtasks || [];
  } catch (error) {
    console.error('Error generating task breakdown:', error);
    // Return default subtasks in case of error
    return [
      "Research and gather information",
      "Create initial plan or outline",
      "Execute first part of the task",
      "Review progress and adjust approach",
      "Complete remaining components"
    ];
  }
}

/**
 * Generate a personalized response to a user message
 * @param userMessage - The message from the user
 * @param userContext - Context about the user (mood, mode, previous messages)
 * @returns AI assistant's response
 */
export async function generateChatResponse(
  userMessage: string,
  userContext: {
    mode: 'build' | 'maintain' | 'recover' | 'reflect';
    mood: 'stressed' | 'motivated' | 'calm';
    energy: number;
    recentMessages?: Array<{role: string, content: string}>;
  }
): Promise<string> {
  try {
    const contextPrompt = `
Current user context:
- Mode: ${userContext.mode} (${
      userContext.mode === 'build' 
        ? 'User is focused on making progress and completing tasks. Be direct, action-oriented, and encouraging.'
        : userContext.mode === 'recover'
        ? 'User needs support during low energy/motivation periods. Be gentle, validating, and suggest small, achievable actions.'
        : userContext.mode === 'reflect'
        ? 'User is in a reflective state, thinking about their work and process. Ask thought-provoking questions and encourage deeper insights.'
        : 'User is maintaining steady progress. Offer balanced guidance to help them stay consistent.'
    })
- Mood: ${userContext.mood} (${
      userContext.mood === 'stressed' 
        ? 'User is feeling overwhelmed or pressured. Use calming language and help reduce cognitive load.'
        : userContext.mood === 'motivated'
        ? 'User is feeling driven and positive. Match their enthusiasm and channel it productively.'
        : 'User is feeling balanced and collected. Maintain this state with measured, thoughtful responses.'
    })
- Energy level: ${userContext.energy}/100 (${
      userContext.energy < 30
        ? 'User has very low energy. Suggest minimal effort actions and validate their need to rest.'
        : userContext.energy < 70
        ? 'User has moderate energy. Suggest balanced activities that won\'t deplete them.'
        : 'User has high energy. Help them channel this productively without burning out.'
    })

Your role is to be an emotionally intelligent productivity assistant. Please respond in a supportive, encouraging tone that matches their current mood and energy level. Keep responses concise (2-4 sentences). Offer practical micro-actions they can take right now to maintain momentum.

Key interaction guidelines:
- If mode=recover and energy<30: Focus on self-compassion and rest
- If mode=build and mood=motivated: Channel enthusiasm into concrete next steps
- If mode=reflect: Ask one thought-provoking question to deepen insight
- Always acknowledge their current state before offering suggestions
- Be human, warm, and personable - not robotic or generic
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: contextPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    return response.choices[0].message.content || "I'm here to help. How can I support you right now?";
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
}

/**
 * Generate a motivational quote based on user context
 * @param context - User's current context (mode, mood, etc.)
 * @returns A motivational quote
 */
export async function generateMotivationalQuote(
  context: {
    mode: 'build' | 'maintain' | 'recover' | 'reflect';
    mood: 'stressed' | 'motivated' | 'calm';
  }
): Promise<string> {
  try {
    const prompt = `Create a short, inspiring quote (maximum 15 words) for someone who is feeling ${
      context.mood
    } and is in ${context.mode} mode (${
      context.mode === 'build' 
        ? 'focused on making progress'
        : context.mode === 'recover'
        ? 'needing support during low energy'
        : context.mode === 'reflect'
        ? 'in a reflective state'
        : 'maintaining steady progress'
    }).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You create concise, emotionally intelligent motivational quotes tailored to the user's current state. Your quotes should:

1. Be under 15 words for maximum impact
2. Acknowledge the user's current emotional state in a validating way
3. Offer a perspective shift that maintains emotional honesty
4. Avoid toxic positivity or dismissing negative emotions
5. Feel like they come from a supportive friend, not a generic poster

Adapt your tone based on:
- For stressed users: Create calming, grounding quotes
- For motivated users: Channel that energy with action-oriented quotes
- For calm users: Provide thoughtful, introspective quotes

Tailor message to their mode:
- Build mode: Focus on momentum and progress
- Recover mode: Focus on self-compassion and rest
- Reflect mode: Focus on insight and learning
- Maintain mode: Focus on consistency and balance`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response.choices[0].message.content || "Progress over perfection.";
  } catch (error) {
    console.error('Error generating motivational quote:', error);
    throw new Error('Failed to generate motivational quote');
  }
}

/**
 * Generate a task reframing suggestion
 * @param taskTitle - Original task title
 * @param taskDescription - Original task description
 * @returns A reframed suggestion for the task
 */
export async function generateTaskReframing(
  taskTitle: string,
  taskDescription?: string
): Promise<{ title: string; description: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You help reframe tasks to make them more approachable and motivating. Break overwhelming tasks into smaller, actionable steps."
        },
        {
          role: "user",
          content: `Please reframe this task to make it more approachable and actionable:
Title: ${taskTitle}
Description: ${taskDescription || "No description provided"}`
        }
      ],
      response_format: { type: "json_object" }
    });

    if (!response.choices[0].message.content) {
      throw new Error("Failed to generate task reframing");
    }

    const content = JSON.parse(response.choices[0].message.content);
    return {
      title: content.title || taskTitle,
      description: content.description || taskDescription || ""
    };
  } catch (error) {
    console.error('Error generating task reframing:', error);
    throw new Error('Failed to generate task reframing');
  }
}