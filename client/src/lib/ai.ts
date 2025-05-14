import { apiRequest } from "./queryClient";
import { Mode, Mood } from "./utils";

/**
 * Generate AI-powered task subtasks based on a title
 * @param title The task title to break down
 * @returns An array of generated subtask titles
 */
export async function generateSubtasks(title: string): Promise<string[]> {
  try {
    const response = await apiRequest("POST", "/api/tasks/subtasks", { title });
    const data = await response.json();
    return data.subtasks || [];
  } catch (error) {
    console.error("Error generating subtasks:", error);
    // Default subtasks if API call fails
    return [
      "Research topic",
      "Create outline",
      "Draft content",
      "Review and finalize"
    ];
  }
}

/**
 * Generate a motivational quote based on the user's context
 * @param mode The current mode (build, recover, etc.)
 * @param mood The current mood (motivated, stressed, etc.)
 * @returns A motivational quote
 */
export async function getMotivationalQuote(mode: Mode, mood: Mood): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/quotes", { mode, mood });
    const data = await response.json();
    return data.quote || "Progress over perfection.";
  } catch (error) {
    console.error("Error fetching motivational quote:", error);
    return "Small actions, consistently taken, create momentum.";
  }
}

/**
 * Send a message to the AI assistant
 * @param content The message content
 * @param context The user context information
 * @returns The assistant's response
 */
export async function sendMessageToAssistant(
  content: string,
  context: {
    mode: Mode;
    mood: Mood;
    energy: number;
  }
): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/messages", {
      content,
      mode: context.mode,
      mood: context.mood,
      energy: context.energy
    });
    
    const data = await response.json();
    return data.assistant.content;
  } catch (error) {
    console.error("Error sending message to assistant:", error);
    return "I'm here to help you maintain momentum. What specific challenge are you facing right now?";
  }
}