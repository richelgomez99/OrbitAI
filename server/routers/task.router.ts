import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { storage } from '../storage';
// Prisma Client and Types
import { PrismaClient, Prisma } from '@prisma/client';

// Prisma Enums (Runtime Values - CJS/ESM workaround)
import prismaEnumWorkaround from '@prisma/client';
const { TaskStatus, Priority, UserMode } = prismaEnumWorkaround as any;

// Extend the storage type to include Prisma client
type StorageWithPrisma = typeof storage & {
  prisma: PrismaClient;
};

// Type for the context
type Context = {
  user?: Prisma.User;
};

const taskCreateInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  mode: z.nativeEnum(UserMode).optional(),
  tags: z.array(z.string()).optional(),
});
type TaskCreateInputType = z.infer<typeof taskCreateInputSchema>;

const taskUpdateInputSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  mode: z.nativeEnum(UserMode).optional(),
  tags: z.array(z.string()).optional(),
  completedAt: z.date().optional().nullable(),
});
type TaskUpdateInputType = z.infer<typeof taskUpdateInputSchema>;

export const taskRouter = router({
  // Get all tasks
  getAll: publicProcedure.query(async () => {
    // For now, we'll use a default user ID
    const defaultUserId = await getDefaultUserId();
    return (storage as StorageWithPrisma).getTasksForUser(defaultUserId);
  }),

  // Create a new task
  create: publicProcedure
    .input(taskCreateInputSchema)
    .mutation(async ({ input }: { input: TaskCreateInputType }) => {
      const defaultUserId = await getDefaultUserId();
      return (storage as StorageWithPrisma).createTask({
        ...input,
        userId: defaultUserId,
        status: input.status || TaskStatus.TODO,
        priority: input.priority || Priority.MEDIUM,
        mode: input.mode || UserMode.BUILD,
        tags: input.tags || [],
      });
    }),

  // Update a task
  update: publicProcedure
    .input(taskUpdateInputSchema)
    .mutation(async ({ input }: { input: TaskUpdateInputType }) => {
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
