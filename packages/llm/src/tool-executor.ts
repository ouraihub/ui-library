/**
 * @ouraihub/llm — Tool Executor.
 *
 * Manages the multi-round tool calling loop:
 * 1. Send prompt to LLM with tool definitions
 * 2. If model requests tool calls → execute handlers → feed results back
 * 3. Repeat until model produces final text response
 * 4. Validate against schema and return
 */

import type { z } from 'zod';
import type {
  ILLMProvider,
  IToolExecutor,
  LLMPrompt,
  LLMTool,
  ToolRegistration,
} from './interfaces.js';
import { LLMError } from './errors.js';

const DEFAULT_MAX_ROUNDS = 5;

export class ToolExecutor implements IToolExecutor {
  private tools: Map<string, ToolRegistration> = new Map();

  register(tools: readonly ToolRegistration[]): void {
    for (const tool of tools) {
      this.tools.set(tool.definition.name, tool);
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

    // First call
    let result = await provider.raw(prompt, { jsonMode: true, tools: toolDefs });
    let round = 0;

    // Tool call loop
    while (result.toolCalls && result.toolCalls.length > 0 && round < maxRounds) {
      round++;

      // Execute each tool call
      const toolResults: string[] = [];
      for (const call of result.toolCalls) {
        const registration = this.tools.get(call.name);
        if (!registration) {
          toolResults.push(JSON.stringify({ error: `Unknown tool: ${call.name}` }));
          continue;
        }

        try {
          const args = JSON.parse(call.arguments) as Record<string, unknown>;
          const output = await registration.handler(args);
          toolResults.push(output);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Tool execution failed';
          toolResults.push(JSON.stringify({ error: msg }));
        }
      }

      // Build follow-up prompt with tool results
      const toolContext = result.toolCalls
        .map((call, i) => `[Tool: ${call.name}] Result: ${toolResults[i]}`)
        .join('\n\n');

      const followUp: LLMPrompt = {
        system: prompt.system,
        user: `${prompt.user}\n\n--- Tool Results ---\n${toolContext}\n\nBased on the tool results above, provide your final answer as JSON.`,
      };

      result = await provider.raw(followUp, { jsonMode: true, tools: toolDefs });
    }

    if (round >= maxRounds && result.toolCalls && result.toolCalls.length > 0) {
      throw new LLMError(
        `Tool call loop exceeded ${maxRounds} rounds without final response`,
        'tool-executor',
      );
    }

    // Parse and validate final content
    if (!result.content) {
      throw new LLMError('LLM returned empty content after tool calls', 'tool-executor');
    }

    const jsonStr = extractJson(result.content);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new LLMError(`Final output is not valid JSON: ${result.content.slice(0, 100)}`, 'tool-executor');
    }

    const validated = schema.safeParse(parsed);
    if (!validated.success) {
      throw new LLMError(
        `Final output failed schema validation: ${validated.error.issues[0]?.message}`,
        'tool-executor',
      );
    }

    return validated.data;
  }
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  // Strip markdown fence
  if (trimmed.startsWith('```')) {
    const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
    if (match?.[1]) return match[1].trim();
  }
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}
