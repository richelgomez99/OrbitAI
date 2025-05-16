import { PrismaClient, type Prisma, TaskStatus, Priority, UserMode, type Task } from '@prisma/client';
import { z } from 'zod';
import { type CreateReflectionInput, type CreateTaskInput, storage } from './storage';
import express, { type Request, type Response, type NextFunction, type Application, type RequestHandler } from 'express';
import { createServer, type Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

type ExpressType = ReturnType<typeof express>;

// Add prisma to the NodeJS global type
declare global {
  var prisma: PrismaClient;
}

// Initialize Prisma Client
const prisma = new PrismaClient();

// Prevent multiple instances of Prisma Client in development
if (process.env.NODE_ENV === 'development') {
  if (!global.prisma) {
    global.prisma = prisma;
  }
}

// Re-export enums from Prisma client for consistency
export type { TaskStatus, Priority, UserMode };

// Initialize Express app
const app: Application = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Task status and priority comparison helpers
function isTaskStatus(value: string): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as any);
}

function isPriority(value: string): value is Priority {
  return Object.values(Priority).includes(value as any);
}

function isUserMode(value: string): value is UserMode {
  return Object.values(UserMode).includes(value as any);
}

// Convert string to TaskStatus with fallback
function toTaskStatus(value: string): TaskStatus {
  const upperValue = value.toUpperCase();
  return isTaskStatus(upperValue) ? upperValue as TaskStatus : 'TODO';
}

// Convert string to Priority with fallback
function toPriority(value: string): Priority {
  const upperValue = value.toUpperCase();
  return isPriority(upperValue) ? upperValue as Priority : 'MEDIUM';
}

// Convert string to UserMode with fallback
function toUserMode(value: string): UserMode {
  const upperValue = value.toUpperCase();
  return isUserMode(upperValue) ? upperValue as UserMode : 'BUILD';
}

// Helper types for route handlers
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Define schemas for request validation
const taskCreateSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty" }),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  mode: z.nativeEnum(UserMode).default(UserMode.BUILD),
  tags: z.array(z.string()).default([]),
  estimatedDuration: z.number().int().nonnegative().optional(),
  dueAt: z.string().datetime().optional().nullable(),
  timeSpentMinutes: z.number().int().min(0).default(0),
  completedAt: z.string().datetime().optional().nullable(),
  userId: z.string().uuid()
});

// Helper function to create a task
async function createTaskHandler(req: Request, res: Response) {
  try {
    const parsedData = taskCreateSchema.parse(req.body);
    // Ensure userId is part of parsedData as per schema, or fetch if not provided and schema allows
    // const userId = parsedData.userId || await getDefaultUserId(); // Assuming schema includes optional userId

    const task = await prisma.task.create({
      data: {
        ...parsedData,
        dueAt: parsedData.dueAt ? new Date(parsedData.dueAt) : null,
        completedAt: parsedData.completedAt ? new Date(parsedData.completedAt) : null,
        // userId is now part of taskCreateSchema and should be validated by Zod
      },
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(400).json({ 
      error: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

const taskUpdateSchema = taskCreateSchema.partial();

const reflectionCreateSchema = z.object({
  userId: z.string().uuid(),
  mode: z.string().transform((val) => {
    switch (val?.toUpperCase()) {
      case 'FLOW': return UserMode.FLOW;
      case 'RESTORE': return UserMode.RESTORE;
      default: return UserMode.BUILD;
    }
  }),
  mood: z.string().min(1, { message: "Mood is required" }),
  energy: z.union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => !isNaN(val) && val >= 0 && val <= 100, {
      message: "Energy must be between 0 and 100"
    }),
  win: z.string().optional(),
  challenge: z.string().optional(),
  journal: z.string().optional(),
  emotionLabel: z.string().optional(),
  cognitiveLoad: z.number().min(1).max(10).optional(),
  control: z.number().min(1).max(10).optional(),
  clarityGained: z.boolean().optional(),
  groundingStrategies: z.array(z.string()).optional().default([])
});

import { DEFAULT_GROUNDING_STRATEGIES, EMOTION_LABELS } from "./constants";
import { handleContextualMessageRequest, ContextualMessageRequestSchema } from './contextual'; // Import contextual message utilities
import {
  generateTaskBreakdown, // Will be temporarily unused due to schema changes
  generateChatResponse,
  generateMotivationalQuote,
  generateTaskReframing,
  type AISuggestion
} from "./openai";
import * as Personality from './personality';

// Helper function to get or create a default user
async function getDefaultUserId(): Promise<string> {
  try {
    const defaultUser = await prisma.user.findFirst();
    if (defaultUser) {
      return defaultUser.id;
    }
    
    // Create a default user if none exists
    const newUser = await prisma.user.create({
      data: {
        email: 'default@example.com',
        // Removed 'name' field as it might not exist on the User model
      }
    });
    return newUser.id;
  } catch (error) {
    console.error('Error in getDefaultUserId:', error);
    // Fallback to a hardcoded ID if all else fails
    return 'default-user-id';
  }
}

export async function registerRoutes(app: ExpressType): Promise<Server> {

  // Define query schema for getting tasks
  const getTasksQuerySchema = z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    mode: z.string().transform(toUserMode).default(UserMode.BUILD),
    limit: z.number().int().positive().max(100).default(10).optional(),
    offset: z.number().int().min(0).default(0).optional()
  });

  // Get all tasks for the default user
  app.get("/api/tasks", (async (req: Request, res: Response) => {
    try {
      const query = getTasksQuerySchema.parse(req.query);
      
      const tasks = await prisma.task.findMany({
        where: {
          status: query.status,
          priority: query.priority,
          mode: query.mode,
          userId: await getDefaultUserId()
        },
        take: query.limit,
        skip: query.offset,
        orderBy: { createdAt: 'desc' }
      });

      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }) as RequestHandler);

  // Get a specific task

  // Helper function to map string status to TaskStatus enum
  const mapToTaskStatus = (status: string): TaskStatus => {
    switch (status?.toUpperCase()) {
      case 'TODO': return TaskStatus.TODO;
      case 'IN_PROGRESS': return TaskStatus.IN_PROGRESS;
      case 'BLOCKED': return TaskStatus.BLOCKED;
      case 'DONE': return TaskStatus.DONE;
      case 'ARCHIVED': return TaskStatus.ARCHIVED;
      case 'PENDING': return TaskStatus.PENDING;
      default: return TaskStatus.TODO;
    }
  };

  // Helper function to map string priority to Priority enum
  const mapToPriority = (priority: string): Priority => {
    switch (priority?.toUpperCase()) {
      case 'LOW': return Priority.LOW;
      case 'MEDIUM': return Priority.MEDIUM;
      case 'HIGH': return Priority.HIGH;
      case 'URGENT': return Priority.URGENT;
      default: return Priority.MEDIUM;
    }
  };

  // Helper function to map string mode to UserMode enum
  const mapToUserMode = (mode: string): UserMode => {
    switch (mode?.toUpperCase()) {
      case 'BUILD': return UserMode.BUILD;
      case 'FLOW': return UserMode.FLOW;
      case 'RESTORE': return UserMode.RESTORE;
      default: return UserMode.BUILD;
    }
  };

  // Create a new task
  app.post('/api/tasks', (async (req: Request, res: Response) => {
    try {
      const taskData = req.body;
      const userId = taskData.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Validate required fields
      if (!taskData.title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      // Map string values to enums with proper fallbacks
      const status = taskData.status 
        ? (typeof taskData.status === 'string' 
          ? mapToTaskStatus(taskData.status) 
          : taskData.status as TaskStatus)
        : TaskStatus.TODO;
      
      const priority = taskData.priority
        ? (typeof taskData.priority === 'string'
          ? mapToPriority(taskData.priority)
          : taskData.priority as Priority)
        : Priority.MEDIUM;
      
      const mode = taskData.mode
        ? (typeof taskData.mode === 'string'
          ? mapToUserMode(taskData.mode)
          : taskData.mode as UserMode)
        : UserMode.BUILD;
      
      // Handle due date - use either dueDate or dueAt, with dueDate taking precedence
      const dueDate = taskData.dueDate || taskData.dueAt;
      
      // Create task input with proper typing and null checks
      const taskInput: CreateTaskInput = {
        title: taskData.title,
        description: taskData.description || null,
        status,
        priority,
        mode,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        estimatedDuration: taskData.estimatedDuration ? Number(taskData.estimatedDuration) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId
      };
      
      // Create the task
      const task = await storage.createTask(taskInput);
      
      // Prepare any additional updates needed
      const updateData: Record<string, any> = {};
      let needsUpdate = false;
      
      if (taskData.timeSpentMinutes !== undefined) {
        updateData.timeSpentMinutes = Number(taskData.timeSpentMinutes) || 0;
        needsUpdate = true;
      }
      
      if (taskData.completedAt !== undefined) {
        updateData.completedAt = taskData.completedAt 
          ? new Date(taskData.completedAt as string) 
          : null;
        needsUpdate = true;
      }
      
      // If we have fields to update, do it in a separate call
      if (needsUpdate) {
        await storage.updateTask(task.id, updateData);
        // Get the updated task
        const updatedTask = await storage.getTaskById(task.id, await getDefaultUserId());
        return res.json(updatedTask);
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ 
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }) as RequestHandler);

  // Task endpoints
  
  // Create a new task
  app.post('/api/tasks', (async (req: Request, res: Response) => {
    try {
      const taskData = req.body;
      const userId = taskData.userId || await getDefaultUserId();
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Validate required fields
      if (!taskData.title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      // Map string values to enums with proper fallbacks
      const status = taskData.status 
        ? (typeof taskData.status === 'string' 
          ? toTaskStatus(taskData.status) 
          : taskData.status as TaskStatus)
        : TaskStatus.TODO;
      
      const priority = taskData.priority
        ? (typeof taskData.priority === 'string'
          ? toPriority(taskData.priority)
          : taskData.priority as Priority)
        : Priority.MEDIUM;
      
      const mode = taskData.mode
        ? (typeof taskData.mode === 'string'
          ? toUserMode(taskData.mode)
          : taskData.mode as UserMode)
        : UserMode.BUILD;
      
      // Handle due date - use either dueDate or dueAt, with dueDate taking precedence
      const dueDate = taskData.dueDate || taskData.dueAt;
      
      // Create task input with proper typing and null checks
      const taskInput: CreateTaskInput = {
        title: taskData.title,
        description: taskData.description || null,
        status,
        priority,
        mode,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        estimatedDuration: taskData.estimatedDuration ? Number(taskData.estimatedDuration) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId
      };
      
      // Create the task
      const task = await storage.createTask(taskInput);
      res.status(201).json(task);
      
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ 
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }) as RequestHandler);

  // Update an existing task (support both PUT and PATCH)
  const handleUpdateTask = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: Record<string, any> = { ...req.body };
      
      // Handle enum conversions if they exist in the update data
      if (updateData.status) {
        updateData.status = typeof updateData.status === 'string' 
          ? toTaskStatus(updateData.status) 
          : updateData.status;
      }
      
      if (updateData.priority) {
        updateData.priority = typeof updateData.priority === 'string'
          ? toPriority(updateData.priority)
          : updateData.priority;
      }
      
      if (updateData.mode) {
        updateData.mode = typeof updateData.mode === 'string'
          ? toUserMode(updateData.mode)
          : updateData.mode;
      }
      
      // Handle date fields - support both dueDate and dueAt, with dueDate taking precedence
      if ('dueDate' in updateData || 'dueAt' in updateData) {
        const dueDate = updateData.dueDate || updateData.dueAt;
        updateData.dueDate = !dueDate || dueDate === 'null' ? null : new Date(dueDate);
        // Remove the old key if it exists
        if ('dueAt' in updateData) delete updateData.dueAt;
      }
      
      if ('completedAt' in updateData) {
        updateData.completedAt = !updateData.completedAt || updateData.completedAt === 'null'
          ? null 
          : new Date(updateData.completedAt);
      }
      
      // Convert string numbers to actual numbers
      if ('estimatedDuration' in updateData) {
        updateData.estimatedDuration = updateData.estimatedDuration 
          ? Number(updateData.estimatedDuration) 
          : null;
      }
      
      if ('timeSpentMinutes' in updateData) {
        updateData.timeSpentMinutes = updateData.timeSpentMinutes 
          ? Number(updateData.timeSpentMinutes) 
          : 0;
      }
      
      // Ensure we're not trying to update the userId
      if ('userId' in updateData) {
        delete updateData.userId;
      }
      
      // Update the task
      const updatedTask = await storage.updateTask(id, updateData);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ 
        error: 'Failed to update task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Register both PUT and PATCH for task updates
  app.put('/api/tasks/:id', handleUpdateTask as RequestHandler);
  app.patch('/api/tasks/:id', handleUpdateTask as RequestHandler);

  // Get a single task by ID for debugging
  app.get('/api/debug/tasks/:taskId', (async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const task = await storage.getTaskById(taskId, await getDefaultUserId());
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      console.error('Error fetching task for debug:', error);
      return res.status(500).json({
        error: 'Failed to fetch task',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as RequestHandler);

  // Get reflections for the default user
  const getReflectionsHandler = async (req: Request, res: Response) => {
    try {
      const userId = await getDefaultUserId(); // Assuming reflections are for the default user
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
      const cursor = req.query.cursor as string | undefined;

      const result = await storage.getReflections({
        userId,
        limit,
        ...(cursor ? { cursor } : {}),
      });

      res.json({
        items: result.items,
        nextCursor: result.nextCursor,
      });
    } catch (error) {
      console.error('Failed to fetch reflections:', error);
      return res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  };

  app.get('/api/reflections', getReflectionsHandler as RequestHandler);

  const httpServer = createServer(app);
  return httpServer;
}
