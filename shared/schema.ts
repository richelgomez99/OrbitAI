import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  currentMode: text("current_mode").default("build"),
  currentMood: text("current_mood").default("motivated"),
  currentEnergy: integer("current_energy").default(60),
  focusStreak: boolean("focus_streak").array(),
  preferences: jsonb("preferences"), // Store UI preferences, notification settings, etc.
  lastActive: timestamp("last_active"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  estimatedTime: integer("estimated_time"),
  dueDate: timestamp("due_date"),
  mode: text("mode"),
  subtasks: jsonb("subtasks"),
  tags: text("tags").array(),
  friction: integer("friction").default(0), // Tracks how many times a task has been snoozed
  lastUpdated: timestamp("last_updated"),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Reflection schema
export const reflections = pgTable("reflections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  mood: integer("mood").notNull(), // 1-5 scale
  energy: integer("energy").notNull().default(50), // 0-100 scale
  mode: text("mode"),
  tags: text("tags").array(),
  comment: text("comment"),
  aiSummary: text("ai_summary"), // AI-generated insight or summary
});

export const insertReflectionSchema = createInsertSchema(reflections).omit({
  id: true,
});

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  contextMode: text("context_mode"), // User's mode when message was sent
  contextMood: text("context_mood"), // User's mood when message was sent
  contextEnergy: integer("context_energy"), // User's energy when message was sent
  category: text("category"), // E.g., "task_reframe", "decision_help", "general"
  relatedTaskId: integer("related_task_id").references(() => tasks.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertReflection = z.infer<typeof insertReflectionSchema>;
export type Reflection = typeof reflections.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
