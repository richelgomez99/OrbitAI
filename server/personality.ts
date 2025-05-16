// Mode-specific greetings
export const modeGreetings = {
  build: "Build mode activated. Let's focus and move with intent. What's the first step?",
  restore: "Restore mode enabled. Time to breathe and come back to center. Gentle focus is key.",
  flow: "Entering Flow mode. You're in the zone. Stay light, stay deep. I'll keep distractions at bay."
};

// Mood reflection responses
export const reflectionResponses = {
  positive_mood: "That's a great insight. Acknowledging your progress and positive feelings is key to maintaining momentum.",
  neutral_mood: "Thanks for sharing that. Taking time to reflect, whatever the feeling, is always valuable.",
  negative_mood: "It's okay to have challenging moments or feel a bit off. Acknowledging it is the first step. What's one small thing you could do to shift your energy, even slightly?"
};

// Low energy prompts
export const lowEnergyPrompts = [
  "I sense your energy is a bit low. A short break, even 5 minutes, can make a difference. Or perhaps a less demanding task?",
  "Feeling a bit drained? Gentle movement or a change of scenery might help. We could also find a low-stress task to ease into.",
  "It's perfectly fine to operate at a lower energy sometimes. Would you prefer to switch to 'Recover' mode or tackle a simple, quick task?"
];

// No task prompts
export const noTaskPrompts = [
  "Looks like your task list is clear for now. Would you like a suggestion for what to focus on next, or perhaps set an intention?",
  "No active task at the moment. A good opportunity to plan your next move, reflect on your progress, or pick something that recharges you. What are you leaning towards?",
  "Your canvas is clear! Shall we brainstorm some ideas, or would you prefer to enjoy this moment of quiet focus?"
];

// General chat nudges
export const chatNudges = [
  "What's on your mind?",
  "How can I assist you right now?",
  "Ready to dive in, or need a moment to map things out?",
  "Is there anything specific you'd like to explore or work on?"
];

// Time-based greetings
export const timeOfDayGreetings = {
  morning: "Good morning! Ready to make the most of the day?",
  afternoon: "Hope you're having a productive afternoon.",
  evening: "As the day winds down, what would you like to focus on or wrap up?",
  night: "Working late? Remember to take care of yourself."
};

/**
 * Gets a greeting based on the time of day
 * @param timeOfDay The time of day ('morning', 'afternoon', 'evening', 'night')
 * @returns A greeting message
 */
export function getGreeting(timeOfDay: string = ''): string {
  const timeKey = timeOfDay.toLowerCase() as keyof typeof timeOfDayGreetings;
  return timeOfDayGreetings[timeKey] || "Hello! How can I help you today?";
}

/**
 * Gets a mode switch message
 * @param mode The mode being switched to
 * @returns A message about the mode switch
 */
export function getModeSwitchMessage(mode: string = ''): string {
  const modeKey = mode.toLowerCase() as keyof typeof modeGreetings;
  return modeGreetings[modeKey] || "Let's get started. What would you like to focus on?";
}

/**
 * Gets a reflection response based on mood
 * @param mood The user's current mood
 * @returns A response message
 */
export function getReflectionResponse(mood: string = 'neutral'): string {
  const moodLower = mood.toLowerCase();
  
  if (moodLower.includes('happy') || moodLower.includes('good') || moodLower.includes('great')) {
    return reflectionResponses.positive_mood;
  } 
  if (moodLower.includes('sad') || moodLower.includes('tired') || moodLower.includes('anxious')) {
    return reflectionResponses.negative_mood;
  }
  
  return reflectionResponses.neutral_mood;
}

/**
 * Gets a random low energy prompt
 * @returns A random low energy message
 */
export function getLowEnergyMessage(): string {
  return lowEnergyPrompts[Math.floor(Math.random() * lowEnergyPrompts.length)];
}

/**
 * Gets a random no task prompt
 * @returns A random no task message
 */
export function getNoTaskPrompt(): string {
  return noTaskPrompts[Math.floor(Math.random() * noTaskPrompts.length)];
}

/**
 * Gets a random chat nudge
 * @returns A random chat nudge
 */
export function getChatNudge(): string {
  return chatNudges[Math.floor(Math.random() * chatNudges.length)];
}
