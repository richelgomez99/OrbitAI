import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; // PrismaStorage instance
import { Prisma } from "@prisma/client"; // Import Prisma for types
import { z } from 'zod';
import {
  generateTaskBreakdown, // Will be temporarily unused due to schema changes
  generateChatResponse,
  generateMotivationalQuote,
  generateTaskReframing,
  type AISuggestion
} from "./openai";
import * as Personality from './personality';

// Placeholder for default user logic
const DEFAULT_USER_EMAIL = 'user@example.com';
let defaultUserId: string | null = null;

async function getDefaultUserId(): Promise<string> {
  if (defaultUserId) {
    return defaultUserId;
  }
  let user = await storage.getUserByEmail(DEFAULT_USER_EMAIL);
  if (!user) {
    user = await storage.createUser({ email: DEFAULT_USER_EMAIL });
  }
  defaultUserId = user.id;
  return defaultUserId;
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Get all tasks for the default user
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const validationResult = getTasksQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid query parameters for fetching tasks",
          errors: validationResult.error.flatten().fieldErrors,
        });
      }

      const userId = await getDefaultUserId();
      const { status, priority, mode, page, limit } = validationResult.data;
      
      // storage.getTasks can now handle these options
      const tasks = await storage.getTasks(userId, {
        status,
        priority,
        mode,
        page,
        limit
      });
      res.json(tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Get a specific task

  const getTasksQuerySchema = z.object({
    status: z.enum(['todo', 'inprogress', 'done', 'blocked', 'pending']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    mode: z.enum(['build', 'flow', 'restore']).optional(),
    page: z.string().optional().default('1').transform(val => parseInt(val, 10)).refine(val => val > 0, { message: "Page must be a positive number" }),
    limit: z.string().optional().default('10').transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, { message: "Limit must be between 1 and 100" })
  });

  // Zod schema for creating a new task
  const createTaskSchema = z.object({
    title: z.string().min(1, { message: "Title cannot be empty" }),
    content: z.string().optional(),
    status: z.enum(['todo', 'inprogress', 'done', 'blocked', 'pending']).optional().transform(val => val ?? 'todo'),
    priority: z.enum(['low', 'medium', 'high']).optional().transform(val => val ?? 'medium'),
    estimatedTime: z.number().int().nonnegative({ message: "Estimated time must be a non-negative integer" }).optional(),
    mode: z.enum(['build', 'flow', 'restore']).optional().transform(val => val ?? 'build')
  });

  // Zod schema for updating an existing task (all fields optional)
  const getTaskByIdSchema = z.object({
    id: z.string().min(1, { message: "Task ID cannot be empty" })
  });

  const updateTaskSchema = z.object({
    title: z.string().min(1, { message: "Title cannot be empty" }).optional(),
    content: z.string().optional(),
    status: z.enum(['todo', 'inprogress', 'done', 'blocked', 'pending']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    estimatedTime: z.number().int().nonnegative({ message: "Estimated time must be a non-negative integer" }).nullable().optional(), // Allow null to clear time
    mode: z.enum(['build', 'flow', 'restore']).optional()
  });

  // Zod schema for contextual message request
  const contextualMessageSchema = z.object({
    trigger: z.enum([
      'mode_change',
      'reflection_logged',
      'energy_low',
      'no_task',
      'chat_opened'
      // Add 'task_completed' later if distinct logic is needed
    ]),
    context: z.object({
      currentMode: z.enum(['build', 'flow', 'restore']).optional(),
      mood: z.string().optional(), // Assuming mood is a string from frontend, e.g., 'positive', 'neutral', 'negative_stressed'
      energyLevel: z.number().min(0).max(100).optional(), // e.g., 0-100 slider
      timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional()
    }).optional()
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const validationResult = getTaskByIdSchema.safeParse(req.params);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid task ID parameter",
          errors: validationResult.error.flatten().fieldErrors,
        });
      }
      const { id } = validationResult.data;
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Failed to fetch task:", error);
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const validationResult = createTaskSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid input for task creation",
          details: validationResult.error.flatten().fieldErrors,
        });
      }
      // Destructure only what's needed or truly optional from Zod, apply defaults manually for Prisma
      const { title, content, estimatedTime } = validationResult.data;
      const userId = await getDefaultUserId();

      const taskData: Prisma.TaskCreateInput = {
        title: title, // title is guaranteed by Zod to be a string
        content: content, // content is string | undefined by Zod
        status: validationResult.data.status ?? 'todo', // Explicit fallback if Zod transform didn't provide string
        priority: validationResult.data.priority ?? 'medium', // Explicit fallback
        estimatedTime: estimatedTime, // Zod ensures this is a number or undefined
        mode: validationResult.data.mode || 'build', // Explicit fallback, ensures 'build' | 'flow' | 'restore'
        user: { connect: { id: userId } }
      };

      // Generate reframing if title exists and content (description) doesn't
      if (taskData.title && !taskData.content) {
        try {
          // Use the 'mode' from the validated task data for reframing context
          // Provide a fallback to 'build' if mode is undefined, to satisfy generateTaskReframing's non-optional mode param
          const taskModeForReframing: 'build' | 'flow' | 'restore' = validationResult.data.mode || 'build';
          const reframingResponse = await generateTaskReframing(taskData.title, undefined, taskModeForReframing);
          taskData.content = reframingResponse.description; // Use the description from AI
        } catch (aiError) {
          console.error("Error generating task reframing:", aiError);
          // Continue with task creation even if AI fails, content will remain empty or as initially provided
        }
      }
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Failed to create task:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred while creating task" });
      }
    }
  });

  // Update a task
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const validationResult = updateTaskSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid input for task update",
          details: validationResult.error.flatten().fieldErrors,
        });
      }

      const { title, content, status, priority, estimatedTime, mode } = validationResult.data;
      const updateData: Prisma.TaskUpdateInput = {};

      // Only include fields that were actually provided in the request body
      if (validationResult.data.hasOwnProperty('title')) updateData.title = title;
      if (validationResult.data.hasOwnProperty('content')) updateData.content = content;
      if (validationResult.data.hasOwnProperty('status')) updateData.status = status;
      if (validationResult.data.hasOwnProperty('priority')) updateData.priority = priority;
      if (validationResult.data.hasOwnProperty('mode')) updateData.mode = mode;
      
      if (validationResult.data.hasOwnProperty('estimatedTime')) {
        updateData.estimatedTime = estimatedTime; // Zod ensures it's number or null
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields provided for update." });
      }

      const task = await storage.updateTask(id, updateData);
      if (!task) {
        return res.status(404).json({ error: "Task not found or failed to update" });
      }
      res.json(task);
    } catch (error) {
      console.error("Failed to update task:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
      // General error for other update failures
      res.status(400).json({ error: `Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const validationResult = getTaskByIdSchema.safeParse(req.params);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid task ID parameter for deletion",
          errors: validationResult.error.flatten().fieldErrors,
        });
      }
      const { id } = validationResult.data;
      const deletedTask = await storage.deleteTask(id);
      
      if (!deletedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(200).json({ message: "Task deleted successfully", task: deletedTask });
    } catch (error) {
      console.error("Failed to delete task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Get all reflections for the default user
  app.get("/api/reflections", async (req: Request, res: Response) => {
    try {
      const userId = await getDefaultUserId();
      const reflections = await storage.getReflections(userId);
      res.json(reflections);
    } catch (error) {
      console.error("Failed to fetch reflections:", error);
      res.status(500).json({ error: "Failed to fetch reflections" });
    }
  });

  // Get a specific reflection
  app.get("/api/reflections/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id; // Prisma uses string IDs
      const reflection = await storage.getReflection(id);
      
      if (!reflection) {
        return res.status(404).json({ error: "Reflection not found" });
      }
      
      res.json(reflection);
    } catch (error) {
      console.error("Failed to fetch reflection:", error);
      res.status(500).json({ error: "Failed to fetch reflection" });
    }
  });

  // Zod schema for reflection input
  const reflectionSchema = z.object({
    mood: z.string().min(1, { message: "Mood cannot be empty" }),
    energy: z.number().int().min(0, { message: "Energy must be at least 0" }).max(100, { message: "Energy must be at most 100" }),
    comment: z.string().optional(),
  });

  // Create a new reflection
  app.post("/api/reflections", async (req: Request, res: Response) => {
    try {
      const validationResult = reflectionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: validationResult.error.flatten().fieldErrors 
        });
      }

      const { mood, energy, comment } = validationResult.data;
      const userId = await getDefaultUserId();

      const reflectionData: Prisma.ReflectionCreateInput = {
        mood,
        energy, // 'energy' is already a number from Zod validation
        comment: comment || undefined,
        user: { connect: { id: userId } },
      };
      const reflection = await storage.createReflection(reflectionData);
      res.status(201).json(reflection);
    } catch (error) {
      console.error("Failed to create reflection:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred while creating reflection" });
      }
    }
  });

  // Get all messages for the default user
  app.get("/api/messages", async (req: Request, res: Response) => {
    try {
      const userId = await getDefaultUserId();
      // const messages = await storage.getMessages(userId); // Old call if it existed
      const messages = await storage.getMessagesForUser(userId); // New method
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create a new message and get AI response
  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      const userId = await getDefaultUserId();
      const { content, taskId } = req.body; // Assuming role is 'user' from client

      if (!content) {
        return res.status(400).json({ error: "Message content cannot be empty." });
      }

      const userMessageData: Prisma.MessageCreateInput = {
        role: "user",
        content,
        user: { connect: { id: userId } },
        ...(taskId && { task: { connect: { id: taskId } } }),
      };
      const userMessage = await storage.createMessage(userMessageData);
      
      // Get recent messages for context (e.g., last 10 messages for this user)
      const allMessagesFromDb = await storage.getMessagesForUser(userId);
      const recentMessagesFromDb = allMessagesFromDb.slice(-10); // Get last 10 messages for context

      // Prepare context for AI
      const userContext = {
        mode: (req.body.mode || 'flow') as 'build' | 'flow' | 'restore', // Get from req.body or default
        mood: (req.body.mood || 'calm') as 'stressed' | 'motivated' | 'calm',
        energy: parseInt(String(req.body.energy)) || 70, // Default to 70 if not provided or invalid
        recentMessages: recentMessagesFromDb.map(m => ({ role: m.role, content: m.content })).reverse() // Ensure chronological order for AI
      };

      // Generate AI response using the structured AIChatResponse type
      const aiChatResponse = await generateChatResponse(userMessage.content, userContext);

      let assistantMessageContent = "Sorry, I couldn't generate a response.";
      const createdSuggestedTasks: any[] = [];

      if (aiChatResponse && aiChatResponse.chat_response) {
        assistantMessageContent = aiChatResponse.chat_response;

        if (aiChatResponse.suggested_tasks && Array.isArray(aiChatResponse.suggested_tasks)) {
          for (const suggestedTask of aiChatResponse.suggested_tasks) {
            if (suggestedTask.type === 'new_task' && suggestedTask.title) {
              let numericEstimatedTime: number | undefined = undefined;
              if (suggestedTask.estimated_time) {
                const timeParts = String(suggestedTask.estimated_time).match(/(\d+)\s*(min|hour)s?/i);
                if (timeParts) {
                  numericEstimatedTime = parseInt(timeParts[1]);
                  if (timeParts[2].toLowerCase().startsWith('hour')) {
                    numericEstimatedTime *= 60;
                  }
                }
              }
              const taskData: Prisma.TaskCreateInput = {
                title: suggestedTask.title,
                content: suggestedTask.description || undefined,
                status: 'todo',
                priority: suggestedTask.priority || 'medium',
                estimatedTime: numericEstimatedTime,
                mode: suggestedTask.mode || userContext.mode,
                user: { connect: { id: userId } },
              };
              // Add reframing if title exists and content is empty
              if (taskData.title && !taskData.content) {
                try {
                  const reframing = await generateTaskReframing(taskData.title as string, undefined, userContext.mode, userContext.mood);
                  taskData.content = reframing.description || reframing.title;
                } catch (aiError) {
                  console.error("Error generating task reframing for suggested task:", aiError);
                }
              }
              createdSuggestedTasks.push(await storage.createTask(taskData));
            }
          }
        }
      }

      // Save AI's textual message to the database
      const assistantMessageRecord = await storage.createMessage({
        role: "assistant",
        content: assistantMessageContent,
        user: { connect: { id: userId } }, 
        ...(taskId && { task: { connect: { id: taskId } } }),
      });
      
      // Send a single, consolidated response
      res.status(201).json({
        userMessage: userMessage, 
        assistantMessage: assistantMessageRecord,
        suggestedTasks: createdSuggestedTasks
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  });

  // Generate subtasks for a task
  app.post("/api/tasks/subtasks", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: "Task title is required" });
      }
      
      let subtasks = ["Research topic", "Create outline", "Draft content", "Review and finalize"]; // Default subtasks
      
      try {
        // Generate subtasks using OpenAI
        subtasks = await generateTaskBreakdown(title);
      } catch (aiError) {
        console.error("Error generating subtasks:", aiError);
        // Continue with default subtasks if AI fails
      }
      
      res.status(200).json({ subtasks });
    } catch (error) {
      console.error("Error in /api/tasks/subtasks:", error);
      if (error instanceof Error) {
        res.status(500).json({ error: `Failed to process subtasks request: ${error.message}` });
      } else {
        res.status(500).json({ error: "An unknown error occurred processing subtasks request" });
      }
    }
  });

  // CONTEXTUAL ASSISTANT MESSAGE GENERATION
  function generateContextualAssistantMessage(trigger: string, context?: any): string {
    let message = Personality.chatNudges[Math.floor(Math.random() * Personality.chatNudges.length)]; // Default to a generic nudge

    switch (trigger) {
      case 'mode_change':
        if (context?.currentMode && Personality.modeGreetings[context.currentMode as keyof typeof Personality.modeGreetings]) {
          message = Personality.modeGreetings[context.currentMode as keyof typeof Personality.modeGreetings];
        }
        break;
      case 'reflection_logged':
        if (context?.mood) {
            const moodLowerCase = context.mood.toLowerCase();
            if (moodLowerCase.includes('positive') || moodLowerCase.includes('good') || moodLowerCase.includes('great') || moodLowerCase.includes('energized') || moodLowerCase.includes('happy')) {
              message = Personality.reflectionResponses.positive_mood;
            } else if (moodLowerCase.includes('negative') || moodLowerCase.includes('stressed') || moodLowerCase.includes('drained') || moodLowerCase.includes('sad') || moodLowerCase.includes('anxious')) {
              message = Personality.reflectionResponses.negative_mood;
            } else {
              message = Personality.reflectionResponses.neutral_mood;
            }
        } else {
            message = Personality.reflectionResponses.neutral_mood; // Default if mood not provided
        }
        break;
      case 'energy_low':
        message = Personality.lowEnergyPrompts[Math.floor(Math.random() * Personality.lowEnergyPrompts.length)];
        break;
      case 'no_task':
        message = Personality.noTaskPrompts[Math.floor(Math.random() * Personality.noTaskPrompts.length)];
        break;
      case 'chat_opened':
        // Default message is already a chat nudge from initialization
        break;
      default:
        console.warn(`Unknown contextual trigger: ${trigger}`);
        break;
    }
    return message;
  }

  app.post("/api/contextual-message", async (req: Request, res: Response) => {
    try {
      const validationResult = contextualMessageSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid input for contextual message generation",
          details: validationResult.error.flatten().fieldErrors,
        });
      }

      const { trigger, context } = validationResult.data;
      const userId = await getDefaultUserId();

      const assistantMessageContent = generateContextualAssistantMessage(trigger, context);

      const newMessage = await storage.createMessage({
        role: 'assistant',
        content: assistantMessageContent,
        user: { connect: { id: userId } },
      });

      res.status(201).json({ chatMessage: newMessage });
    } catch (error) {
      console.error("Failed to generate contextual message:", error);
      res.status(500).json({ error: "Failed to generate contextual message" });
    }
  });

  // Generate a motivational quote
  app.post("/api/quotes", async (req: Request, res: Response) => {
    try {
      const { mode, mood } = req.body;
      let quote = "Progress over perfection."; // Default quote
      
      try {
        // Generate quote using OpenAI
        quote = await generateMotivationalQuote({
          mode: mode || "build",
          mood: mood || "motivated"
        });
      } catch (aiError) {
        console.error("Error generating motivational quote:", aiError);
        // Continue with default quote if AI fails
      }
      
      res.status(200).json({ quote });
    } catch (error) {
      console.error("Error in /api/quotes:", error);
      if (error instanceof Error) {
        res.status(500).json({ error: `Failed to process quote request: ${error.message}` });
      } else {
        res.status(500).json({ error: "An unknown error occurred processing quote request" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
