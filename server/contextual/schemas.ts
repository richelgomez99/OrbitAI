import { z } from 'zod';

export const Mode = z.enum(['build', 'restore', 'flow']);
export type Mode = z.infer<typeof Mode>;

export const Mood = z.enum(['happy', 'neutral', 'sad', 'anxious', 'energized', 'tired']);
export type Mood = z.infer<typeof Mood>;

export const TimeOfDay = z.enum(['morning', 'afternoon', 'evening', 'night']);
export type TimeOfDay = z.infer<typeof TimeOfDay>;

export const Trigger = z.enum([
  'mode_change',
  'reflection_logged',
  'energy_low',
  'no_task',
  'chat_opened',
]);
export type Trigger = z.infer<typeof Trigger>;

// Base context schema with known fields
const BaseContextSchema = z.object({
  mode: Mode.optional(),
  mood: z.string().optional(),
  energyLevel: z.number().min(0).max(100).optional(),
  timeOfDay: TimeOfDay.optional()
});

// Extended context schema that allows additional properties
export const ContextSchema = BaseContextSchema.extend({
  // This allows any additional properties
}).passthrough();

export type Context = z.infer<typeof ContextSchema>;

export const ContextualMessageRequestSchema = z.object({
  version: z.string().default('v1'),
  trigger: Trigger,
  context: ContextSchema.optional()
});

export type ContextualMessageRequest = z.infer<typeof ContextualMessageRequestSchema>;

export const ContextualMessageResponseSchema = z.object({
  version: z.string(),
  chatMessage: z.object({
    content: z.string(),
    role: z.literal('assistant')
  }),
  metadata: z.record(z.unknown()).optional()
});

export type ContextualMessageResponse = z.infer<typeof ContextualMessageResponseSchema>;
