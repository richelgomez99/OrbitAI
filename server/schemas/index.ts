import { z } from 'zod';
import { UserMode, TaskStatus, Priority } from '@prisma/client';

// Common schemas
export const userIdSchema = z.string().min(1, 'User ID is required');

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  cursor: z.string().optional(),
});

// Focus Session schemas
export const startSessionSchema = z.object({
  userId: userIdSchema,
  mode: z.nativeEnum(UserMode),
  taskId: z.string().optional(),
  energyStart: z.number().min(0).max(100).optional(),
  focusScore: z.number().min(0).max(100).optional(),
});

export const endSessionSchema = z.object({
  userId: userIdSchema,
  sessionId: z.string().min(1, 'Session ID is required'),
  energyEnd: z.number().min(0).max(100).optional(),
  focusScore: z.number().min(0).max(100).optional(),
  reflection: z.string().optional(),
});

// Mode Transition schemas
export const logTransitionSchema = z.object({
  userId: userIdSchema,
  fromMode: z.nativeEnum(UserMode),
  toMode: z.nativeEnum(UserMode),
  durationSeconds: z.number().int().positive(),
  trigger: z.enum(['manual', 'auto', 'timeout', 'task_completion']).default('manual'),
  metadata: z.record(z.unknown()).optional(),
});

// User State schemas
export const userStateSchema = z.object({
  userId: userIdSchema,
  mood: z.number().min(0).max(100).optional(),
  energy: z.number().min(0).max(100).optional(),
  focus: z.number().min(0).max(100).optional(),
  stress: z.number().min(0).max(100).optional(),
  currentMode: z.nativeEnum(UserMode).optional(),
  currentTaskId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Task schemas
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default('TODO'),
  priority: z.nativeEnum(Priority).default('MEDIUM'),
  estimatedMinutes: z.number().int().positive().optional(),
  mode: z.nativeEnum(UserMode).default('BUILD'),
  tags: z.array(z.string()).default([]),
  dueAt: z.date().optional(),
});

export const updateTaskSchema = taskSchema.partial();

// Reflection schemas
export const reflectionSchema = z.object({
  userId: userIdSchema,
  sessionId: z.string().optional(),
  mood: z.string().min(1, 'Mood is required'),
  moodEmoji: z.string().optional(),
  energy: z.number().min(0).max(100),
  wins: z.string().optional(),
  challenges: z.string().optional(),
  journalEntry: z.string().optional(),
  emotionLabel: z.string().optional(),
  cognitiveLoad: z.number().min(0).max(100).optional(),
  controlRating: z.number().min(1).max(5).optional(),
  clarityGained: z.boolean().optional(),
  groundingSources: z.array(z.string()).default([]),
  mode: z.nativeEnum(UserMode),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
export type LogTransitionInput = z.infer<typeof logTransitionSchema>;
export type UserStateInput = z.infer<typeof userStateSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ReflectionInput = z.infer<typeof reflectionSchema>;
