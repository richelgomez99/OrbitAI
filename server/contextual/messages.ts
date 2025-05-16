import { 
  Mode, 
  Mood, 
  TimeOfDay, 
  Trigger, 
  Context, 
  ContextualMessageRequest, 
  ContextualMessageResponse 
} from './schemas';
import * as Personality from '../personality';

/**
 * Gets the current time of day as a TimeOfDay enum value
 * @returns The current time of day
 */
function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

/**
 * Generates a contextual message based on the trigger and user context (v1 implementation)
 * @param trigger The event that triggered the message
 * @param context Optional context about the user's current state
 * @returns A string containing the generated message
 */
function generateContextualMessageV1(trigger: Trigger, context?: Context): string {
  // Default message if no specific trigger matches
  let message = 'Ready to dive in, or need a moment to map things out?';
  
  // Get current time of day if not provided
  const timeOfDay = context?.timeOfDay || getTimeOfDay();
  
  // Get a random message from the personality module
  const randomMessage = () => {
    const messages = Personality.chatNudges || ['How can I help you today?'];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  // Generate message based on trigger and context
  switch (trigger) {
    case 'mode_change':
      const modeMessage = context?.mode 
        ? `Switching to ${context.mode} mode. ${randomMessage()}`
        : 'Changing modes. ' + randomMessage();
      message = modeMessage;
      break;
      
    case 'reflection_logged':
      const mood = context?.mood || 'neutral';
      const moodLower = mood.toLowerCase();
      if (moodLower.includes('happy') || moodLower.includes('good') || moodLower.includes('great')) {
        message = "I'm glad you're feeling positive! " + randomMessage();
      } else if (moodLower.includes('sad') || moodLower.includes('tired') || moodLower.includes('anxious')) {
        message = "I'm here to help. Remember to take care of yourself. " + randomMessage();
      } else {
        message = "Thanks for checking in. " + randomMessage();
      }
      break;
      
    case 'energy_low':
      message = "I notice your energy is low. Maybe take a short break? " + randomMessage();
      break;
      
    case 'no_task':
      message = 'No tasks in sight. Time to create some or take a well-deserved break?';
      break;
      
    case 'chat_opened':
      const greeting = `Good ${timeOfDay}! `;
      message = greeting + randomMessage();
      break;
      
    default:
      message = randomMessage();
  }
  
  return message;
}

/**
 * Handles a contextual message request and returns a formatted response
 * @param request The contextual message request
 * @returns A promise that resolves to a contextual message response
 */
export async function handleContextualMessageRequest(
  request: ContextualMessageRequest
): Promise<ContextualMessageResponse> {
  const { trigger, context, version = 'v1' } = request;
  
  let message: string;
  
  // Version handling - currently only v1 exists
  switch (version) {
    case 'v1':
    default:
      message = generateContextualMessageV1(trigger, context);
      break;
  }
  
  return {
    version,
    chatMessage: {
      content: message,
      role: 'assistant'
    },
    metadata: {
      trigger,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Returns all available trigger types
 * @returns An array of all valid trigger values
 */
export function getAvailableTriggers(): Trigger[] {
  return Object.values(Trigger.enum);
}

// For backward compatibility
export function generateContextualMessage(trigger: Trigger, context?: Context): string {
  return generateContextualMessageV1(trigger, context);
}

/**
 * Get the default context for a trigger
 */
export function getDefaultContext(trigger: Trigger): Partial<Context> {
  const defaults: Partial<Record<Trigger, Partial<Context>>> = {
    mode_change: { currentMode: 'build' },
    reflection_logged: { mood: 'neutral' },
    energy_low: { energyLevel: 30 },
    no_task: {},
    chat_opened: { timeOfDay: 'afternoon' }
  };
  
  return defaults[trigger] || {};
}
