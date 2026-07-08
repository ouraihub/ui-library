/**
 * @ouraihub/llm — OpenAI-compatible Provider.
 *
 * Supports:
 *  - OpenAI official API
 *  - Any OpenAI Chat Completions compatible relay/proxy
 *  - Tool calling (function calling format)
 */

import type { LLMPrompt, LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMToolCall, StreamChunk } from './interfaces.js';
import { BaseLLMProvider, type BaseLLMProviderConfig } from './base-provider.js';
import type { LLMProviderConfig } from './interfaces.js';

// OpenAI-compatible provider constants removed — temperature is now opt-in

export class OpenAIProvider extends BaseLLMProvider {
  constructor(config: Pick<LLMProviderConfig, 'apiKey'> & Partial<BaseLLMProviderConfig>) {
    super({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      timeoutMs: config.timeoutMs,
      vendor: config.vendor ?? 'openai',
      logger: config.logger,
      maxRetries: config.maxRetries,
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
    const messages: Array<Record<string, unknown>> = [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ];
    return this.buildChatRequest(messages, options);
  }

  protected buildMessagesRequest(messages: readonly LLMMessage[], options?: LLMCompletionOptions): { url: string; init: RequestInit } {
    const formatted = messages.map((m) => {
      const msg: Record<string, unknown> = { role: m.role, content: m.content };
      if (m.name) msg.name = m.name;
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      return msg;
    });
    return this.buildChatRequest(formatted, options);
  }

  private buildChatRequest(messages: Array<Record<string, unknown>>, options?: LLMCompletionOptions): { url: string; init: RequestInit } {
    const url = `${this.baseUrl}/chat/completions`;

    const body: Record<string, unknown> = {
      model: this.model,
      messages,
    };

    // Only send temperature when explicitly set (reasoning models don't support it)
    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }

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

    if (options?.stream) {
      body.stream = true;
    }

    return {
      url,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...this.customHeaders,
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

  protected parseStreamLine(line: string): StreamChunk | null {
    // OpenAI SSE format: "data: {...}" or "data: [DONE]"
    if (!line.startsWith('data: ')) return null;
    const data = line.slice(6).trim();
    if (data === '[DONE]') return { text: '', done: true };

    try {
      const json = JSON.parse(data) as OpenAIStreamChunk;
      const choice = json.choices?.[0];
      if (!choice) return null;

      const delta = choice.delta;
      const text = delta?.content ?? '';
      const finishReason = choice.finish_reason ?? undefined;
      const done = finishReason === 'stop' || finishReason === 'tool_calls';

      // Tool call delta
      let toolCall: StreamChunk['toolCall'];
      if (delta?.tool_calls?.[0]) {
        const tc = delta.tool_calls[0];
        toolCall = {
          id: tc.id,
          name: tc.function?.name,
          argumentsDelta: tc.function?.arguments ?? '',
        };
      }

      return {
        text,
        toolCall,
        done,
        finishReason: done ? finishReason : undefined,
        usage: json.usage ? {
          promptTokens: json.usage.prompt_tokens,
          completionTokens: json.usage.completion_tokens,
          totalTokens: json.usage.total_tokens,
        } : undefined,
      };
    } catch {
      return null;
    }
  }
}

// ─── Response type (minimal, tolerant) ───────────────────────────────────────

interface OpenAIStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
      tool_calls?: Array<{
        id?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

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
