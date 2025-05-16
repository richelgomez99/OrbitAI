import { PrismaClient, User, Task, Reflection, Message, FocusSession, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class PrismaStorage {
  // User methods
  async getUser(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  // Reflection methods
  async createReflection(data: {
    userId: string;
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
  }): Promise<Reflection> {
    const { userId, groundingStrategies = [], ...reflectionData } = data;
    
    return prisma.reflection.create({
      data: {
        ...reflectionData,
        user: { connect: { id: userId } },
        ...(groundingStrategies.length > 0 && {
          groundingStrategies: {
            create: groundingStrategies
          }
        })
      },
      include: {
        groundingStrategies: true
      }
    });
  }

  async getReflections(options: {
    userId: string;
    limit: number;
    cursor?: string;
  }): Promise<{
    items: Array<Reflection & { groundingStrategies: Array<{ name: string }> }>;
    nextCursor: string | null;
  }> {
    const { userId, limit, cursor } = options;
    
    const items = await prisma.reflection.findMany({
      where: {
        userId,
        ...(cursor ? { id: { lt: cursor } } : {})
      },
      take: limit + 1, // Get one extra to determine next cursor
      orderBy: { createdAt: 'desc' },
      include: {
        groundingStrategies: true
      }
    });

    let nextCursor = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id || null;
    }

    return {
      items: items as Array<Reflection & { groundingStrategies: Array<{ name: string }> }>,
      nextCursor
    };
  }

  // Task methods
  async getTasks(userId: string, options?: {
    status?: 'todo' | 'inprogress' | 'done' | 'blocked' | 'pending';
    priority?: 'low' | 'medium' | 'high';
    mode?: 'build' | 'flow' | 'restore';
    page?: number;
    limit?: number;
  }): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = { userId };

    if (options?.status) {
      where.status = options.status;
    }
    if (options?.priority) {
      where.priority = options.priority;
    }
    if (options?.mode) {
      where.mode = options.mode;
    }

    const take = options?.limit ?? 10; // Default limit to 10
    const skip = options?.page && options.page > 0 ? (options.page - 1) * take : 0; // Default page to 1 (skip 0)

    return prisma.task.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: 'desc' } // Default sort order, can be parameterized later
    });
  }

  async getTask(id: string): Promise<Task | null> {
    return prisma.task.findUnique({ where: { id } });
  }

  async createTask(data: Prisma.TaskCreateInput): Promise<Task> {
    return prisma.task.create({ data });
  }

  async updateTask(id: string, data: Prisma.TaskUpdateInput): Promise<Task | null> {
    return prisma.task.update({ where: { id }, data });
  }

  async deleteTask(id: string): Promise<Task | null> {
    return prisma.task.delete({ where: { id } });
  }

  async getTasksForUser(userId: string): Promise<Task[]> {
    return prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  // Get a single reflection by ID with its grounding strategies
  async getReflection(id: string): Promise<(Reflection & { groundingStrategies: Array<{ name: string }> }) | null> {
    return prisma.reflection.findUnique({ 
      where: { id },
      include: { groundingStrategies: true }
    });
  }

  // Message methods
  async getMessagesForTask(taskId: string): Promise<Message[]> {
    return prisma.message.findMany({ where: { taskId }, orderBy: { createdAt: 'asc' } });
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    return prisma.message.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  }

  async createMessage(data: Prisma.MessageCreateInput): Promise<Message> {
    return prisma.message.create({ data });
  }

  // FocusSession methods
  async createFocusSession(data: Prisma.FocusSessionCreateInput): Promise<FocusSession> {
    return prisma.focusSession.create({ data });
  }

  async updateFocusSession(id: string, data: Prisma.FocusSessionUpdateInput): Promise<FocusSession | null> {
    return prisma.focusSession.update({ where: { id }, data });
  }
  
  async getActiveFocusSession(userId: string): Promise<FocusSession | null> {
    return prisma.focusSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  async endAllActiveFocusSessions(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.focusSession.updateMany({
      where: {
        userId,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    });
  }
}

export const storage = new PrismaStorage();

// Seed initial data
export async function seedInitialData() {
  try {
    const defaultUserEmail = 'user@example.com';
    let user = await storage.getUserByEmail(defaultUserEmail);

    if (!user) {
      console.log('Creating default user...');
      user = await storage.createUser({
        email: defaultUserEmail,
      });
      console.log('Default user created:', user);
    } else {
      console.log('Default user already exists:', user);
    }

    // Check and seed tasks if user exists
    if (user) {
      const taskCount = await prisma.task.count({ where: { userId: user.id } });
      if (taskCount === 0) {
        console.log(`Seeding tasks for user ${user.id}...`);
        await storage.createTask({
          title: 'Explore Orbit AI capabilities',
          content: 'Try out Build, Flow, and Restore modes.',
          status: 'TODO',
          priority: 'HIGH',
          estimatedTime: 60,
          mode: 'BUILD',
          user: { connect: { id: user.id } },
        });

        await storage.createTask({
          title: 'Plan next week\'s project sprint',
          content: 'Break down into smaller, manageable tasks.',
          status: 'TODO',
          priority: 'MEDIUM',
          estimatedTime: 120,
          mode: 'BUILD',
          user: { connect: { id: user.id } },
        });
        console.log('Tasks seeded.');
      } else {
        console.log(`User ${user.id} already has tasks.`);
      }

      // Check and seed messages if user exists
      const messageCount = await prisma.message.count({ where: { userId: user.id }}); 
      if (messageCount === 0) {
          console.log(`Seeding messages for user ${user.id}...`);
          await storage.createMessage({
              role: 'user',
              content: 'What should I focus on today?',
              user: { connect: { id: user.id } }
          });
          await storage.createMessage({
              role: 'assistant',
              content: 'Let\'s review your high-priority tasks. The "Explore Orbit AI capabilities" task seems like a good start!',
              user: { connect: { id: user.id } }
          });
          console.log('Messages seeded.');
      } else {
          console.log(`User ${user.id} already has messages.`);
      }
    } // End of if(user) block

  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}

seedInitialData()
  .catch((e) => {
    console.error('Error in seeding process:', e);
    // process.exit(1); // Optionally exit if seeding is critical
  })
  .finally(async () => {
    // await prisma.$disconnect(); // Disconnecting here might be too soon if server is long-running
  });
