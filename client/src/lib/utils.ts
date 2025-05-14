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
