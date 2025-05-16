export interface CalmQuote {
  text: string;
  author: string;
  tone: string;
}

export const calmQuotes: CalmQuote[] = [
  {
    text: "The quieter you become, the more you can hear.",
    author: "Ram Dass",
    tone: "Stillness"
  },
  {
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    tone: "Reset"
  },
  {
    text: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit. Then get back to work.",
    author: "Ralph Marston",
    tone: "Renewal"
  },
  {
    text: "You don't always need a plan. Sometimes you just need to breathe, trust, let go, and see what happens.",
    author: "Mandy Hale",
    tone: "Trust"
  },
  {
    text: "The time to relax is when you don't have time for it.",
    author: "Sydney J. Harris",
    tone: "Perspective"
  }
];

export interface SelfCareSuggestion {
  id: string;
  text: string;
  icon: string;
  conditions: {
    energyLevel?: 'low' | 'medium' | 'high';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    previousMode?: 'build' | 'flow' | 'restore';
  };
}

export const selfCareSuggestions: SelfCareSuggestion[] = [
  {
    id: 'hydrate',
    text: 'Take a moment to hydrate. Your brain will thank you.',
    icon: '💧',
    conditions: { energyLevel: 'low' }
  },
  {
    id: 'stretch',
    text: 'Stand up and stretch for 30 seconds. Your body needs movement.',
    icon: '🧘',
    conditions: { previousMode: 'build' }
  },
  {
    id: 'breathe',
    text: 'Take three deep breaths. Inhale peace, exhale tension.',
    icon: '🌬️',
    conditions: {}
  },
  {
    id: 'eye-rest',
    text: 'Rest your eyes for 60 seconds. Look at something 20 feet away.',
    icon: '👁️',
    conditions: { previousMode: 'build' }
  },
  {
    id: 'nature',
    text: 'Step outside for fresh air. Nature resets the mind.',
    icon: '🌳',
    conditions: { timeOfDay: 'afternoon' }
  },
  {
    id: 'gratitude',
    text: "Name one thing you're grateful for right now.",
    icon: '🙏',
    conditions: { timeOfDay: 'evening' }
  }
];
