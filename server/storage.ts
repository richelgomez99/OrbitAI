import { 
  User, InsertUser, 
  Task, InsertTask, 
  Reflection, InsertReflection, 
  Message, InsertMessage 
} from "@shared/schema";

// Modify the interface with any CRUD methods you need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(userId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Reflection methods
  getReflections(userId?: number): Promise<Reflection[]>;
  getReflection(id: number): Promise<Reflection | undefined>;
  createReflection(reflection: InsertReflection): Promise<Reflection>;
  
  // Message methods
  getMessages(userId?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private reflections: Map<number, Reflection>;
  private messages: Map<number, Message>;
  
  private userCurrentId: number;
  private taskCurrentId: number;
  private reflectionCurrentId: number;
  private messageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.reflections = new Map();
    this.messages = new Map();
    
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.reflectionCurrentId = 1;
    this.messageCurrentId = 1;
    
    // Add sample data
    this.createTask({
      userId: null,
      title: "Create landing page wireframes",
      description: "Reframe: Break it into homepage, about, and features sections first",
      status: "todo",
      priority: "medium",
      estimatedTime: 45,
      mode: "build",
      createdAt: new Date()
    });
    
    this.createTask({
      userId: null,
      title: "Send proposal to client",
      description: "Reframe: Focus on value proposition instead of feature list",
      status: "todo",
      priority: "high",
      estimatedTime: 20,
      mode: "build",
      createdAt: new Date()
    });
    
    this.createMessage({
      userId: null,
      role: "user",
      content: "Help me prioritize my tasks for the morning"
    });
    
    this.createMessage({
      userId: null,
      role: "assistant",
      content: "Absolutely!"
    });
    
    this.createMessage({
      userId: null,
      role: "assistant", 
      content: "What is the most important task you'd like to tackle?"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Task methods
  async getTasks(userId?: number): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    if (userId !== undefined) {
      return tasks.filter(task => task.userId === userId);
    }
    return tasks;
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const newTask: Task = { ...task, id } as Task;
    
    // Ensure createdAt is a Date object
    if (!newTask.createdAt) {
      newTask.createdAt = new Date();
    }
    
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...data };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Reflection methods
  async getReflections(userId?: number): Promise<Reflection[]> {
    const reflections = Array.from(this.reflections.values());
    if (userId !== undefined) {
      return reflections.filter(reflection => reflection.userId === userId);
    }
    return reflections;
  }
  
  async getReflection(id: number): Promise<Reflection | undefined> {
    return this.reflections.get(id);
  }
  
  async createReflection(reflection: InsertReflection): Promise<Reflection> {
    const id = this.reflectionCurrentId++;
    const newReflection: Reflection = { ...reflection, id } as Reflection;
    
    // Ensure date is a Date object
    if (!newReflection.date) {
      newReflection.date = new Date();
    }
    
    this.reflections.set(id, newReflection);
    return newReflection;
  }
  
  // Message methods
  async getMessages(userId?: number): Promise<Message[]> {
    const messages = Array.from(this.messages.values());
    if (userId !== undefined) {
      return messages.filter(message => message.userId === userId);
    }
    return messages;
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const newMessage: Message = { 
      ...message, 
      id, 
      timestamp: new Date() 
    } as Message;
    
    this.messages.set(id, newMessage);
    return newMessage;
  }
}

// Import required Drizzle ORM functions
import { db } from "./db";
import { eq, count } from "drizzle-orm";
import { 
  users, tasks, reflections, messages
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Task methods
  async getTasks(userId?: number): Promise<Task[]> {
    if (userId !== undefined) {
      return db.select().from(tasks).where(eq(tasks.userId, userId));
    }
    return db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({
        ...task,
        lastUpdated: new Date()
      })
      .returning();
    return newTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...data,
        lastUpdated: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id));
    return result.count > 0;
  }
  
  // Reflection methods
  async getReflections(userId?: number): Promise<Reflection[]> {
    if (userId !== undefined) {
      return db.select().from(reflections).where(eq(reflections.userId, userId));
    }
    return db.select().from(reflections);
  }

  async getReflection(id: number): Promise<Reflection | undefined> {
    const [reflection] = await db.select().from(reflections).where(eq(reflections.id, id));
    return reflection || undefined;
  }

  async createReflection(reflection: InsertReflection): Promise<Reflection> {
    const [newReflection] = await db
      .insert(reflections)
      .values(reflection)
      .returning();
    return newReflection;
  }
  
  // Message methods
  async getMessages(userId?: number): Promise<Message[]> {
    if (userId !== undefined) {
      return db.select().from(messages).where(eq(messages.userId, userId));
    }
    return db.select().from(messages);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }
}

// Initialize with sample data on first run
async function seedInitialData() {
  try {
    const taskCount = await db.select({ count: count() }).from(tasks);
    
    if (taskCount[0].count === 0) {
      // Add some sample tasks
      await db.insert(tasks).values([
        {
          userId: null,
          title: "Create landing page wireframes",
          description: "Reframe: Break it into homepage, about, and features sections first",
          status: "todo",
          priority: "medium",
          estimatedTime: 45,
          mode: "build",
          createdAt: new Date(),
          lastUpdated: new Date()
        },
        {
          userId: null,
          title: "Send proposal to client",
          description: "Reframe: Focus on value proposition instead of feature list",
          status: "todo",
          priority: "high",
          estimatedTime: 20,
          mode: "build",
          createdAt: new Date(),
          lastUpdated: new Date()
        }
      ]);
      
      // Add some sample messages
      await db.insert(messages).values([
        {
          userId: null,
          role: "user",
          content: "Help me prioritize my tasks for the morning",
          timestamp: new Date()
        },
        {
          userId: null,
          role: "assistant",
          content: "Absolutely!",
          timestamp: new Date()
        },
        {
          userId: null,
          role: "assistant", 
          content: "What is the most important task you'd like to tackle?",
          timestamp: new Date()
        }
      ]);
    }
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}

// Use the DatabaseStorage
export const storage = new DatabaseStorage();

// Seed initial data
seedInitialData().catch(console.error);
