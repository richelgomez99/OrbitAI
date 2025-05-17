import type { PrismaClient, User, Task, Reflection, GroundingStrategy, GroundingSource, UserState, Message, TaskStatus, Priority, UserMode, Prisma, FocusSession } from '@prisma/client';
import prismaClientDefaultPackage from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export type CreateTaskInput = {
  title: string;
  userId: string;
  description?: string | null;
  content?: string; // Optional alias for description
  dueDate?: Date | string | null; // Alias, will be mapped to dueAt
  dueAt?: Date | string | null;   // Actual field expected by Prisma Task model
  priority?: Priority;
  status?: TaskStatus;
  tags?: string[];
  estimatedMinutes?: number | null;
  timeSpentMinutes?: number | null; // Added, as it's in Prisma model
  // parentId?: string | null; // 'parentId' is not in the Prisma Task model
  // projectId?: string | null; // 'projectId' is not in the Prisma Task model
  order?: number;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
  energyLevel?: number | null;
  timeOfDay?: string | null;
  // dueTime?: Date | null; // dueAt should cover this, or adjust if 'dueTime' is a separate concept
  completedAt?: Date | string | null;
  // deletedAt?: Date | null; // Not a standard field for create, usually handled by soft delete logic elsewhere
  externalId?: string | null;
  externalSource?: string | null;
  externalMetadata?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue; // This is also not in the Prisma Task model
  mode?: UserMode;
  // frictionNotes and archived are not in the Prisma Task model and will be handled in the method
  frictionNotes?: string | null;
  archived?: boolean;
};

export type CreateReflectionInput = {
  userId: string;
  mood: string;
  moodEmoji?: string | null;
  energy: number;
  wins?: string | null;
  challenges?: string | null;
  journalEntry?: string | null;
  emotionLabel?: string | null;
  cognitiveLoad?: number | null;
  controlRating?: number | null;
  clarityGained?: boolean | null;
  groundingStrategies?: Array<{ name: string; mode: UserMode }>;
  sessionId?: string | null;
};

type StartSessionInput = {
  userId: string;
  startTime?: Date;
  energyStart: number;
  energyEnd?: number;
  focusScore?: number;
  intention?: string;
  mode?: UserMode;
  taskId?: string;
};

type LogTransitionInput = {
  userId: string;
  from: UserMode;
  to: UserMode;
  trigger: string;
  metadata?: Record<string, any>;
};

type SaveUserStateInput = {
  userId: string;
  mode: UserMode;
  activeTaskId?: string | null;
  mood?: string;
  energy?: number;
  focus?: number;
  stress?: number;
  currentMode?: UserMode;
  currentTaskId?: string | null;
  metadata?: Record<string, any>;
  context?: Record<string, any>;
};

type ModeTransition = Prisma.ModeTransitionGetPayload<{
  include: { user: true }
}> & {
  from: UserMode; // Alias for fromMode for backward compatibility
  to: UserMode;   // Alias for toMode for backward compatibility
  timestamp: Date; // Alias for createdAt for backward compatibility
};

// Define a type that includes the task relation
interface FocusSessionWithTask extends Omit<Prisma.FocusSessionGetPayload<{
  include: { task: true }
}>, 'interruptions'> {
  interruptions: number | null;
}

// Extend the Prisma types
declare module '@prisma/client' {
  namespace Prisma {
    interface PrismaClientOptions {
      $use?: any;
    }
  }
}

const prisma = new prismaClientDefaultPackage.PrismaClient();

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

  // Reflection Methods
  async createReflection(data: CreateReflectionInput): Promise<Reflection & { groundingStrategies: Array<{ id: string; name: string; mode: UserMode; createdAt: Date; updatedAt: Date; sessionId: string | null; reflectionId: string }> }> {
    const groundingStrategies = data.groundingStrategies || [];
    const { groundingStrategies: _, ...reflectionData } = data;
    
    const reflection = await prisma.reflection.create({
      data: {
        ...reflectionData,
        groundingStrategies: {
          create: groundingStrategies.map(gs => ({
            name: gs.name,
            mode: gs.mode,
          })),
        },
      },
      include: {
        groundingStrategies: {
          select: {
            id: true,
            name: true,
            mode: true,
            createdAt: true,
            updatedAt: true,
            sessionId: true,
            reflectionId: true
          }
        },
      },
    });

    return reflection;
  }

  async getReflections(options: {
    userId: string;
    limit: number;
    cursor?: string;
  }): Promise<{
    items: Array<Reflection & { groundingStrategies: Array<{ id: string; name: string; mode: UserMode; createdAt: Date; updatedAt: Date; sessionId: string | null; reflectionId: string }> }>;
    nextCursor: string | null;
  }> {
    const { userId, limit, cursor } = options;
    
    const reflections = await prisma.reflection.findMany({
      where: { userId },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        groundingStrategies: {
          select: {
            id: true,
            name: true,
            mode: true,
            createdAt: true,
            updatedAt: true,
            sessionId: true,
            reflectionId: true
          }
        },
      },
    });

    let nextCursor: string | null = null;
    if (reflections.length > limit) {
      const nextItem = reflections.pop();
      nextCursor = nextItem?.id || null;
    }

    return {
      items: reflections,
      nextCursor,
    };
  }

  async getReflection(id: string): Promise<(Reflection & { groundingStrategies: Array<{ id: string; name: string; mode: UserMode; createdAt: Date; updatedAt: Date; sessionId: string | null; reflectionId: string }> }) | null> {
    return prisma.reflection.findUnique({ 
      where: { id },
      include: { groundingStrategies: true }
    });
  }

  // Task methods
  async getTasks(
    userId: string, 
    options: {
      status?: TaskStatus;
      priority?: Priority;
      mode?: UserMode;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Task[]> {
    const { status, priority, mode, limit = 100, offset = 0 } = options;
    
    const where: Prisma.TaskWhereInput = { userId };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (mode) where.mode = mode;
    
    return prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getTaskById(id: string, userId: string): Promise<(Task & { content?: string }) | null> {
    return prisma.task.findUnique({ 
      where: { id },
      include: {
        sessions: {
          where: { endTime: null },
          orderBy: { startTime: 'desc' },
          take: 1
        }
      }
    });
  }

  /**
   * Start a new focus session for a task
   */
  async startFocusSession(taskId: string, userId: string, options: {
    energyStart?: number;
    focusScore?: number;
    startTime?: Date;
  } = {}): Promise<FocusSessionWithTask> {
    // End any existing active sessions for this user
    await this.endAllActiveFocusSessions(userId);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { user: true }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Update task status to IN_PROGRESS if it's TODO
    if (task.status === 'TODO') {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    // Create the session and include the task relation
    const session = await prisma.focusSession.create({
      data: {
        task: { connect: { id: taskId } },
        user: { connect: { id: userId } },
        startTime: options.startTime || new Date(),
        energyStart: options.energyStart ?? null,
        focusScore: options.focusScore ?? null,
        mode: task.mode || 'BUILD',
        interruptions: 0
      },
      include: {
        task: true
      }
    });

    return session as FocusSessionWithTask;
  }

  /**
   * End an active focus session
   */
  async endFocusSession(sessionId: string, userId: string, data: {
    energyEnd?: number;
    focusScore?: number;
    interruptions?: number;
    endTime?: Date;
  } = {}): Promise<FocusSessionWithTask> {
    // First get the session with task included
    const session = await prisma.focusSession.findUnique({
      where: { id: sessionId },
      include: { task: true }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (session.endTime) {
      throw new Error('Session already ended');
    }

    const now = new Date();
    const durationMinutes = Math.floor((now.getTime() - session.startTime.getTime()) / (1000 * 60));

    // Update the session and include the task relation in the return value
    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        endTime: data.endTime || now,
        energyEnd: data.energyEnd ?? session.energyEnd,
        focusScore: data.focusScore ?? session.focusScore,
        interruptions: data.interruptions ?? session.interruptions ?? 0,
        updatedAt: now
      },
      include: {
        task: true
      }
    });

    // Update task's time spent
    if (session.taskId) {
      await prisma.task.update({
        where: { id: session.taskId },
        data: {
          timeSpentMinutes: {
            increment: durationMinutes
          },
          updatedAt: now
        }
      });
    }


    return updatedSession as FocusSessionWithTask;
  }

  /**
   * Get all focus sessions for a task
   */
  async getTaskFocusSessions(taskId: string, userId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<FocusSessionWithTask[]> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { userId: true }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const sessions = await prisma.focusSession.findMany({
      where: { taskId },
      include: {
        task: true
      },
      orderBy: { startTime: 'desc' },
      take: options.limit,
      skip: options.offset
    });

    return sessions as FocusSessionWithTask[];
  }

  async createTask(data: CreateTaskInput): Promise<Task> {
    const {
      userId,
      title,
      description,
      content,
      status,
      priority,
      mode,
      estimatedMinutes,
      dueDate,
      dueAt,
      completedAt,
      // frictionNotes, // Not in Prisma Task model
      // archived,      // Not in Prisma Task model
      timeSpentMinutes
      // ... other fields from CreateTaskInput that are in Prisma Task model
    } = data;

    const finalDescription = description ?? content ?? null;
    const finalDueDate = dueAt ?? dueDate;

    const mappedData: Prisma.TaskCreateInput = {
      title,
      description: finalDescription,
      user: { connect: { id: userId } },
      status: status ?? prismaClientDefaultPackage.TaskStatus.TODO,
      priority: priority ?? prismaClientDefaultPackage.Priority.MEDIUM,
      mode: mode ?? prismaClientDefaultPackage.UserMode.BUILD,
      estimatedMinutes: estimatedMinutes ?? null,
      dueAt: finalDueDate ? new Date(String(finalDueDate)) : null, // Ensure string conversion for Date constructor if input can be string
      completedAt: completedAt ? new Date(String(completedAt)) : null, // Ensure string conversion
      timeSpentMinutes: timeSpentMinutes ?? null,
      // Ensure any other fields from CreateTaskInput that ARE in the Prisma Task model are mapped here
      // e.g., if 'order', 'isRecurring', 'recurrenceRule', 'energyLevel', 'timeOfDay' are in Task model:
      // ...(data.order !== undefined && { order: data.order }),
      // ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
      // ...(data.recurrenceRule && { recurrenceRule: data.recurrenceRule }),
      // ...(data.energyLevel !== undefined && { energyLevel: data.energyLevel }),
      // ...(data.timeOfDay && { timeOfDay: data.timeOfDay }),
      // ...(data.externalId && { externalId: data.externalId }),
      // ...(data.externalSource && { externalSource: data.externalSource }),
      // ...(data.externalMetadata && { externalMetadata: data.externalMetadata }),
    };
    // Fields like 'frictionNotes' and 'archived' from CreateTaskInput are intentionally not mapped 
    // to Prisma.TaskCreateInput because they are not in the schema.prisma Task model.
    // If 'metadata' was intended for Prisma, it also needs to be in schema.prisma.Task model.
    
    return prisma.task.create({
      data: mappedData,
    });
  }

  async updateTask(id: string, data: Partial<CreateTaskInput>): Promise<Task> {
    const { userId, ...updateData } = data;
    
    // Map old field names to new ones for backward compatibility
    const mappedData: Record<string, any> = { ...updateData };
    
    // Handle content mapping to description
    if ('content' in updateData) {
      mappedData.description = updateData.content;
    }
    
    // Map estimatedMinutes to estimatedDuration and ensure proper type
    if ('estimatedMinutes' in updateData) {
      const duration = updateData.estimatedMinutes;
      mappedData.estimatedMinutes = duration !== undefined ? 
        (typeof duration === 'string' ? parseInt(duration, 10) : duration) : 
        null;
    }
    
    // Map dueAt to dueDate
    if ('dueAt' in updateData) {
      mappedData.dueDate = updateData.dueAt;
    }
    
    // Map timeSpentMinutes to timeSpent
    if ('timeSpentMinutes' in updateData) {
      mappedData.timeSpent = updateData.timeSpentMinutes ? 
        { create: { minutes: updateData.timeSpentMinutes } } : 
        undefined;
    }
    
    // Handle frictionNotes update
    if ('frictionNotes' in updateData) {
      mappedData.frictionNotes = updateData.frictionNotes;
    }
    
    // Handle archived flag update
    if ('archived' in updateData) {
      mappedData.archived = updateData.archived;
    }
    
    // Only include fields that are defined
    const updateFields: Record<string, any> = {};
    Object.entries(mappedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields[key] = value;
      }
    });
    
    return prisma.task.update({
      where: { id },
      data: updateFields as Prisma.TaskUpdateInput,
    });
  }

  async deleteTask(id: string): Promise<Task | null> {
    return prisma.task.delete({ where: { id } });
  }

  async getTasksForUser(userId: string): Promise<Task[]> {
    return prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
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
  async createFocusSession(data: Prisma.FocusSessionCreateInput): Promise<FocusSessionWithTask> {
    return prisma.focusSession.create({
      data,
      include: {
        task: true
      }
    }) as Promise<FocusSessionWithTask>;
  }

  async updateFocusSession(id: string, data: Prisma.FocusSessionUpdateInput): Promise<FocusSessionWithTask | null> {
    return prisma.focusSession.update({
      where: { id },
      data,
      include: {
        task: true
      }
    }) as Promise<FocusSessionWithTask>;
  }
  
  async endAllActiveFocusSessions(userId: string): Promise<number> {
    // First get the count of sessions that will be ended
    const activeSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        endTime: null
      },
      select: { id: true }
    });

    if (activeSessions.length === 0) {
      return 0;
    }

    // Update all active sessions
    const now = new Date();
    const { count } = await prisma.focusSession.updateMany({
      where: {
        id: {
          in: activeSessions.map(session => session.id)
        }
      },
      data: {
        endTime: now,
        updatedAt: now
      }
    });

    return count;
  }

  async endSession(sessionId: string, data: { energyEnd: number; focusScore: number }): Promise<FocusSessionWithTask> {
    const now = new Date();
    return prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        endTime: now,
        updatedAt: now,
        energyEnd: data.energyEnd,
        focusScore: data.focusScore,
      },
      include: {
        task: true
      }
    }) as Promise<FocusSessionWithTask>;
  }

  // Mode Transition Methods
  async logTransition(data: LogTransitionInput): Promise<ModeTransition> {
    // Get the last transition to calculate duration
    const lastTransition = await prisma.modeTransition.findFirst({
      where: { userId: data.userId },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const durationSeconds = lastTransition
      ? Math.floor((now.getTime() - lastTransition.createdAt.getTime()) / 1000)
      : 0;

    // Create the new transition with user relation
    const transition = await prisma.modeTransition.create({
      data: {
        userId: data.userId,
        fromMode: data.from,
        toMode: data.to,
        durationSeconds,
        trigger: data.trigger,
        metadata: data.metadata || {},
      },
      include: {
        user: true,
      },
    });

    // Update the user's current mode
    await prisma.user.update({
      where: { id: data.userId },
      data: { defaultMode: data.to },
    });

    // Return with aliases for backward compatibility
    return {
      ...transition,
      from: transition.fromMode,
      to: transition.toMode,
      timestamp: transition.createdAt,
    } as ModeTransition;
  }

  async getTransitionsByDate(
    userId: string,
    date: Date,
    options: { limit?: number; offset?: number } = {}
  ): Promise<ModeTransition[]> {
    const { limit = 100, offset = 0 } = options;
    
    // Get the start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const transitions = await prisma.modeTransition.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    
    // Map to include aliases for backward compatibility
    return transitions.map(transition => ({
      ...transition,
      from: transition.fromMode,
      to: transition.toMode,
      timestamp: transition.createdAt,
    } as ModeTransition));
  }

  // User State Methods
  async saveSnapshot(data: SaveUserStateInput): Promise<UserState> {
    // Process numeric fields first to ensure they're numbers
    const processedData = {
      mood: data.mood !== undefined ? 
        (typeof data.mood === 'string' ? parseInt(data.mood, 10) : data.mood) : 
        undefined,
      energy: data.energy !== undefined ? 
        (typeof data.energy === 'string' ? parseInt(data.energy, 10) : data.energy) : 
        undefined,
      focus: data.focus !== undefined ? 
        (typeof data.focus === 'string' ? parseInt(data.focus, 10) : data.focus) : 
        undefined,
      stress: data.stress !== undefined ? 
        (typeof data.stress === 'string' ? parseInt(data.stress, 10) : data.stress) : 
        undefined,
    };

    const stateData: Prisma.UserStateCreateInput = {
      user: { connect: { id: data.userId } },
      ...(processedData.mood !== undefined && { mood: processedData.mood }),
      ...(processedData.energy !== undefined && { energy: processedData.energy }),
      ...(processedData.focus !== undefined && { focus: processedData.focus }),
      ...(processedData.stress !== undefined && { stress: processedData.stress }),
    };
    
    if (data.currentMode) stateData.currentMode = data.currentMode;
    if (data.currentTaskId) stateData.currentTask = { connect: { id: data.currentTaskId } };
    if (data.metadata) stateData.metadata = data.metadata as Prisma.InputJsonValue;
    
    return prisma.userState.create({
      data: stateData,
    });
  }

  async getModeTransitions(userId: string, limit: number = 10): Promise<ModeTransition[]> {
    const transitions = await prisma.modeTransition.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Map to include aliases for backward compatibility
    return transitions.map(transition => ({
      ...transition,
      from: transition.fromMode,
      to: transition.toMode,
      timestamp: transition.createdAt,
    } as ModeTransition));
  }

  async getLatestSnapshot(userId: string): Promise<UserState | null> {
    return prisma.userState.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        currentTask: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async getStateHistory(userId: string, options: { limit?: number; cursor?: string } = {}) {
    const { limit = 10, cursor } = options;
    
    return prisma.userState.findMany({
      where: { 
        userId,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit + 1, // Get one extra for cursor
      orderBy: { createdAt: 'desc' },
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
          description: 'Try out Build, Flow, and Restore modes.',
          status: 'TODO',
          priority: 'HIGH',
          estimatedMinutes: 60,
          mode: 'BUILD',
          userId: user.id
        });

        await storage.createTask({
          title: 'Plan next week\'s project sprint',
          description: 'Break down into smaller, manageable tasks.',
          status: 'TODO',
          priority: 'MEDIUM',
          estimatedMinutes: 120,
          mode: 'BUILD',
          userId: user.id
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
