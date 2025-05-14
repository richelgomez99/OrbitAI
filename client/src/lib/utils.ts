import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Mode = "build" | "maintain" | "recover" | "reflect";
export type Mood = "stressed" | "motivated" | "calm";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  userId?: number | null;
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
  date: Date;
  mood: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  tags: string[];
  comment?: string;
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
  accent: string;
  accentHex: string;
  accentLight: string;
  accentLightHex: string;
  text: string;
  border: string;
  gradient: string;
  emoji: string;
  tag: string;
  tagText: string;
  modeLabel: string;
}

export function getModeTheme(mode: Mode): ModeTheme {
  switch(mode) {
    case 'build':
      return {
        accent: 'bg-[#9F7AEA]',
        accentHex: '#9F7AEA',
        accentLight: 'bg-[#9F7AEA]/20',
        accentLightHex: 'rgba(159, 122, 234, 0.2)',
        text: 'text-[#9F7AEA]',
        border: 'border-[#9F7AEA]/40',
        gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/5',
        emoji: '⚡️',
        tag: 'bg-purple-800/30',
        tagText: 'text-purple-300',
        modeLabel: 'Build'
      };
    case 'maintain':
      return {
        accent: 'bg-[#63B3ED]',
        accentHex: '#63B3ED',
        accentLight: 'bg-[#63B3ED]/20',
        accentLightHex: 'rgba(99, 179, 237, 0.2)',
        text: 'text-[#63B3ED]',
        border: 'border-[#63B3ED]/40',
        gradient: 'from-blue-400/20 via-blue-500/10 to-blue-600/5',
        emoji: '🔄',
        tag: 'bg-blue-800/30',
        tagText: 'text-blue-300',
        modeLabel: 'Maintain'
      };
    case 'recover':
      return {
        accent: 'bg-[#B2F5EA]',
        accentHex: '#B2F5EA',
        accentLight: 'bg-[#B2F5EA]/20',
        accentLightHex: 'rgba(178, 245, 234, 0.2)',
        text: 'text-[#B2F5EA]',
        border: 'border-[#B2F5EA]/40',
        gradient: 'from-teal-400/20 via-teal-500/10 to-teal-600/5',
        emoji: '❤️‍🩹',
        tag: 'bg-teal-800/30',
        tagText: 'text-teal-300',
        modeLabel: 'Recover'
      };
    case 'reflect':
      return {
        accent: 'bg-[#76E4F7]',
        accentHex: '#76E4F7',
        accentLight: 'bg-[#76E4F7]/20',
        accentLightHex: 'rgba(118, 228, 247, 0.2)',
        text: 'text-[#76E4F7]',
        border: 'border-[#76E4F7]/40',
        gradient: 'from-cyan-400/20 via-cyan-500/10 to-cyan-600/5',
        emoji: '🧠',
        tag: 'bg-cyan-800/30',
        tagText: 'text-cyan-300',
        modeLabel: 'Reflect'
      };
    default:
      return {
        accent: 'bg-[#9F7AEA]',
        accentHex: '#9F7AEA',
        accentLight: 'bg-[#9F7AEA]/20',
        accentLightHex: 'rgba(159, 122, 234, 0.2)',
        text: 'text-[#9F7AEA]',
        border: 'border-[#9F7AEA]/40',
        gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/5',
        emoji: '⚡️',
        tag: 'bg-purple-800/30',
        tagText: 'text-purple-300',
        modeLabel: 'Build'
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
