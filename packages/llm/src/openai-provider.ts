/**
 * @ouraihub/llm — OpenAI-compatible Provider.
 *
 * Supports:
 *  - OpenAI official API
 *  - Any OpenAI Chat Completions compatible relay/proxy
 *  - Tool calling (function calling format)
 */

import type { LLMPrompt, LLMCompletionOptions, LLMCompletionResult, LLMToolCall } from './interfaces.js';
import { BaseLLMProvider } from './base-provider.js';
import type { LLMProviderConfig } from './interfaces.js';

const DEFAULT_TEMPERATURE = 0.7;

export class OpenAIProvider extends BaseLLMProvider {
  constructor(config: Pick<LLMProviderConfig, 'apiKey'> & Partial<LLMProviderConfig>) {
    super({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      timeoutMs: config.timeoutMs,
      vendor: config.vendor ?? 'openai',
    });
  }

  protected getDefaultBaseUrl(): string {
    return 'https://api.openai.com/v1';
  }

  protected getDefaultModel(): string {
    return 'gpt-4o-mini';
  }

  protected getVendorName(): string {
    return 'openai';
  }

  protected buildRequest(prompt: LLMPrompt, options?: LLMCompletionOptions): { url: string; init: RequestInit } {
    const url = `${this.baseUrl}/chat/completions`;

    const messages = [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ];

    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
    };

    if (options?.maxTokens) {
      body.max_tokens = options.maxTokens;
    }

    if (options?.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    if (options?.tools && options.tools.length > 0) {
      body.tools = options.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    return {
      url,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      },
    };
  }

  protected parseResponse(payload: unknown): LLMCompletionResult {
    const data = payload as OpenAIResponse;
    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? '';
    const finishReason = choice?.finish_reason;

    // Parse tool calls if present
    let toolCalls: LLMToolCall[] | undefined;
    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      toolCalls = choice.message.tool_calls.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments,
      }));
    }

    return {
      content,
      toolCalls,
      finishReason,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}

// ─── Response type (minimal, tolerant) ───────────────────────────────────────

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: Array<{
        id: string;
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}
