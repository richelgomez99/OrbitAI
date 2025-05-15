import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Mode = "build" | "recover" | "reflect" | "flow";
export type Mood = "stressed" | "motivated" | "calm";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  user_id: string; // Changed from userId, made non-optional string
  title: string;
  description?: string;
  status: "todo" | "done" | "snoozed";
  priority: Priority;
  estimatedTime?: number; // in minutes
  dueDate?: Date;
  mode?: Mode;
  subtasks?: { id: string; title: string; done: boolean }[];
  tags?: string[];
  friction?: number; // Tracks how many times a task has been snoozed
  lastUpdated?: Date;
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

// Mode-specific theme colors and styling
export interface ModeTheme {
  accentHsl: string; // HSL string value, e.g., "260 81% 61%"
  label: string;
  emoji: string;
  description?: string; // Optional description for mode switcher
}

export function getModeTheme(mode: Mode): ModeTheme {
  switch(mode) {
    case 'build':
      return { accentHsl: '260 81% 61%', label: 'Build', emoji: '🛠️', description: 'Execute, progress, deep work.' }; // Electric Indigo
    case 'recover':
      return { accentHsl: '271 70% 70%', label: 'Recover', emoji: '💆‍♀️', description: 'Regain energy, ease in.' }; // Soft Purple for recovery
    case 'reflect':
      return { accentHsl: '337 82% 61%', label: 'Reflect', emoji: '📓', description: 'Self-awareness, pattern tracking.' }; // Rose Pink for introspection
    case 'flow':
      return { accentHsl: '200 75% 55%', label: 'Flow', emoji: '🌊', description: 'Light, reactive, intuitive execution.' }; // Cool Blue for calm efficiency
    default:
      // Fallback, though theoretically unreachable with TypeScript
      console.warn(`Unknown mode: ${mode}, falling back to build theme.`);
      return { accentHsl: '260 81% 61%', label: 'Unknown', emoji: '❓', description: 'Error.' };
      return {
        accentHsl: '260 81% 61%', // #7C3AED Electric Indigo
        label: 'Build',
        emoji: '⚡️'
      };
  }
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
