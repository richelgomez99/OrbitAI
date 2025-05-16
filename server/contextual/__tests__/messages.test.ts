import { describe, it, expect, vi } from 'vitest';
import { 
  generateContextualMessage, 
  getAvailableTriggers, 
  handleContextualMessageRequest 
} from '../messages';
import { Trigger } from '../schemas';

// Mock the personality module
vi.mock('../../personality', () => ({
  chatNudges: ['Test message 1', 'Test message 2'],
  modeGreetings: {
    build: 'Build mode message',
    restore: 'Restore mode message',
    flow: 'Flow mode message'
  },
  reflectionResponses: {
    positive_mood: 'Positive mood response',
    neutral_mood: 'Neutral mood response',
    negative_mood: 'Negative mood response'
  },
  getGreeting: vi.fn().mockReturnValue('Test greeting'),
  getModeSwitchMessage: vi.fn().mockImplementation((mode) => `Switched to ${mode} mode`),
  getReflectionResponse: vi.fn().mockReturnValue('Test reflection response'),
  getLowEnergyMessage: vi.fn().mockReturnValue('Low energy message'),
  getNoTaskPrompt: vi.fn().mockReturnValue('No tasks message'),
  getChatNudge: vi.fn().mockReturnValue('Chat nudge')
}));

describe('Contextual Message Generation', () => {
  it('should return a message for each trigger type', () => {
    const triggers = getAvailableTriggers();
    
    triggers.forEach(trigger => {
      const message = generateContextualMessage(trigger);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  it('should handle mode change with context', async () => {
    const response = await handleContextualMessageRequest({
      trigger: 'mode_change',
      context: { mode: 'build' },
      version: 'v1'
    });
    
    expect(response.version).toBe('v1');
    expect(response.chatMessage.role).toBe('assistant');
    expect(response.chatMessage.content).toContain('build');
    const metadata = response.metadata as { trigger: string; timestamp: string };
    expect(metadata.trigger).toBe('mode_change');
    expect(new Date(metadata.timestamp)).toBeInstanceOf(Date);
  });

  it('should handle reflection logged with mood', async () => {
    const response = await handleContextualMessageRequest({
      trigger: 'reflection_logged',
      context: { mood: 'happy' },
      version: 'v1'
    });
    
    expect(response.chatMessage.content).toBeDefined();
  });

  it('should handle energy low', async () => {
    const response = await handleContextualMessageRequest({
      trigger: 'energy_low',
      version: 'v1'
    });
    
    expect(response.chatMessage.content).toContain('energy');
  });

  it('should handle no task', async () => {
    const response = await handleContextualMessageRequest({
      trigger: 'no_task',
      version: 'v1'
    });
    
    expect(response.chatMessage.content).toContain('task');
  });

  it('should handle chat opened with time of day', async () => {
    const response = await handleContextualMessageRequest({
      trigger: 'chat_opened',
      context: { timeOfDay: 'morning' },
      version: 'v1'
    });
    
    expect(response.chatMessage.content).toContain('morning');
  });

  it('should use default version if not specified', async () => {
    const response = await handleContextualMessageRequest({
      trigger: 'chat_opened'
    } as any);
    
    expect(response.version).toBe('v1');
  });
});

describe('Available Triggers', () => {
  it('should return all available triggers', () => {
    const triggers = getAvailableTriggers();
    expect(triggers.length).toBeGreaterThan(0);
    expect(triggers).toContain('mode_change');
    expect(triggers).toContain('reflection_logged');
    expect(triggers).toContain('energy_low');
    expect(triggers).toContain('no_task');
    expect(triggers).toContain('chat_opened');
  });
});

describe('Backward Compatibility', () => {
  it('should maintain backward compatibility with generateContextualMessage', () => {
    const message = generateContextualMessage('chat_opened', { timeOfDay: 'morning' });
    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(0);
  });
});
