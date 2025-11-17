/**
 * Frontend task types.
 * Now importing from server types for consistency and single source of truth.
 *
 * IMPORTANT: These types now match the Prisma schema exactly.
 * All database operations use these unified types.
 */

// Re-export types and enums from server (which come from Prisma)
export type {
  Task,
  Subtask,
  TaskFilters,
} from '../../../server/types';

export {
  TaskStatus,
  Priority,
  UserMode,
} from '../../../server/types';

// Type aliases for backward compatibility
export type { TaskStatus as TaskStatusType } from '../../../server/types';
export type { Priority as PriorityType } from '../../../server/types';
export type { UserMode as UserModeType } from '../../../server/types';
