import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Mode = "build" | "flow" | "restore";
export type Mood = "happy" | "neutral" | "sad" | "anxious" | "energized" | "tired" | "stressed" | "motivated" | "calm";
export type Priority = "low" | "medium" | "high";

// Define task status as a union type to ensure type safety
export type TaskStatus = 'todo' | 'inprogress' | 'done' | 'blocked' | 'pending';

// Type guard to check if a string is a valid TaskStatus
export function isTaskStatus(value: string): value is TaskStatus {
  return ['todo', 'inprogress', 'done', 'blocked', 'pending'].includes(value.toLowerCase());
}

// Normalize task status to ensure it matches the TaskStatus type
export function normalizeTaskStatus(status: string): TaskStatus {
  const lowerStatus = status.toLowerCase();
  if (isTaskStatus(lowerStatus)) {
    return lowerStatus;
  }
  return 'todo'; // Default to 'todo' if status is invalid
}

export interface Task {
  id: string;
  user_id: string; // Changed from userId, made non-optional string
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  estimatedTime?: number; // in minutes
  dueDate?: Date;
  mode?: Mode;
  subtasks?: { id: string; title: string; done: boolean }[];
  tags?: string[];
  friction?: number; // Tracks how many times a task has been snoozed
  lastUpdated?: Date;
  updatedAt?: Date; // For tracking when the task was last updated
  isAiGenerated?: boolean;
  createdAt: Date;
}

export interface ReflectionEntry {
  id: string;
  userId: string; // To associate with the user
  date: Date;
  wins: string;
  struggles: string;
  journalEntry?: string; // Optional, but can be a longer text
  mood?: Mood; // Optional, using the existing Mood type
  tags?: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const motivationalQuotes = [
  "Clarity compounds. Each moment of focus builds on the last.",
  "Concentration is the key to accomplishment.",
  "Stay focused — clarity compounds.",
  "Small actions, consistently taken, create momentum.",
  "Build in small batches, ship often.",
  "Yesterday's home runs don't win today's games.",
  "Progress over perfection."
];

export function getRandomQuote(): string {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

export function formatDueDate(date?: Date): string {
  if (!date) return "";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  
  if (dueDate.getTime() === today.getTime()) {
    return "Today";
  } else if (dueDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  } else {
    return dueDate.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour < 5) return 'night'; // Before 5 AM is night
  if (hour < 12) return 'morning'; // 5 AM to 11:59 AM is morning
  if (hour < 18) return 'afternoon'; // 12 PM to 5:59 PM is afternoon
  if (hour < 22) return 'evening'; // 6 PM to 9:59 PM is evening
  return 'night'; // 10 PM onwards is night
};

// Mode-specific theme colors and styling
export interface ModeTheme {
  accentHsl: string; // HSL string value, e.g., "260 81% 61%"
  label: string;
  emoji: string;
  description?: string; // Optional description for mode switcher
}

export interface ModeConfig extends ModeTheme {
  bgGradient: string;
  textColor: string;
  buttonVariant: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  focusRing: string;
  taskCardClass: string;
  headerClass: string;
  description: string;
  tips: string[];
}

export const MODE_CONFIG: Record<Mode, ModeConfig> = {
  build: {
    accentHsl: '260 81% 61%',
    label: 'Build',
    emoji: '🚀',
    bgGradient: 'from-purple-600/10 to-indigo-600/10',
    textColor: 'text-purple-200',
    buttonVariant: 'default',
    focusRing: 'focus-visible:ring-purple-500',
    taskCardClass: 'border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-indigo-900/30',
    headerClass: 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80',
    description: 'Focused execution mode for deep work and progress',
    tips: [
      'Break down large tasks into smaller, actionable items',
      'Use time blocking to maintain focus',
      'Leverage the Pomodoro technique for sustained concentration'
    ]
  },
  flow: {
    accentHsl: '200 75% 55%',
    label: 'Flow',
    emoji: '🌊',
    bgGradient: 'from-sky-600/10 to-blue-600/10',
    textColor: 'text-sky-200',
    buttonVariant: 'secondary',
    focusRing: 'focus-visible:ring-sky-500',
    taskCardClass: 'border-sky-500/30 bg-gradient-to-br from-sky-900/30 to-blue-900/30',
    headerClass: 'bg-gradient-to-r from-sky-900/80 to-blue-900/80',
    description: 'Minimalist mode for distraction-free productivity',
    tips: [
      'Focus on one task at a time',
      'Let the system handle notifications and distractions',
      'Use the ambient theme to maintain focus'
    ]
  },
  restore: {
    accentHsl: '271 70% 70%',
    label: 'Restore',
    emoji: '🌿',
    bgGradient: 'from-violet-600/10 to-fuchsia-600/10',
    textColor: 'text-violet-200',
    buttonVariant: 'outline',
    focusRing: 'focus-visible:ring-violet-500',
    taskCardClass: 'border-violet-500/30 bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30',
    headerClass: 'bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80',
    description: 'Gentle mode for recovery and self-care',
    tips: [
      'Take regular breaks and stretch',
      'Practice mindfulness between tasks',
      'Celebrate small wins and progress'
    ]
  }
} as const;

export function getModeTheme(mode: Mode): ModeConfig {
  return MODE_CONFIG[mode] || {
    ...MODE_CONFIG.build,
    label: 'Unknown',
    emoji: '❓',
    description: 'Mode not recognized',
  };
}

// Mood emoji mapping
export function getMoodEmoji(mood: Mood): string {
  switch(mood) {
    case 'motivated': return '😊';
    case 'stressed': return '😰';
    case 'calm': return '😌';
    default: return '😊';
  }
}

// Mode color utility for TaskCard borders and backgrounds
export const modeColors: Record<Mode, string> = {
  build: "bg-purple-600/10 border-purple-500",
  flow: "bg-sky-600/10 border-sky-500",
  restore: "bg-violet-600/10 border-violet-500", // Corresponds to 'Soft Purple' in design spec
};

// Helper function to parse estimated time string to minutes
export function parseEstimatedTime(timeString?: string): number | undefined {
  if (!timeString) return undefined;

  const lowerTimeString = timeString.toLowerCase();
  let totalMinutes = 0;

  const hourMatch = lowerTimeString.match(/(\d+)\s*hour(s?)/);
  if (hourMatch && hourMatch[1]) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }

  const minuteMatch = lowerTimeString.match(/(\d+)\s*min(ute)?(s?)/);
  if (minuteMatch && minuteMatch[1]) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }
  
  // Handle cases like "1.5 hours"
  const decimalHourMatch = lowerTimeString.match(/(\d+\.\d+)\s*hour(s?)/);
  if (decimalHourMatch && decimalHourMatch[1] && !hourMatch) { // Avoid double counting if "1 hour" also present
    totalMinutes += parseFloat(decimalHourMatch[1]) * 60;
  }

  return totalMinutes > 0 ? totalMinutes : undefined;
}

// Energy level formatting and styling
export function getEnergyDisplay(energy: number): { icon: string; color: string } {
  if (energy > 70) {
    return { icon: '⚡', color: 'text-green-400' };
  } else if (energy > 30) {
    return { icon: '⚡', color: 'text-amber-400' };
  } else {
    return { icon: '🔋', color: 'text-red-400' };
  }
}
