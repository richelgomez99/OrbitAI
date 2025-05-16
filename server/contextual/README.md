# Contextual Message System

This module handles the generation of contextual messages in the OrbitAI application. It provides a type-safe way to generate appropriate messages based on user actions and system events.

## Features

- Type-safe message generation based on triggers and context
- Support for different message categories (mode changes, reflections, energy levels, etc.)
- Extensible architecture with versioning support
- Consistent personality and tone across all messages
- Test coverage for all message generation scenarios

## API v1

### Generating a Contextual Message

#### Using the API Endpoint

```typescript
// POST /api/contextual-message
const response = await fetch('/api/contextual-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    version: 'v1', // Optional, defaults to 'v1'
    trigger: 'mode_change',
    context: {
      mode: 'build',
      mood: 'motivated',
      timeOfDay: 'morning'
    }
  })
});

// Response format
{
  "version": "v1",
  "chatMessage": {
    "content": "Let's focus and move with intent. What's the first step?",
    "role": "assistant"
  },
  "metadata": {
    "trigger": "mode_change",
    "timestamp": "2025-05-15T20:15:32.000Z"
  }
}
```

#### Using the Helper Function (Client-side)

```typescript
import { triggerContextualMessage } from '../context/orbit-context';

// Basic usage
const response = await triggerContextualMessage('chat_opened');

// With context
const response = await triggerContextualMessage('mode_change', {
  mode: 'build',
  mood: 'motivated'
});
```

### Available Triggers

- `mode_change`: When the user changes their mode (build/flow/restore/recover/reflect)
- `reflection_logged`: When a user logs a reflection
- `energy_low`: When the system detects low user energy
- `no_task`: When there are no active tasks
- `chat_opened`: When the chat interface is opened

### Context Object

The context object can include:

- `mode`: The current user mode ('build' | 'flow' | 'restore' | 'recover' | 'reflect')
- `mood`: User's current mood (string)
- `timeOfDay`: Time of day ('morning' | 'afternoon' | 'evening' | 'night')
- Any additional context relevant to the trigger

## Versioning

The API supports versioning to ensure backward compatibility. The current version is `v1`. When making breaking changes, increment the version number and maintain support for previous versions.

## Adding New Message Types

1. Add the new trigger to the `Trigger` enum in `schemas.ts`
2. Add a new case in `generateContextualMessageV1` in `messages.ts`
3. Add corresponding messages to the `personality.ts` file
4. Add tests for the new trigger in `__tests__/messages.test.ts`

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Invalid request (validation failed)
- `500`: Server error

Error responses include a JSON object with an `error` field and optional `details`.

## Testing

Run the tests with:

```bash
npm test
```

## Dependencies

- Zod for schema validation
- TypeScript for type safety
- Vitest for testing
- Express for the API endpoint
