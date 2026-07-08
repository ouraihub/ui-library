import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIProvider } from '../src/openai-provider.js';
import { LLMError, LLMTimeoutError } from '../src/errors.js';
import { consoleLogger } from '../src/logger.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function openaiSuccess(content: string) {
  return jsonResponse({
    choices: [{ message: { content }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  });
}

describe('Retry behavior', () => {
  beforeEach(() => { mockFetch.mockReset(); vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('retries on 429 and succeeds on second attempt', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ error: 'rate limited' }, 429))
      .mockResolvedValueOnce(openaiSuccess('{"result":"ok"}'));

    const provider = new OpenAIProvider({ apiKey: 'test', maxRetries: 2 });
    const promise = provider.raw({ system: 'test', user: 'hi' });
    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;
    expect(result.content).toBe('{"result":"ok"}');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries on 500 up to maxRetries then returns error response', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ error: 'server error' }, 500))
      .mockResolvedValueOnce(jsonResponse({ error: 'server error' }, 500))
      .mockResolvedValueOnce(jsonResponse({ error: 'server error' }, 500));

    const provider = new OpenAIProvider({ apiKey: 'test', maxRetries: 2 });
    const promise = provider.raw({ system: 'test', user: 'hi' });
    await vi.advanceTimersByTimeAsync(10000);
    await expect(promise).rejects.toThrow(LLMError);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('does not retry on 400 (non-retryable)', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'bad request' }, 400));

    const provider = new OpenAIProvider({ apiKey: 'test', maxRetries: 2 });
    await expect(provider.raw({ system: 'test', user: 'hi' }))
      .rejects.toThrow(LLMError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('succeeds without retry on 200', async () => {
    mockFetch.mockResolvedValueOnce(openaiSuccess('{"ok":true}'));

    const provider = new OpenAIProvider({ apiKey: 'test', maxRetries: 2 });
    const result = await provider.raw({ system: 'test', user: 'hi' });
    expect(result.content).toBe('{"ok":true}');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('Timeout behavior', () => {
  beforeEach(() => { mockFetch.mockReset(); vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('throws LLMTimeoutError when request times out', async () => {
    mockFetch.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          reject(new DOMException('aborted', 'AbortError'));
        });
      });
    });

    const provider = new OpenAIProvider({ apiKey: 'test', timeoutMs: 100, maxRetries: 0 });
    const promise = provider.raw({ system: 'test', user: 'hi' });
    await vi.advanceTimersByTimeAsync(150);
    await expect(promise).rejects.toThrow(LLMTimeoutError);
  });

  it('does not retry on timeout', async () => {
    mockFetch.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          reject(new DOMException('aborted', 'AbortError'));
        });
      });
    });

    const provider = new OpenAIProvider({ apiKey: 'test', timeoutMs: 100, maxRetries: 2 });
    const promise = provider.raw({ system: 'test', user: 'hi' });
    await vi.advanceTimersByTimeAsync(150);
    await expect(promise).rejects.toThrow(LLMTimeoutError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('Logger integration', () => {
  beforeEach(() => { mockFetch.mockReset(); vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('logs request start and done on success', async () => {
    mockFetch.mockResolvedValueOnce(openaiSuccess('{"ok":true}'));

    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const provider = new OpenAIProvider({ apiKey: 'test', logger });
    await provider.raw({ system: 'test', user: 'hi' });

    expect(logger.info).toHaveBeenCalledWith('llm_request_start', expect.objectContaining({ vendor: 'openai' }));
    expect(logger.info).toHaveBeenCalledWith('llm_request_done', expect.objectContaining({ vendor: 'openai' }));
  });

  it('logs error on failure', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'bad' }, 400));

    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const provider = new OpenAIProvider({ apiKey: 'test', logger, maxRetries: 0 });
    await expect(provider.raw({ system: 'test', user: 'hi' })).rejects.toThrow();

    expect(logger.error).toHaveBeenCalledWith('llm_request_failed', expect.objectContaining({ status: 400 }));
  });

  it('logs retry attempts', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(openaiSuccess('{}'));

    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const provider = new OpenAIProvider({ apiKey: 'test', logger, maxRetries: 1 });
    const promise = provider.raw({ system: 'test', user: 'hi' });
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(logger.warn).toHaveBeenCalledWith('llm_retrying', expect.objectContaining({ status: 429 }));
  });
});

describe('messages() multi-turn API', () => {
  beforeEach(() => { mockFetch.mockReset(); });

  it('sends full message history to API', async () => {
    mockFetch.mockResolvedValueOnce(openaiSuccess('{"answer":"42"}'));

    const provider = new OpenAIProvider({ apiKey: 'test' });
    const result = await provider.messages([
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'What is 6*7?' },
      { role: 'assistant', content: '42' },
      { role: 'user', content: 'Confirm in JSON.' },
    ]);

    expect(result.content).toBe('{"answer":"42"}');
    // Verify the request body contains all messages
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.messages).toHaveLength(4);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[3].content).toBe('Confirm in JSON.');
  });
});
