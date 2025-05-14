import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertReflectionSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  generateTaskBreakdown, 
  generateChatResponse, 
  generateMotivationalQuote, 
  generateTaskReframing 
} from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to handle validation errors
  const handleValidation = <T>(schema: z.ZodType<T>, data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        throw new Error(validationError.message);
      }
      throw error;
    }
  };

  // Get all tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Get a specific task
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = handleValidation(insertTaskSchema, req.body);
      
      // Generate AI subtasks if title exists and subtasks aren't provided
      if (taskData.title && (!taskData.subtasks || 
          (Array.isArray(taskData.subtasks) && taskData.subtasks.length === 0))) {
        try {
          // Generate subtasks using OpenAI
          const subtaskTitles = await generateTaskBreakdown(taskData.title);
          
          // Format subtasks
          taskData.subtasks = subtaskTitles.map(title => ({
            id: Math.random().toString(36).substring(2, 11),
            title,
            done: false
          }));
        } catch (aiError) {
          console.error("Error generating subtasks:", aiError);
          // Continue with task creation even if AI fails
        }
      }
      
      // Generate reframing if it doesn't exist
      if (taskData.title && !taskData.description) {
        try {
          const reframing = await generateTaskReframing(taskData.title);
          taskData.description = `Reframe: ${reframing}`;
        } catch (aiError) {
          console.error("Error generating task reframing:", aiError);
          // Continue with task creation even if AI fails
        }
      }
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  });

  // Update a task
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      const updatedTask = await storage.updateTask(id, req.body);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Get all reflections
  app.get("/api/reflections", async (req: Request, res: Response) => {
    try {
      const reflections = await storage.getReflections();
      res.json(reflections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflections" });
    }
  });

  // Get a specific reflection
  app.get("/api/reflections/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const reflection = await storage.getReflection(id);
      
      if (!reflection) {
        return res.status(404).json({ error: "Reflection not found" });
      }
      
      res.json(reflection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflection" });
    }
  });

  // Create a new reflection
  app.post("/api/reflections", async (req: Request, res: Response) => {
    try {
      const reflectionData = handleValidation(insertReflectionSchema, req.body);
      const reflection = await storage.createReflection(reflectionData);
      res.status(201).json(reflection);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  });

  // Get all messages
  app.get("/api/messages", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create a new message
  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      // User message
      const messageData = handleValidation(insertMessageSchema, {
        ...req.body,
        role: "user",
      });
      const userMessage = await storage.createMessage(messageData);
      
      // Get recent messages for context (last 5 messages)
      const recentMessages = await storage.getMessages();
      const lastFiveMessages = recentMessages
        .slice(-5)
        .map(msg => ({ role: msg.role, content: msg.content }));
      
      // Default response if AI generation fails
      let responseContent = "I'm here to help you maintain momentum. What specific challenge are you facing right now?";
      
      try {
        // Simple response mapping for common queries
        const aiResponses: Record<string, string> = {
          "Need help deciding?": "Let's break down your options. What choices are you trying to decide between?",
          "Reframe task": "Sometimes changing how we view a task can make it more approachable. What task would you like to reframe?",
          "Clear mental fog": "Let's clear that mental fog. Take a deep breath. What's one small, concrete step you could take right now?"
        };
        
        if (aiResponses[req.body.content]) {
          responseContent = aiResponses[req.body.content];
        } else {
          // Generate personalized response using OpenAI
          responseContent = await generateChatResponse(req.body.content, {
            mode: req.body.mode || "build", 
            mood: req.body.mood || "motivated",
            energy: req.body.energy || 50,
            recentMessages: [...lastFiveMessages, { role: "user", content: req.body.content }]
          });
        }
      } catch (aiError) {
        console.error("Error generating AI response:", aiError);
        // Continue with default response if AI fails
      }
      
      // Save AI message
      const aiMessageData = {
        userId: messageData.userId,
        role: "assistant",
        content: responseContent
      };
      
      const aiMessage = await storage.createMessage(aiMessageData);
      
      res.status(201).json({ user: userMessage, assistant: aiMessage });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
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
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
