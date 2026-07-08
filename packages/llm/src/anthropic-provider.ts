/**
 * @ouraihub/llm — Anthropic Provider.
 *
 * Supports Anthropic's native Messages API format.
 * Tool calling uses Anthropic's tool_use content blocks.
 */

import type { LLMPrompt, LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMToolCall, StreamChunk } from './interfaces.js';
import { BaseLLMProvider, type BaseLLMProviderConfig } from './base-provider.js';
import type { LLMProviderConfig } from './interfaces.js';

const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicProvider extends BaseLLMProvider {
  constructor(config: Pick<LLMProviderConfig, 'apiKey'> & Partial<BaseLLMProviderConfig>) {
    super({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      timeoutMs: config.timeoutMs,
      vendor: config.vendor ?? 'anthropic',
      logger: config.logger,
      maxRetries: config.maxRetries,
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
    const messages: Array<Record<string, unknown>> = [{ role: 'user', content: prompt.user }];
    return this.buildAnthropicRequest(prompt.system, messages, options);
  }

  protected buildMessagesRequest(messages: readonly LLMMessage[], options?: LLMCompletionOptions): { url: string; init: RequestInit } {
    const system = messages.find((m) => m.role === 'system')?.content ?? '';
    const nonSystem = messages
      .filter((m) => m.role !== 'system')
      .map((m) => {
        const msg: Record<string, unknown> = { role: m.role, content: m.content };
        if (m.name) msg.name = m.name;
        if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
        return msg;
      });
    return this.buildAnthropicRequest(system, nonSystem, options);
  }

  private buildAnthropicRequest(system: string, messages: Array<Record<string, unknown>>, options?: LLMCompletionOptions): { url: string; init: RequestInit } {
    const url = `${this.baseUrl}/v1/messages`;

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
      system,
      messages,
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

    if (options?.stream) {
      body.stream = true;
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

  protected parseStreamLine(line: string): StreamChunk | null {
    // Anthropic SSE format: "event: ..." then "data: {...}"
    if (!line.startsWith('data: ')) return null;
    const data = line.slice(6).trim();
    if (!data) return null;

    try {
      const json = JSON.parse(data) as AnthropicStreamEvent;

      switch (json.type) {
        case 'content_block_delta': {
          const delta = json.delta;
          if (delta?.type === 'text_delta') {
            return { text: delta.text ?? '', done: false };
          }
          if (delta?.type === 'input_json_delta') {
            return { text: '', toolCall: { argumentsDelta: delta.partial_json ?? '' }, done: false };
          }
          return null;
        }
        case 'content_block_start': {
          if (json.content_block?.type === 'tool_use') {
            return {
              text: '',
              toolCall: { id: json.content_block.id, name: json.content_block.name, argumentsDelta: '' },
              done: false,
            };
          }
          return null;
        }
        case 'message_delta': {
          return {
            text: '',
            done: json.delta?.stop_reason === 'end_turn' || json.delta?.stop_reason === 'tool_use',
            finishReason: json.delta?.stop_reason ?? undefined,
            usage: json.usage ? {
              promptTokens: json.usage.input_tokens,
              completionTokens: json.usage.output_tokens,
              totalTokens: (json.usage.input_tokens ?? 0) + (json.usage.output_tokens ?? 0),
            } : undefined,
          };
        }
        case 'message_stop':
          return { text: '', done: true };
        default:
          return null;
      }
    } catch {
      return null;
    }
  }
}

// ─── Response type ───────────────────────────────────────────────────────────

interface AnthropicStreamEvent {
  type: string;
  delta?: { type?: string; text?: string; partial_json?: string; stop_reason?: string };
  content_block?: { type?: string; id?: string; name?: string };
  usage?: { input_tokens?: number; output_tokens?: number };
}

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
