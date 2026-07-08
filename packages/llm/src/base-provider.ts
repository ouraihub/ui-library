/**
 * @ouraihub/llm — Base LLM Provider (Template Method Pattern).
 *
 * Encapsulates common flow:
 *  - Structured logging at all key points
 *  - Retry with exponential backoff (429 / 5xx)
 *  - AbortController timeout per attempt
 *  - JSON extraction from model output
 *  - Zod schema validation
 *
 * Subclasses implement:
 *  - buildRequest() — vendor-specific request
 *  - parseResponse() — vendor-specific response parsing
 *  - getDefaultBaseUrl() / getDefaultModel() / getVendorName()
 */

import type { z } from 'zod';
import type {
  ILLMProvider,
  LLMPrompt,
  LLMMessage,
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMProviderConfig,
  StreamChunk,
} from './interfaces.js';
import type { ILogger } from './logger.js';
import { noopLogger } from './logger.js';
import { LLMError, LLMTimeoutError } from './errors.js';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/** Extended config with logger and retry */
export interface BaseLLMProviderConfig extends LLMProviderConfig {
  readonly logger?: ILogger;
  readonly maxRetries?: number;
}

/** Internal invocation result from subclass */
export interface ParsedInvocation {
  readonly content: string;
  readonly toolCalls?: LLMCompletionResult['toolCalls'];
  readonly finishReason?: string;
  readonly usage?: LLMCompletionResult['usage'];
}

export abstract class BaseLLMProvider implements ILLMProvider {
  protected readonly apiKey: string;
  protected readonly baseUrl: string;
  protected readonly model: string;
  protected readonly vendor: string;
  protected readonly timeoutMs: number;
  protected readonly logger: ILogger;
  protected readonly maxRetries: number;

  protected constructor(config: Required<Pick<LLMProviderConfig, 'apiKey'>> & BaseLLMProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? this.getDefaultBaseUrl()).replace(/\/+$/, '');
    this.model = config.model ?? this.getDefaultModel();
    this.vendor = config.vendor ?? this.getVendorName();
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.logger = config.logger ?? noopLogger;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  /** Structured completion with Zod schema validation */
  async complete<T>(prompt: LLMPrompt, schema: z.ZodSchema<T>, options?: LLMCompletionOptions): Promise<T> {
    const result = await this.raw(prompt, { ...options, jsonMode: true });
    return this.parseAndValidate(result.content, schema);
  }

  /** Raw completion without schema enforcement */
  async raw(prompt: LLMPrompt, options?: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const { url, init } = this.buildRequest(prompt, options);
    return this.executeRequest(url, init);
  }

  /** Multi-turn completion: native message history support */
  async messages(messages: readonly LLMMessage[], options?: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const { url, init } = this.buildMessagesRequest(messages, options);
    return this.executeRequest(url, init);
  }

  /** Streaming completion: yields text chunks */
  async *stream(prompt: LLMPrompt, options?: LLMCompletionOptions): AsyncIterable<StreamChunk> {
    const { url, init } = this.buildRequest(prompt, { ...options, stream: true });
    yield* this.executeStream(url, init);
  }

  /** Streaming with full message history */
  async *streamMessages(messages: readonly LLMMessage[], options?: LLMCompletionOptions): AsyncIterable<StreamChunk> {
    const { url, init } = this.buildMessagesRequest(messages, { ...options, stream: true });
    yield* this.executeStream(url, init);
  }

  private async *executeStream(url: string, init: RequestInit): AsyncIterable<StreamChunk> {
    const start = Date.now();

    this.logger.info('llm_stream_start', { vendor: this.vendor, model: this.model });

    const response = await this.fetchWithTimeout(url, init);

    if (!response.ok) {
      const body = await safeReadText(response);
      this.logger.error('llm_stream_failed', { vendor: this.vendor, status: response.status });
      throw new LLMError(`${this.vendor} stream returned ${response.status}: ${body.slice(0, 200)}`, this.vendor, response.status);
    }

    if (!response.body) {
      throw new LLMError(`${this.vendor} stream response has no body`, this.vendor);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const chunk = this.parseStreamLine(line);
          if (chunk) yield chunk;
          if (chunk?.done) {
            this.logger.info('llm_stream_done', {
              vendor: this.vendor,
              duration: Date.now() - start,
              finishReason: chunk.finishReason,
            });
            return;
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const chunk = this.parseStreamLine(buffer);
        if (chunk) yield chunk;
      }
    } finally {
      reader.releaseLock();
    }

    // Emit final done chunk if not already emitted
    yield { text: '', done: true };
    this.logger.info('llm_stream_done', { vendor: this.vendor, duration: Date.now() - start });
  }

  private async executeRequest(url: string, init: RequestInit): Promise<LLMCompletionResult> {
    const start = Date.now();

    this.logger.info('llm_request_start', {
      vendor: this.vendor,
      model: this.model,
      timeoutMs: this.timeoutMs,
    });

    const response = await this.fetchWithRetry(url, init);
    const duration = Date.now() - start;

    if (!response.ok) {
      const body = await safeReadText(response);
      this.logger.error('llm_request_failed', {
        vendor: this.vendor,
        model: this.model,
        status: response.status,
        duration,
        body: body.slice(0, 200),
      });
      throw new LLMError(
        `${this.vendor} API returned ${response.status}: ${body.slice(0, 200)}`,
        this.vendor,
        response.status,
        duration,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      this.logger.error('llm_invalid_json', { vendor: this.vendor, duration });
      throw new LLMError(`${this.vendor} response is not valid JSON`, this.vendor, response.status, duration);
    }

    const result = this.parseResponse(payload);

    this.logger.info('llm_request_done', {
      vendor: this.vendor,
      model: this.model,
      duration,
      finishReason: result.finishReason,
      tokens: result.usage?.totalTokens,
      hasToolCalls: Boolean(result.toolCalls?.length),
    });

    return result;
  }

  // ─── Abstract hooks for subclasses ───────────────────────────────────────

  protected abstract buildRequest(prompt: LLMPrompt, options?: LLMCompletionOptions): { url: string; init: RequestInit };
  protected abstract buildMessagesRequest(messages: readonly LLMMessage[], options?: LLMCompletionOptions): { url: string; init: RequestInit };
  protected abstract parseResponse(payload: unknown): LLMCompletionResult;
  /** Parse a single SSE line into a StreamChunk (return null to skip) */
  protected abstract parseStreamLine(line: string): StreamChunk | null;
  protected abstract getDefaultBaseUrl(): string;
  protected abstract getDefaultModel(): string;
  protected abstract getVendorName(): string;

  // ─── Retry logic ─────────────────────────────────────────────────────────

  private async fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, init);

        // If retryable status and we have attempts left, retry
        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < this.maxRetries) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
          this.logger.warn('llm_retrying', {
            vendor: this.vendor,
            attempt: attempt + 1,
            status: response.status,
            delayMs: delay,
          });
          await sleep(delay);
          continue;
        }

        return response;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Don't retry timeouts or non-network errors
        if (err instanceof LLMTimeoutError || attempt >= this.maxRetries) {
          throw err;
        }

        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        this.logger.warn('llm_retry_on_error', {
          vendor: this.vendor,
          attempt: attempt + 1,
          error: lastError.message,
          delayMs: delay,
        });
        await sleep(delay);
      }
    }

    throw lastError ?? new LLMError(`${this.vendor} request failed after retries`, this.vendor);
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new LLMTimeoutError(this.vendor, this.timeoutMs);
      }
      throw new LLMError(
        `${this.vendor} network error: ${err instanceof Error ? err.message : 'unknown'}`,
        this.vendor,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  // ─── JSON parsing ────────────────────────────────────────────────────────

  private parseAndValidate<T>(content: string, schema: z.ZodSchema<T>): T {
    const jsonStr = extractJsonObject(content);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      this.logger.error('llm_invalid_output_json', {
        vendor: this.vendor,
        snippet: content.slice(0, 100),
      });
      throw new LLMError(`${this.vendor} output is not valid JSON: ${content.slice(0, 100)}`, this.vendor);
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`);
      this.logger.error('llm_schema_validation_failed', {
        vendor: this.vendor,
        issues,
      });
      throw new LLMError(`${this.vendor} output failed schema validation: ${issues.join('; ')}`, this.vendor);
    }

    return result.data;
  }
}

// ─── Utility Functions ───────────────────────────────────────────────────────

/** Extract JSON object from LLM output (handles fences, preambles, trailing) */
export function extractJsonObject(raw: string): string {
  const stripped = stripMarkdownFence(raw.trim());
  const first = stripped.indexOf('{');
  const last = stripped.lastIndexOf('}');
  if (first === -1 || last === -1 || last < first) return stripped;
  return stripped.slice(first, last + 1);
}

function stripMarkdownFence(raw: string): string {
  if (!raw.startsWith('```')) return raw;
  const match = raw.match(/^```(?:json|JSON)?\s*\n?([\s\S]*?)\n?```$/);
  return match?.[1]?.trim() ?? raw;
}

async function safeReadText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ''; }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
