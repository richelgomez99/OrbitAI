import { apiRequest } from "./queryClient";
import { Mode, Mood, Priority, TaskStatus } from "./utils"; // Added Priority and TaskStatus for completeness

// Define context structures for sending messages to the AI assistant
interface AssistantTaskContext {
  id: string;
  title: string;
  description?: string;
  priority: Priority; // 'low', 'medium', 'high'
  due: string | null; // Formatted due date or null
  status: TaskStatus; // Use the TaskStatus type from utils
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

// Client-side interface for AI-suggested tasks
export interface AISuggestion {
  type: 'new_task' | 'chat_prompt'; // Type of suggestion
  title: string;
  description?: string; // For 'new_task'
  priority?: 'low' | 'medium' | 'high'; // For 'new_task'
  estimated_time?: string; // For 'new_task', e.g., "1 hour", "30 minutes"
  tags?: string[]; // For 'new_task'
  mode?: Mode; // Can apply to both, ensures alignment with app's core Mode type
}

// Client-side interface for the assistant's full response
export interface AssistantChatResponse {
  content: string;
  suggestions?: AISuggestion[];
  // Include other potential fields from the backend's 'assistant' object if necessary
  // For example, if the backend also sends id, role, timestamp for the assistant message object:
  // id?: number;
  // role?: 'assistant'; 
  // timestamp?: string;
}

export async function sendMessageToAssistant(
  content: string,
  context: AssistantContext
): Promise<AssistantChatResponse> {
  try {
    const response = await apiRequest("POST", "/api/messages", {
      content,
      mode: context.mode,
      motivation: context.motivation, // Changed from mood to motivation
      energy: context.energy,
      tasks: context.tasks // Pass new tasks array
    });
    
    const data = await response.json();
    // data.assistant is expected to match AssistantChatResponse structure from the server
    if (data.assistantMessage && typeof data.assistantMessage.content === 'string') {
      // The backend sends the full message record as assistantMessage.
      // We need to ensure it aligns with AssistantChatResponse, particularly for 'suggestions'.
      // For now, assume assistantMessageRecord from backend has 'content'. Suggestions are separate.
      return { content: data.assistantMessage.content, suggestions: data.suggestedTasks || [] } as AssistantChatResponse;
    }
    // Fallback or error handling if the structure is not as expected
    console.error('Received unexpected response structure from /api/messages. Expected data.assistantMessage with content string. Data:', data);
    return { content: "Sorry, I encountered an issue processing the response.", suggestions: [] };
  } catch (error) {
    console.error("Error sending message to assistant:", error);
    return { content: "I'm here to help you maintain momentum. What specific challenge are you facing right now?", suggestions: [] };
  }
}