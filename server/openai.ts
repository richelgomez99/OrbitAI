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
 * Interface for AI-suggested tasks.
 */
export interface AISuggestion {
  title: string;
  priority?: 'low' | 'medium' | 'high';
  mode?: 'build' | 'maintain' | 'recover' | 'reflect';
  // Add other fields if the AI should suggest them, e.g., estimatedTime, description_hint
}

/**
 * Interface for the structured response from the AI chat.
 */
export interface AIChatResponse {
  chat_response: string;
  suggested_tasks?: AISuggestion[];
}

/**
 * Generate a personalized response to a user message, optionally including task suggestions.
 * @param userMessage - The message from the user
 * @param userContext - Context about the user (mood, mode, previous messages)
 * @returns A structured object with the AI assistant's response and optional task suggestions.
 */
export async function generateChatResponse(
  userMessage: string,
  userContext: {
    mode: 'build' | 'maintain' | 'recover' | 'reflect';
    mood: 'stressed' | 'motivated' | 'calm';
    energy: number;
    recentMessages?: Array<{role: string, content: string}>;
  }
): Promise<AIChatResponse> {
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

Your role is to be an emotionally intelligent productivity assistant. Your primary goal is to provide a supportive, encouraging chat response (2-4 sentences) that matches the user's current mood and energy level, offering practical micro-actions they can take to maintain momentum.

Additionally, if the conversation naturally leads to potential new tasks that could help the user, you may suggest 1-2 such tasks. These suggestions should be directly relevant to the user's current goals or challenges as discussed.

Key interaction guidelines for chat response:
- If mode=recover and energy<30: Focus on self-compassion and rest.
- If mode=build and mood=motivated: Channel enthusiasm into concrete next steps.
- If mode=reflect: Ask one thought-provoking question to deepen insight.
- Always acknowledge their current state before offering suggestions.
- Be human, warm, and personable - not robotic or generic.

Output Format:
Your entire response MUST be a single JSON object with the following structure:
{
  "chat_response": "Your conversational message to the user (2-4 sentences).",
  "suggested_tasks": [] // Optional: An array of 0-2 suggested task objects. Omit or leave empty if no relevant tasks are suggested.
}

For suggested_tasks, each task object should have a 'title'. Optionally, it can include 'priority' ('low', 'medium', 'high') and 'mode' ('build', 'maintain', 'recover', 'reflect').
Example for suggested_tasks:
"suggested_tasks": [
  {"title": "Draft initial outline for the report", "priority": "medium", "mode": "build"},
  {"title": "Schedule a 15-min break"}
]

Do NOT include any text outside of this JSON object structure.
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
      ],
      response_format: { type: "json_object" }
    });

    if (!response.choices[0].message.content) {
      // Fallback in case of empty content
      return {
        chat_response: "I'm here to help. How can I support you right now?",
      };
    }

    try {
      const parsedResponse = JSON.parse(response.choices[0].message.content) as AIChatResponse;
      // Ensure chat_response is always present
      if (!parsedResponse.chat_response) {
        parsedResponse.chat_response = "I'm having a little trouble forming a thought, but I'm still here to support you!";
      }
      return parsedResponse;
    } catch (e) {
      console.error('Error parsing AI JSON response:', e);
      // Fallback if JSON parsing fails but content exists
      return {
        chat_response: response.choices[0].message.content, // Send raw content if it's not valid JSON
      };
    }

  } catch (error) {
    console.error('Error generating chat response:', error);
    return {
      chat_response: "I seem to be having a little trouble connecting right now. Let's try again in a moment."
    };
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
  taskDescription?: string,
  mode: string = 'build',
  mood: string = 'motivated'
): Promise<{ title: string; description: string }> {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Using fallback reframing.');
      return {
        title: taskTitle,
        description: "Start with the smallest first step that will move this forward."
      };
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a productivity coach specialized in reframing tasks to make them more approachable, motivating, and aligned with a user's current emotional state.

Your expertise is in transforming how a task is perceived, breaking down psychological barriers, and creating a clearer path to action.

Follow these guidelines:
1. Reframe the task to be more specific, concrete, and action-oriented
2. Include a clear first step that feels easy to begin
3. Connect the task to a deeper purpose or value when possible
4. Adjust your reframing based on the user's current mode and mood
5. For stressed users: Simplify and reduce pressure
6. For motivated users: Channel enthusiasm and clarity
7. For calm users: Maintain balance and thoughtfulness
8. Keep your reframing concise and direct

Your output should be a JSON object with a new task title and description that reflects this reframing approach.`
        },
        {
          role: "user",
          content: `Help me reframe this task to make it more approachable and motivating:

Task: "${taskTitle}"
${taskDescription ? `Description: ${taskDescription}` : ''}

Consider my current mode: ${mode}, and mood: ${mood}. Suggest a revised framing or mindset that makes this task more achievable given my current state.

Return a JSON object with "title" and "description" fields only.`
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
    // Fallback response
    return {
      title: taskTitle,
      description: "Break this into smaller steps and focus on one at a time."
    };
  }
}