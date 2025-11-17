import { z } from 'zod';
import { router, authedProcedure } from '../trpc';
import { storage } from '../storage';
import { TRPCError } from '@trpc/server';
// Prisma Client and Types
import { PrismaClient } from '@prisma/client';
// Validation utilities
import { safeString, safeText, safeTags, safeUuid, safeDate } from '../validation';

// Prisma Enums (Runtime Values - CJS/ESM workaround)
import prismaEnumWorkaround from '@prisma/client';
const { TaskStatus, Priority, UserMode } = prismaEnumWorkaround as any;

// Extend the storage type to include Prisma client
type StorageWithPrisma = typeof storage & {
  prisma: PrismaClient;
};

/**
 * Enhanced task creation schema with comprehensive validation.
 *
 * Security features:
 * - HTML sanitization on all text fields
 * - Length limits to prevent DoS
 * - Tag count and size limits
 * - Type-safe enum validation
 */
const taskCreateInputSchema = z.object({
  title: safeString(1, 200), // Required, 1-200 chars, HTML-sanitized
  description: safeText(5000), // Optional, max 5000 chars, HTML-sanitized
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  mode: z.nativeEnum(UserMode).optional(),
  tags: safeTags.optional(), // Max 20 tags, each max 50 chars, HTML-sanitized
  dueDate: safeDate.optional(), // Optional due date
});
type TaskCreateInputType = z.infer<typeof taskCreateInputSchema>;

/**
 * Enhanced task update schema with comprehensive validation.
 */
const taskUpdateInputSchema = z.object({
  id: safeUuid, // Strict UUID validation
  title: safeString(1, 200).optional(),
  description: safeText(5000).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  mode: z.nativeEnum(UserMode).optional(),
  tags: safeTags.optional(),
  completedAt: safeDate.nullable().optional(),
  dueDate: safeDate.nullable().optional(),
});
type TaskUpdateInputType = z.infer<typeof taskUpdateInputSchema>;

/**
 * Task deletion schema with strict UUID validation.
 */
const taskDeleteInputSchema = z.object({
  id: safeUuid, // Strict UUID validation
});

/**
 * Task router - all endpoints require authentication.
 *
 * Security features:
 * - All procedures use authedProcedure (JWT required)
 * - User ID extracted from validated JWT token
 * - Ownership verification before update/delete operations
 * - Clear error messages for unauthorized access
 */
export const taskRouter = router({
  /**
   * Get all tasks for the authenticated user.
   *
   * @requires Authentication
   * @returns Array of tasks belonging to the authenticated user
   */
  getAll: authedProcedure.query(async ({ ctx }) => {
    // ctx.userId is guaranteed to exist due to authedProcedure
    return (storage as StorageWithPrisma).getTasksForUser(ctx.userId);
  }),

  /**
   * Create a new task for the authenticated user.
   *
   * @requires Authentication
   * @param input - Task creation data (title, description, etc.)
   * @returns Created task with generated ID
   */
  create: authedProcedure
    .input(taskCreateInputSchema)
    .mutation(async ({ ctx, input }) => {
      return (storage as StorageWithPrisma).createTask({
        ...input,
        userId: ctx.userId, // Use authenticated user's ID (from JWT)
        status: input.status || TaskStatus.TODO,
        priority: input.priority || Priority.MEDIUM,
        mode: input.mode || UserMode.BUILD,
        tags: input.tags || [],
      });
    }),

  /**
   * Update a task.
   *
   * @requires Authentication
   * @requires Ownership - User must own the task
   * @param input - Task ID and fields to update
   * @returns Updated task
   * @throws NOT_FOUND if task doesn't exist
   * @throws FORBIDDEN if user doesn't own the task
   */
  update: authedProcedure
    .input(taskUpdateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify task ownership before update
      const existingTask = await (storage as StorageWithPrisma).prisma.task.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      if (existingTask.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this task',
        });
      }

      return (storage as StorageWithPrisma).updateTask(id, data);
    }),

  /**
   * Delete a task.
   *
   * @requires Authentication
   * @requires Ownership - User must own the task
   * @param input - Task ID to delete
   * @returns Success status
   * @throws NOT_FOUND if task doesn't exist
   * @throws FORBIDDEN if user doesn't own the task
   */
  delete: authedProcedure
    .input(taskDeleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify task ownership before delete
      const existingTask = await (storage as StorageWithPrisma).prisma.task.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      if (existingTask.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this task',
        });
      }

      const task = await (storage as StorageWithPrisma).deleteTask(input.id);
      return { success: !!task };
    }),
});
