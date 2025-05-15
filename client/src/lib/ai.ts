import { apiRequest } from "./queryClient";
import { Mode, Mood } from "./utils";

// Define context structures for sending messages to the AI assistant
interface AssistantTaskContext {
  id: string;
  title: string;
  description?: string;
  priority: string; // 'low', 'medium', 'high'
  due: string | null; // Formatted due date or null
  status: "todo" | "done" | "snoozed"; // Should primarily be "todo" for context
  estimatedTime?: number; // in minutes
  pendingSubtaskCount?: number;
  pendingSubtaskTitles?: string[]; // Titles of first few (e.g., 2-3) pending subtasks
  tags?: string[];
}

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
interface AssistantContext {
  mode: Mode;
  motivation: Mood; // Assuming Mood type can represent motivation strings like 'motivated', 'stressed', 'calm'
  energy: number;
  tasks: AssistantTaskContext[]; // Uses the updated, richer AssistantTaskContext
}

export async function sendMessageToAssistant(
  content: string,
  context: AssistantContext
): Promise<any> { // Changed return type from Promise<string> to Promise<any>
  try {
    const response = await apiRequest("POST", "/api/messages", {
      content,
      mode: context.mode,
      motivation: context.motivation, // Changed from mood to motivation
      energy: context.energy,
      tasks: context.tasks // Pass new tasks array
    });
    
    const data = await response.json();
    return data.assistant; // Return the whole assistant object
  } catch (error) {
    console.error("Error sending message to assistant:", error);
    return { content: "I'm here to help you maintain momentum. What specific challenge are you facing right now?" }; // Return as an object to match new signature
  }
}