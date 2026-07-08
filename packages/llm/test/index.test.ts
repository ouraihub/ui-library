import { describe, it, expect } from 'vitest';
import {
  createProvider,
  OpenAIProvider,
  AnthropicProvider,
  ToolExecutor,
  LLMError,
  LLMTimeoutError,
  extractJsonObject,
} from '../src/index.js';

describe('createProvider', () => {
  it('creates OpenAI provider by default', () => {
    const provider = createProvider({ apiKey: 'test-key' });
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it('creates Anthropic provider when specified', () => {
    const provider = createProvider({ apiKey: 'test-key', provider: 'anthropic' });
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it('accepts custom baseUrl and model', () => {
    const provider = createProvider({
      apiKey: 'test-key',
      baseUrl: 'https://relay.example.com/v1',
      model: 'custom-model',
    });
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });
});

describe('ToolExecutor', () => {
  it('registers tools', () => {
    const executor = new ToolExecutor();
    executor.register([
      {
        definition: { name: 'search', description: 'Search the web', parameters: {} },
        handler: async () => 'results',
      },
    ]);
    // No throw = success
    expect(executor).toBeInstanceOf(ToolExecutor);
  });
});

describe('extractJsonObject', () => {
  it('extracts JSON from plain string', () => {
    const result = extractJsonObject('{"key": "value"}');
    expect(result).toBe('{"key": "value"}');
  });

  it('extracts JSON from markdown fence', () => {
    const input = '```json\n{"key": "value"}\n```';
    const result = extractJsonObject(input);
    expect(result).toBe('{"key": "value"}');
  });

  it('extracts JSON from text with preamble', () => {
    const input = 'Here is the result:\n{"key": "value"}\nHope that helps!';
    const result = extractJsonObject(input);
    expect(result).toBe('{"key": "value"}');
  });

  it('handles nested braces', () => {
    const input = '{"outer": {"inner": true}}';
    const result = extractJsonObject(input);
    expect(result).toBe('{"outer": {"inner": true}}');
  });
});

describe('Errors', () => {
  it('LLMError contains vendor info', () => {
    const err = new LLMError('test error', 'openai', 429, 1500);
    expect(err.vendor).toBe('openai');
    expect(err.statusCode).toBe(429);
    expect(err.durationMs).toBe(1500);
    expect(err.message).toBe('test error');
  });

  it('LLMTimeoutError has timeout info', () => {
    const err = new LLMTimeoutError('anthropic', 30000);
    expect(err.timeoutMs).toBe(30000);
    expect(err.vendor).toBe('anthropic');
  });
});
