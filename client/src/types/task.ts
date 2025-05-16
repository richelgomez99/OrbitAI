export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'ARCHIVED' | 'PENDING';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  completedAt?: Date | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
  energyLevel?: number | null;
  timeOfDay?: string | null;
  externalId?: string | null;
  externalSource?: string | null;
  externalMetadata?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  content?: string;
  mode?: string;
  frictionNotes?: string | null;
  archived?: boolean;
}
