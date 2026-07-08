/**
 * @ouraihub/llm — Tool Executor.
 *
 * Manages the multi-round tool calling loop using proper multi-turn
 * message history (assistant tool_calls → tool results → assistant response).
 *
 * Flow:
 * 1. Send prompt to LLM with tool definitions
 * 2. If model requests tool calls:
 *    a. Execute each tool handler
 *    b. Append assistant message (with tool_calls) + tool result messages
 *    c. Re-send full conversation history to LLM
 * 3. Repeat until model produces final text response (no more tool calls)
 * 4. Validate final content against Zod schema
 */

import type { z } from 'zod';
import type {
  ILLMProvider,
  IToolExecutor,
  LLMPrompt,
  LLMMessage,
  LLMTool,
  LLMToolCall,
  LLMCompletionResult,
  ToolRegistration,
} from './interfaces.js';
import type { ILogger } from './logger.js';
import { noopLogger } from './logger.js';
import { LLMError } from './errors.js';

const DEFAULT_MAX_ROUNDS = 5;

/** Options for tool execution */
export interface ToolExecutorOptions {
  readonly maxRounds?: number;
  readonly logger?: ILogger;
}

export class ToolExecutor implements IToolExecutor {
  private readonly tools: Map<string, ToolRegistration> = new Map();
  private readonly logger: ILogger;

  constructor(options?: { logger?: ILogger }) {
    this.logger = options?.logger ?? noopLogger;
  }

  register(tools: readonly ToolRegistration[]): void {
    for (const tool of tools) {
      this.tools.set(tool.definition.name, tool);
      this.logger.info('tool_registered', { name: tool.definition.name });
    }
  }

  async completeWithTools<T>(
    provider: ILLMProvider,
    prompt: LLMPrompt,
    schema: z.ZodSchema<T>,
    options?: { maxRounds?: number },
  ): Promise<T> {
    const maxRounds = options?.maxRounds ?? DEFAULT_MAX_ROUNDS;
    const toolDefs: LLMTool[] = Array.from(this.tools.values()).map((t) => t.definition);

    // Maintain conversation history as structured messages
    const messages: ConversationMessage[] = [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ];

    let round = 0;

    while (round <= maxRounds) {
      round++;

      this.logger.info('tool_round_start', { round, messageCount: messages.length });

      // Call LLM with current conversation + tools
      const result = await this.callWithMessages(provider, messages, toolDefs);

      // If no tool calls, we have the final response
      if (!result.toolCalls || result.toolCalls.length === 0) {
        this.logger.info('tool_round_final', { round, contentLength: result.content.length });
        return this.validateOutput(result.content, schema);
      }

      // Model requested tool calls — execute them
      this.logger.info('tool_calls_requested', {
        round,
        toolCount: result.toolCalls.length,
        tools: result.toolCalls.map((tc) => tc.name),
      });

      // Append assistant message with tool calls
      messages.push({
        role: 'assistant',
        content: result.content || '',
        toolCalls: result.toolCalls,
      });

      // Execute each tool and append results
      for (const call of result.toolCalls) {
        const output = await this.executeTool(call);
        messages.push({
          role: 'tool',
          content: output,
          toolCallId: call.id,
          name: call.name,
        });
      }
    }

    throw new LLMError(
      `Tool call loop exceeded ${maxRounds} rounds without final response`,
      'tool-executor',
    );
  }

  // ─── Private methods ─────────────────────────────────────────────────────

  private async executeTool(call: LLMToolCall): Promise<string> {
    const registration = this.tools.get(call.name);
    if (!registration) {
      this.logger.warn('tool_not_found', { name: call.name });
      return JSON.stringify({ error: `Unknown tool: ${call.name}` });
    }

    try {
      const args = JSON.parse(call.arguments) as Record<string, unknown>;
      this.logger.info('tool_executing', { name: call.name, callId: call.id });
      const output = await registration.handler(args);
      this.logger.info('tool_executed', { name: call.name, outputLength: output.length });
      return output;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tool execution failed';
      this.logger.error('tool_execution_error', { name: call.name, error: msg });
      return JSON.stringify({ error: msg });
    }
  }

  /**
   * Call LLM with native multi-turn messages API.
   */
  private async callWithMessages(
    provider: ILLMProvider,
    messages: ConversationMessage[],
    tools: LLMTool[],
  ): Promise<LLMCompletionResult> {
    // Convert internal messages to LLMMessage format
    const llmMessages: LLMMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
      name: m.name,
      tool_call_id: m.toolCallId,
    }));

    return provider.messages(llmMessages, { jsonMode: true, tools });
  }

  private validateOutput<T>(content: string, schema: z.ZodSchema<T>): T {
    if (!content) {
      throw new LLMError('LLM returned empty content after tool calls', 'tool-executor');
    }

    const jsonStr = extractJson(content);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new LLMError(`Final output is not valid JSON: ${content.slice(0, 100)}`, 'tool-executor');
    }

    const validated = schema.safeParse(parsed);
    if (!validated.success) {
      const issue = validated.error.issues[0];
      throw new LLMError(
        `Final output failed schema validation: ${issue?.path.join('.')}: ${issue?.message}`,
        'tool-executor',
      );
    }

    return validated.data;
  }
}

// ─── Internal types ──────────────────────────────────────────────────────────

interface ConversationMessage {
  readonly role: 'system' | 'user' | 'assistant' | 'tool';
  readonly content: string;
  readonly toolCalls?: readonly LLMToolCall[];
  readonly toolCallId?: string;
  readonly name?: string;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
    if (match?.[1]) return match[1].trim();
  }
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}
