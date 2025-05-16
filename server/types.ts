import { User, Task, Reflection, FocusSession, Message, ModeSession, ModeTransition, UserState, Prisma } from '@prisma/client';

// Re-export enums from Prisma client for consistency
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
  ARCHIVED = 'ARCHIVED',
  PENDING = 'PENDING'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum UserMode {
  BUILD = 'BUILD',
  FLOW = 'FLOW',
  RESTORE = 'RESTORE'
}

export type {
  User,
  Task,
  Reflection,
  FocusSession,
  Message,
  ModeSession,
  ModeTransition,
  UserState,
};

// Input types for API endpoints
export interface CreateTaskInput {
  userId: string;
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'PENDING';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  mode?: 'BUILD' | 'FLOW' | 'RESTORE';
  estimatedMinutes?: number;
  dueAt?: Date;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'PENDING';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  mode?: 'BUILD' | 'FLOW' | 'RESTORE';
  estimatedMinutes?: number | null;
  timeSpentMinutes?: number;
  dueAt?: Date | null;
  completedAt?: Date | null;
  tags?: string[];
}

export interface StartSessionInput {
  userId: string;
  mode: 'BUILD' | 'FLOW' | 'RESTORE';
  taskId?: string;
  energyStart: number;
  focusScore: number;
}

export interface EndSessionInput {
  sessionId: string;
  energyEnd: number;
  focusScore: number;
}

export interface CreateReflectionInput {
  userId: string;
  mode: 'BUILD' | 'FLOW' | 'RESTORE';
  mood: string;
  energy: number;
  win?: string;
  challenge?: string;
  journal?: string;
  emotionLabel?: string;
  cognitiveLoad?: number;
  control?: number;
  clarityGained?: boolean;
  groundingStrategies?: Array<{ name: string }>;
}

export interface LogTransitionInput {
  userId: string;
  fromMode: 'BUILD' | 'FLOW' | 'RESTORE';
  toMode: 'BUILD' | 'FLOW' | 'RESTORE';
  durationSeconds: number;
  trigger: 'MANUAL' | 'AUTO' | 'TIMEOUT' | 'TASK_COMPLETION';
  metadata?: Record<string, unknown>;
}

export interface SaveUserStateInput {
  userId: string;
  mood?: number;
  energy?: number;
  focus?: number;
  stress?: number;
  currentMode?: 'BUILD' | 'FLOW' | 'RESTORE';
  currentTaskId?: string | null;
  metadata?: Record<string, unknown>;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
