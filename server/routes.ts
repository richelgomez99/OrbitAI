import prismaPackage from '@prisma/client';
// Import runtime values (enums, PrismaClient constructor)
const { PrismaClient: PrismaClientValue, TaskStatus: TaskStatusValue, Priority: PriorityValue, UserMode: UserModeValue } = prismaPackage;
// Import types (including the Prisma namespace for generated types like Prisma.TaskCreateInput and the PrismaClient type itself)
import type { PrismaClient as PrismaClientType, TaskStatus as TaskStatusType, Priority as PriorityType, UserMode as UserModeType, Prisma } from '@prisma/client';
import { z } from 'zod';

// Type aliases using the directly imported enum types. 
// These are effectively re-naming the imported types, or can be omitted if using imported names directly.
// type TaskStatus = TaskStatus; // Removed conflicting alias
// type Priority = Priority;     // Removed conflicting alias
// type UserMode = UserMode;     // Removed conflicting alias

import { type CreateReflectionInput, type CreateTaskInput, storage } from './storage.js';
import express, { type Request, type Response, type NextFunction, type Application, type RequestHandler } from 'express';
import { createServer, type Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

type ExpressType = ReturnType<typeof express>;

// Add prisma to the NodeJS global type
declare global {
  var prisma: PrismaClientType;
}

// Initialize Prisma Client
const prisma = new PrismaClientValue();

// Prevent multiple instances of Prisma Client in development
if (process.env.NODE_ENV === 'development') {
  if (!global.prisma) {
    global.prisma = prisma;
  }
}

// Re-export enums from Prisma client for consistency - using the imported types
export type { TaskStatusType, PriorityType, UserModeType }; // Re-exporting the imported types

// Initialize Express app
const app: Application = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Task status and priority comparison helpers (using imported enum consts)
function isTaskStatus(value: string): value is TaskStatusType {
  return Object.values(TaskStatusValue).includes(value as any);
}

function isPriority(value: string): value is PriorityType {
  return Object.values(PriorityValue).includes(value as any);
}

function isUserMode(value: string): value is UserModeType {
  return Object.values(UserModeValue).includes(value as any);
}

// Convert string to TaskStatus with fallback
function toTaskStatus(value: string): TaskStatusType {
  const upperValue = value.toUpperCase();
  return isTaskStatus(upperValue) ? upperValue as TaskStatusType : TaskStatusValue.TODO;
}

// Convert string to Priority with fallback
function toPriority(value: string): PriorityType {
  const upperValue = value.toUpperCase();
  return isPriority(upperValue) ? upperValue as PriorityType : PriorityValue.MEDIUM;
}

// Convert string to UserMode with fallback
function toUserMode(value: string): UserModeType {
  const upperValue = value.toUpperCase();
  return isUserMode(upperValue) ? upperValue as UserModeType : UserModeValue.BUILD;
}

// Helper types for route handlers
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Define schemas for request validation (using imported enum consts for nativeEnum)
const taskCreateSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty" }),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatusValue).default(TaskStatusValue.TODO),
  priority: z.nativeEnum(PriorityValue).default(PriorityValue.MEDIUM),
  mode: z.nativeEnum(UserModeValue).default(UserModeValue.BUILD),
  tags: z.array(z.string()).default([]),
  estimatedMinutes: z.number().int().nonnegative().optional(),
  dueAt: z.string().datetime().optional().nullable(),
  timeSpentMinutes: z.number().int().min(0).default(0),
  completedAt: z.string().datetime().optional().nullable(),
  userId: z.string().uuid()
});

// Helper function to create a task
async function createTaskHandler(req: Request, res: Response) {
  try {
    const parsedData = taskCreateSchema.parse(req.body);
    const task = await prisma.task.create({
      data: {
        ...parsedData,
        dueAt: parsedData.dueAt ? new Date(parsedData.dueAt) : null,
        completedAt: parsedData.completedAt ? new Date(parsedData.completedAt) : null,
      },
    });
    res.status(201).json(task);
  } catch (error: any) {
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
  mode: z.string().transform((val: string) => {
    switch (val?.toUpperCase()) {
      case 'FLOW': return UserModeValue.FLOW;
      case 'RESTORE': return UserModeValue.RESTORE;
      default: return UserModeValue.BUILD;
    }
  }),
  mood: z.string().min(1, { message: "Mood is required" }),
  energy: z.union([z.string(), z.number()])
    .transform((val: string | number) => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine((val: number) => !isNaN(val) && val >= 0 && val <= 100, {
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

import { DEFAULT_GROUNDING_STRATEGIES, EMOTION_LABELS } from "./constants.js";
import {
  generateTaskBreakdown,
  generateChatResponse,
  generateMotivationalQuote,
  generateTaskReframing,
  type AISuggestion
} from "./openai.js";
import * as Personality from './personality.js';

// Helper function to get or create a default user
async function getDefaultUserId(): Promise<string> {
  try {
    const defaultUser = await prisma.user.findFirst();
    if (defaultUser) {
      return defaultUser.id;
    }
    
    const newUser = await prisma.user.create({
      data: {
        email: 'default@example.com',
      }
    });
    return newUser.id;
  } catch (error: any) {
    console.error('Error in getDefaultUserId:', error);
    return 'default-user-id'; // Fallback
  }
}

export async function registerRoutes(appParam: ExpressType): Promise<Server> {
  // Renamed app to appParam to avoid conflict with the global app constant

  // Health check endpoint
  appParam.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // Stub for contextual messages
  appParam.post("/api/contextual-message", (req: Request, res: Response) => {
    console.log("[STUB] /api/contextual-message received POST with body:", req.body);
    res.status(200).json({ message: "Contextual message endpoint received.", eventType: req.body?.eventType });
  });

  // Define query schema for getting tasks
  const getTasksQuerySchema = z.object({
    status: z.enum([TaskStatusValue.TODO, TaskStatusValue.IN_PROGRESS, TaskStatusValue.DONE, TaskStatusValue.BLOCKED]).optional(), // Use imported TaskStatus const
    priority: z.enum([PriorityValue.LOW, PriorityValue.MEDIUM, PriorityValue.HIGH, PriorityValue.URGENT]).optional(), // Use imported Priority const
    mode: z.enum([UserModeValue.BUILD, UserModeValue.FLOW, UserModeValue.RESTORE]).optional(), // Use imported UserMode const
    userId: z.string().uuid().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueAt', 'priority', 'title']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    tags: z.string().transform(val => val.split(',').map(tag => tag.trim()).filter(tag => tag)).optional() // Transform comma-separated string to array
  });

  // Get all tasks with optional filtering, sorting, and pagination
  appParam.get('/api/tasks', async (req, res) => {
    try {
      const queryParams = getTasksQuerySchema.parse(req.query);
      const where: Prisma.TaskWhereInput = {};
      if (queryParams.status) where.status = queryParams.status;
      if (queryParams.priority) where.priority = queryParams.priority;
      if (queryParams.mode) where.mode = queryParams.mode;
      if (queryParams.userId) where.userId = queryParams.userId;
      if (queryParams.tags && queryParams.tags.length > 0) {
        where.tags = { hasSome: queryParams.tags };
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy: { [queryParams.sortBy!]: queryParams.sortOrder },
        skip: (queryParams.page! - 1) * queryParams.limit!,
        take: queryParams.limit,
      });

      const totalTasks = await prisma.task.count({ where });

      res.json({
        data: tasks,
        meta: {
          total: totalTasks,
          page: queryParams.page,
          limit: queryParams.limit,
          totalPages: Math.ceil(totalTasks / queryParams.limit!)
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to fetch tasks', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // POST /api/tasks - Create a new task (using existing createTaskHandler)
  appParam.post('/api/tasks', createTaskHandler as AsyncRequestHandler);

  // GET /api/tasks/:id - Get a single task by ID
  appParam.get('/api/tasks/:id', async (req, res) => {
    try {
      const task = await prisma.task.findUnique({
        where: { id: req.params.id },
      });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch task', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // PUT /api/tasks/:id - Update an existing task
  appParam.put('/api/tasks/:id', async (req, res) => {
    try {
      const parsedData = taskUpdateSchema.parse(req.body);
      const task = await prisma.task.update({
        where: { id: req.params.id },
        data: {
          ...parsedData,
          dueAt: parsedData.dueAt ? new Date(parsedData.dueAt) : undefined,
          completedAt: parsedData.completedAt ? new Date(parsedData.completedAt) : undefined,
        },
      });
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: 'Failed to update task', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // DELETE /api/tasks/:id - Delete a task
  appParam.delete('/api/tasks/:id', async (req, res) => {
    try {
      await prisma.task.delete({
        where: { id: req.params.id },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete task', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // POST /api/reflections - Create a new reflection
  appParam.post('/api/reflections', async (req, res) => {
    try {
      const parsedDataFromZod = reflectionCreateSchema.parse(req.body);
      
      // Transform groundingStrategies for Prisma
      const { groundingStrategies: strategyStrings, ...restOfParsedData } = parsedDataFromZod;
      
      const prismaCompatibleData = {
        ...restOfParsedData,
        groundingStrategies: {
          create: (strategyStrings || []).map((strategyName: string) => ({
            name: strategyName,
            mode: restOfParsedData.mode, // Use the reflection's mode for each strategy
          })),
        },
      };

      const reflection = await prisma.reflection.create({
        data: prismaCompatibleData, // Use the transformed data
      });
      res.status(201).json(reflection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: 'Failed to create reflection', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/reflections - Get all reflections (consider pagination for real app)
  appParam.get('/api/reflections', async (req, res) => {
    try {
      const reflections = await prisma.reflection.findMany({
        orderBy: { createdAt: 'desc' }, // Example: order by creation date
      });
      res.json(reflections);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reflections', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/ai/chat - Chat with AI
  appParam.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      const response = await generateChatResponse(message, history || []);
      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: 'AI chat failed', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/ai/quote - Get a motivational quote
  appParam.get('/api/ai/quote', async (req, res) => {
    try {
      const defaultContext = { mode: 'build' as 'build', mood: 'motivated' as 'motivated' }; // Provide a default context
      const quote = await generateMotivationalQuote(defaultContext);
      res.json({ quote });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get quote', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // POST /api/ai/reframe-task - Reframe a task with AI
  appParam.post('/api/ai/reframe-task', async (req, res) => {
    try {
      const { taskDescription } = req.body;
      if (!taskDescription) {
        return res.status(400).json({ error: 'Task description is required' });
      }
      const reframing = await generateTaskReframing(taskDescription);
      res.json({ reframing });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reframe task', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Personality Endpoints (Examples)
  appParam.get('/api/personality/greeting', (req, res) => {
    res.json({ message: Personality.getGreeting() });
  });

  appParam.post('/api/personality/farewell', (req, res) => {
    const name = req.body.name || 'friend';
    // res.json({ message: Personality.getFarewell(name) }); // Personality.getFarewell does not exist
      res.json({ message: `Farewell, ${name}! (Placeholder)` }); // Provide a placeholder response
  });
  
  // Default user ID endpoint
  appParam.get('/api/default-user-id', async (_req, res) => {
    try {
      const userId = await getDefaultUserId();
      res.json({ userId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get default user ID' });
    }
  });

  // Constants endpoints
  appParam.get('/api/constants/emotion-labels', (_req, res) => {
    res.json(EMOTION_LABELS);
  });

  appParam.get('/api/constants/grounding-strategies', (_req, res) => {
    res.json(DEFAULT_GROUNDING_STRATEGIES);
  });

  // Storage related endpoints (if storage.js exports handler functions)
  // Example: assuming storage.js has a getTaskById function for some reason
  // if (storage && typeof storage.getTaskById === 'function') {
  //   appParam.get('/api/storage/tasks/:id', storage.getTaskById as RequestHandler); 
  // }

  // Fallback for unhandled API routes
  appParam.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Create HTTP server
  const server = createServer(appParam);
  return server;
}
