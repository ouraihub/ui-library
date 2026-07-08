/**
 * @ouraihub/llm — Interface definitions.
 *
 * All modules communicate through these typed contracts.
 * Consumers depend on interfaces, never on concrete implementations.
 */

import type { z } from 'zod';

// ─── Core Interfaces ─────────────────────────────────────────────────────────

/** A prompt pair for LLM completion */
export interface LLMPrompt {
  readonly system: string;
  readonly user: string;
}

/** Message in a multi-turn conversation */
export interface LLMMessage {
  readonly role: 'system' | 'user' | 'assistant' | 'tool';
  readonly content: string;
  readonly name?: string;
  readonly tool_call_id?: string;
}

/** Tool definition (MCP-compatible shape) */
export interface LLMTool {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}

/** Tool call request from the model */
export interface LLMToolCall {
  readonly id: string;
  readonly name: string;
  readonly arguments: string;
}

/** Completion options */
export interface LLMCompletionOptions {
  /** Override temperature (default: provider-specific) */
  readonly temperature?: number;
  /** Override max tokens */
  readonly maxTokens?: number;
  /** Request JSON mode */
  readonly jsonMode?: boolean;
  /** Tools available for this completion */
  readonly tools?: readonly LLMTool[];
}

/** Raw completion result (before schema validation) */
export interface LLMCompletionResult {
  readonly content: string;
  readonly toolCalls?: readonly LLMToolCall[];
  readonly finishReason?: string;
  readonly usage?: LLMUsage;
}

/** Token usage info */
export interface LLMUsage {
  readonly promptTokens?: number;
  readonly completionTokens?: number;
  readonly totalTokens?: number;
}

/**
 * LLM Provider — core interface.
 *
 * Three completion modes:
 * - `complete<T>()` — structured output with Zod schema validation
 * - `raw()` — raw completion without schema enforcement
 * - `messages()` — native multi-turn conversation (for tool call loops)
 */
export interface ILLMProvider {
  /** Structured completion: prompt → validated T */
  complete<T>(prompt: LLMPrompt, schema: z.ZodSchema<T>, options?: LLMCompletionOptions): Promise<T>;

  /** Raw completion: prompt → string content */
  raw(prompt: LLMPrompt, options?: LLMCompletionOptions): Promise<LLMCompletionResult>;

  /** Multi-turn completion: full message history → result (for tool call loops) */
  messages(messages: readonly LLMMessage[], options?: LLMCompletionOptions): Promise<LLMCompletionResult>;
}

// ─── Tool Executor (for MCP support) ─────────────────────────────────────────

/** Handler for a single tool */
export type ToolHandler = (args: Record<string, unknown>) => Promise<string>;

/** Tool registration entry */
export interface ToolRegistration {
  readonly definition: LLMTool;
  readonly handler: ToolHandler;
}

/**
 * Tool Executor — manages tool call loops.
 *
 * When the model requests a tool call, the executor:
 * 1. Looks up the registered handler
 * 2. Executes it with the model's arguments
 * 3. Feeds the result back to the model
 * 4. Repeats until the model produces a final response
 */
export interface IToolExecutor {
  /** Register tools for use in completions */
  register(tools: readonly ToolRegistration[]): void;

  /** Run a completion with automatic tool call loop */
  completeWithTools<T>(
    provider: ILLMProvider,
    prompt: LLMPrompt,
    schema: z.ZodSchema<T>,
    options?: { maxRounds?: number },
  ): Promise<T>;
}

// ─── Provider Configuration ──────────────────────────────────────────────────

/** Configuration for creating a provider */
export interface LLMProviderConfig {
  /** API key (required) */
  readonly apiKey: string;
  /** Base URL (optional, defaults to vendor's official endpoint) */
  readonly baseUrl?: string;
  /** Model name (optional, defaults to vendor's recommended model) */
  readonly model?: string;
  /** Request timeout in ms (default: 30000) */
  readonly timeoutMs?: number;
  /** Vendor identifier for logging */
  readonly vendor?: string;
}

/** Factory options */
export interface CreateProviderOptions extends LLMProviderConfig {
  /** Provider type: 'openai' (default) or 'anthropic' */
  readonly provider?: 'openai' | 'anthropic';
}
