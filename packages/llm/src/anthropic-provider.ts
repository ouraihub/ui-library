/**
 * @ouraihub/llm — Anthropic Provider.
 *
 * Supports Anthropic's native Messages API format.
 * Tool calling uses Anthropic's tool_use content blocks.
 */

import type { LLMPrompt, LLMCompletionOptions, LLMCompletionResult, LLMToolCall } from './interfaces.js';
import { BaseLLMProvider } from './base-provider.js';
import type { LLMProviderConfig } from './interfaces.js';

const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicProvider extends BaseLLMProvider {
  constructor(config: Pick<LLMProviderConfig, 'apiKey'> & Partial<LLMProviderConfig>) {
    super({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      timeoutMs: config.timeoutMs,
      vendor: config.vendor ?? 'anthropic',
    });
  }

  protected getDefaultBaseUrl(): string {
    return 'https://api.anthropic.com';
  }

  protected getDefaultModel(): string {
    return 'claude-sonnet-4-20250514';
  }

  protected getVendorName(): string {
    return 'anthropic';
  }

  protected buildRequest(prompt: LLMPrompt, options?: LLMCompletionOptions): { url: string; init: RequestInit } {
    const url = `${this.baseUrl}/v1/messages`;

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    };

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }

    if (options?.tools && options.tools.length > 0) {
      body.tools = options.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    return {
      url,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      },
    };
  }

  protected parseResponse(payload: unknown): LLMCompletionResult {
    const data = payload as AnthropicResponse;

    // Extract text content
    const textBlocks = data.content?.filter((b) => b.type === 'text') ?? [];
    const content = textBlocks.map((b) => b.text ?? '').join('');

    // Extract tool use blocks
    let toolCalls: LLMToolCall[] | undefined;
    const toolBlocks = data.content?.filter((b) => b.type === 'tool_use') ?? [];
    if (toolBlocks.length > 0) {
      toolCalls = toolBlocks.map((b) => ({
        id: b.id ?? '',
        name: b.name ?? '',
        arguments: JSON.stringify(b.input ?? {}),
      }));
    }

    return {
      content,
      toolCalls,
      finishReason: data.stop_reason,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0),
          }
        : undefined,
    };
  }
}

// ─── Response type ───────────────────────────────────────────────────────────

interface AnthropicResponse {
  content?: Array<{
    type: 'text' | 'tool_use';
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
  }>;
  stop_reason?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}
