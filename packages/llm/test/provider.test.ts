import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from '../src/openai-provider.js';
import { LLMError, LLMTimeoutError } from '../src/errors.js';

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
  beforeEach(() => { mockFetch.mockReset(); });

  it('retries on 429 and succeeds on second attempt', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ error: 'rate limited' }, 429))
      .mockResolvedValueOnce(openaiSuccess('{"result":"ok"}'));

    // maxRetries: 1, short delay via internal sleep
    const provider = new OpenAIProvider({ apiKey: 'test', maxRetries: 1 });
    const result = await provider.raw({ system: 'test', user: 'hi' });
    expect(result.content).toBe('{"result":"ok"}');
    expect(mockFetch).toHaveBeenCalledTimes(2);
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

  it('exhausts retries then throws', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ error: 'server error' }, 500));

    // maxRetries: 0 means no retry, immediate fail
    const provider = new OpenAIProvider({ apiKey: 'test', maxRetries: 0 });
    await expect(provider.raw({ system: 'test', user: 'hi' }))
      .rejects.toThrow(LLMError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('Timeout behavior', () => {
  beforeEach(() => { mockFetch.mockReset(); });

  it('throws LLMTimeoutError when request exceeds timeout', async () => {
    // Mock fetch that never resolves but respects abort signal
    mockFetch.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const onAbort = () => reject(new DOMException('aborted', 'AbortError'));
        if (init.signal?.aborted) { onAbort(); return; }
        init.signal?.addEventListener('abort', onAbort);
      });
    });

    const provider = new OpenAIProvider({ apiKey: 'test', timeoutMs: 50, maxRetries: 0 });
    await expect(provider.raw({ system: 'test', user: 'hi' }))
      .rejects.toThrow(LLMTimeoutError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('Logger integration', () => {
  beforeEach(() => { mockFetch.mockReset(); });

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
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.messages).toHaveLength(4);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[3].content).toBe('Confirm in JSON.');
  });
});
