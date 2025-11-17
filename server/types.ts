/**
 * Shared types exported from Prisma for frontend use.
 *
 * This file provides a single source of truth for types used across
 * both backend and frontend, eliminating type mismatches.
 *
 * Following Constitutional Article II: Type Safety
 */

import type { Prisma } from '@prisma/client';

/**
 * Task type from Prisma with all fields.
 * This is the authoritative definition used by both backend and frontend.
 */
export type Task = Prisma.TaskGetPayload<{
  include: {
    user: false;
    sessions: false;
    messages: false;
    userStates: false;
  };
}>;

/**
 * Subtask structure (stored as JSON in Task.subtasks field).
 */
export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  createdAt?: string; // ISO date string
}

/**
 * Re-export Prisma enums for consistent usage.
 */
export { TaskStatus, Priority, UserMode } from '@prisma/client';

/**
 * Helper type for task filters in queries.
 */
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  archived?: boolean;
  isAiGenerated?: boolean;
}
