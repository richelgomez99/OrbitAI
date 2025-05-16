import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { storage } from '../storage';
// For TypeScript Type Annotations (PrismaClient class is also a type for its instances)
import { PrismaClient, User, TaskStatus, Priority } from '@prisma/client';

// For Runtime Enum Values (to bypass CJS/ESM named export issue for values)
import prismaClientDefaultPackage from '@prisma/client';
const TaskStatusRuntimeValues = prismaClientDefaultPackage.TaskStatus;
const PriorityRuntimeValues = prismaClientDefaultPackage.Priority;

// Extend the storage type to include Prisma client
type StorageWithPrisma = typeof storage & {
  prisma: PrismaClient; // This uses the imported PrismaClient type/class correctly
};

// Type for the context
type Context = {
  user?: User; // This uses the imported User type correctly
};

export const taskRouter = router({
  // Get all tasks
  getAll: publicProcedure.query(async () => {
    // For now, we'll use a default user ID
    const defaultUserId = await getDefaultUserId();
    return (storage as StorageWithPrisma).getTasksForUser(defaultUserId);
  }),

  // Create a new task
  create: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      status: z.nativeEnum(TaskStatusRuntimeValues).optional(),
      priority: z.nativeEnum(PriorityRuntimeValues).optional(),
      mode: z.enum(['BUILD', 'FLOW', 'RESTORE'] as const).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }: { 
      input: {
        title: string;
        description?: string;
        status?: TaskStatus; // This uses the imported TaskStatus type correctly
        priority?: Priority; // This uses the imported Priority type correctly
        mode?: 'BUILD' | 'FLOW' | 'RESTORE';
        tags?: string[];
      } 
    }) => {
      const defaultUserId = await getDefaultUserId();
      return (storage as StorageWithPrisma).createTask({
        ...input,
        userId: defaultUserId,
        status: input.status || TaskStatusRuntimeValues.TODO,
        priority: input.priority || PriorityRuntimeValues.MEDIUM,
        mode: input.mode || 'BUILD',
        tags: input.tags || [],
      });
    }),

  // Update a task
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional().nullable(),
      status: z.nativeEnum(TaskStatusRuntimeValues).optional(),
      priority: z.nativeEnum(PriorityRuntimeValues).optional(),
      mode: z.enum(['BUILD', 'FLOW', 'RESTORE'] as const).optional(),
      tags: z.array(z.string()).optional(),
      completedAt: z.date().optional().nullable(),
    }))
    .mutation(async ({ input }: { 
      input: {
        id: string;
        title?: string;
        description?: string | null;
        status?: TaskStatus; // This uses the imported TaskStatus type correctly
        priority?: Priority; // This uses the imported Priority type correctly
        mode?: 'BUILD' | 'FLOW' | 'RESTORE';
        tags?: string[];
        completedAt?: Date | null;
      } 
    }) => {
      const { id, ...data } = input;
      return (storage as StorageWithPrisma).updateTask(id, data);
    }),

  // Delete a task
  delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }: { input: { id: string } }) => {
      const task = await (storage as StorageWithPrisma).deleteTask(input.id);
      return { success: !!task };
    }),
});

// Helper function to get or create a default user
async function getDefaultUserId(): Promise<string> {
  // Try to get the first user
  const users = await (storage as StorageWithPrisma).prisma.user.findMany();
  if (users.length > 0) {
    return users[0].id;
  }
  
  // Create a default user if none exists
  const user = await (storage as StorageWithPrisma).prisma.user.create({
    data: {
      email: 'default@example.com',
      // Remove name as it's not in the User model
    },
  });
  
  return user.id;
}
