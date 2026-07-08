/**
 * @ouraihub/llm — Base LLM Provider (Template Method Pattern).
 *
 * Encapsulates common flow:
 *  - AbortController timeout
 *  - HTTP fetch with error handling
 *  - JSON extraction from model output (handles markdown fences, preambles)
 *  - Zod schema validation
 *
 * Subclasses implement two hooks:
 *  - buildRequest() — vendor-specific request construction
 *  - parseResponse() — vendor-specific response parsing
 */

import type { z } from 'zod';
import type {
  ILLMProvider,
  LLMPrompt,
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMProviderConfig,
} from './interfaces.js';
import { LLMError, LLMTimeoutError } from './errors.js';

const DEFAULT_TIMEOUT_MS = 30_000;

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

  protected constructor(config: Required<Pick<LLMProviderConfig, 'apiKey'>> & LLMProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? this.getDefaultBaseUrl()).replace(/\/+$/, '');
    this.model = config.model ?? this.getDefaultModel();
    this.vendor = config.vendor ?? this.getVendorName();
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /** Structured completion with Zod schema validation */
  async complete<T>(prompt: LLMPrompt, schema: z.ZodSchema<T>, options?: LLMCompletionOptions): Promise<T> {
    const result = await this.raw(prompt, { ...options, jsonMode: true });
    return this.parseAndValidate(result.content, schema);
  }

  /** Raw completion without schema enforcement */
  async raw(prompt: LLMPrompt, options?: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const { url, init } = this.buildRequest(prompt, options);
    const start = Date.now();

    const response = await this.fetchWithTimeout(url, init);
    const duration = Date.now() - start;

    if (!response.ok) {
      const body = await safeReadText(response);
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
      throw new LLMError(`${this.vendor} response is not valid JSON`, this.vendor, response.status, duration);
    }

    return this.parseResponse(payload);
  }

  // ─── Abstract hooks for subclasses ───────────────────────────────────────

  /** Construct vendor-specific request */
  protected abstract buildRequest(
    prompt: LLMPrompt,
    options?: LLMCompletionOptions,
  ): { url: string; init: RequestInit };

  /** Parse vendor-specific response into common shape */
  protected abstract parseResponse(payload: unknown): LLMCompletionResult;

  /** Vendor's default base URL */
  protected abstract getDefaultBaseUrl(): string;

  /** Vendor's default model */
  protected abstract getDefaultModel(): string;

  /** Vendor name for logging */
  protected abstract getVendorName(): string;

  // ─── Private helpers ─────────────────────────────────────────────────────

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

  private parseAndValidate<T>(content: string, schema: z.ZodSchema<T>): T {
    const jsonStr = extractJsonObject(content);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new LLMError(
        `${this.vendor} output is not valid JSON: ${content.slice(0, 100)}`,
        this.vendor,
      );
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`);
      throw new LLMError(
        `${this.vendor} output failed schema validation: ${issues.join('; ')}`,
        this.vendor,
      );
    }

    return result.data;
  }
}

// ─── Utility Functions (exported for testing) ────────────────────────────────

/**
 * Extract JSON object from LLM output.
 * Handles: markdown fences, preambles, trailing text.
 */
export function extractJsonObject(raw: string): string {
  const stripped = stripMarkdownFence(raw.trim());
  const first = stripped.indexOf('{');
  const last = stripped.lastIndexOf('}');
  if (first === -1 || last === -1 || last < first) return stripped;
  return stripped.slice(first, last + 1);
}

/** Remove markdown code fences (```json ... ```) */
function stripMarkdownFence(raw: string): string {
  if (!raw.startsWith('```')) return raw;
  const match = raw.match(/^```(?:json|JSON)?\s*\n?([\s\S]*?)\n?```$/);
  return match?.[1]?.trim() ?? raw;
}

async function safeReadText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ''; }
}
