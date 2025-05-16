export const DEFAULT_GROUNDING_STRATEGIES = [
  'Walk', 'Nap', 'Music', 'Meditation', 
  'Breathwork', 'Stretching', 'Conversation', 'Quiet time'
] as const;

export const EMOTION_LABELS = [
  { value: 'overstimulated', label: '😵‍💫 Overstimulated' },
  { value: 'at_ease', label: '😌 At Ease' },
  { value: 'focused', label: '🎯 Focused' },
  { value: 'scattered', label: '🌪️ Scattered' },
  { value: 'energized', label: '⚡ Energized' },
  { value: 'drained', label: '🪫 Drained' },
  { value: 'creative', label: '🎨 Creative' },
  { value: 'blocked', label: '🧱 Blocked' },
] as const;
