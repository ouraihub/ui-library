/**
 * @ouraihub/llm — Package entry point.
 *
 * A complete LLM abstraction with:
 * - Multi-provider support (OpenAI-compatible + Anthropic)
 * - Structured output (Zod schema validation)
 * - Tool calling / MCP support
 * - Skill system (SKILL.md → system prompt)
 *
 * Usage:
 *   import { createProvider, ToolExecutor, SkillLoader, MCPClient } from '@ouraihub/llm';
 *
 *   // Basic structured output
 *   const llm = createProvider({ apiKey, baseUrl, model });
 *   const result = await llm.complete(prompt, schema);
 *
 *   // With skills
 *   const skills = new SkillLoader();
 *   skills.add('my-skill', skillContent);
 *   const prompt = skills.buildPrompt('user question');
 *   await llm.complete(prompt, schema);
 *
 *   // With MCP tools
 *   const mcp = new MCPClient();
 *   await mcp.connect({ url: 'http://localhost:3000/mcp' });
 *   const executor = new ToolExecutor();
 *   executor.register(mcp.getToolRegistrations());
 *   await executor.completeWithTools(llm, prompt, schema);
 */

import type { ILLMProvider, CreateProviderOptions } from './interfaces.js';
import { OpenAIProvider } from './openai-provider.js';
import { AnthropicProvider } from './anthropic-provider.js';

/**
 * Create an LLM provider instance.
 *
 * @param options.provider - 'openai' (default, supports any OpenAI-compatible relay) or 'anthropic'
 * @param options.apiKey - API key (required)
 * @param options.baseUrl - Custom base URL (optional, for relay/proxy services)
 * @param options.model - Model name (optional, defaults to vendor's recommended)
 * @param options.timeoutMs - Request timeout (default: 30000ms)
 */
export function createProvider(options: CreateProviderOptions): ILLMProvider {
  const { provider = 'openai', ...config } = options;

  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'openai':
    default:
      return new OpenAIProvider(config);
  }
}

// ─── Provider exports ────────────────────────────────────────────────────────

export { OpenAIProvider } from './openai-provider.js';
export { AnthropicProvider } from './anthropic-provider.js';

// ─── Tool system (MCP) ───────────────────────────────────────────────────────

export { ToolExecutor } from './tool-executor.js';
export { MCPClient } from './mcp-client.js';

// ─── Skill system ────────────────────────────────────────────────────────────

export { SkillLoader } from './skill-loader.js';

// ─── Errors ──────────────────────────────────────────────────────────────────

export { LLMError, LLMTimeoutError, LLMSchemaError } from './errors.js';

// ─── Logger ──────────────────────────────────────────────────────────────────

export { noopLogger, consoleLogger } from './logger.js';

// ─── Utilities ───────────────────────────────────────────────────────────────

export { extractJsonObject } from './base-provider.js';

// ─── Type exports ────────────────────────────────────────────────────────────

export type {
  // Core
  ILLMProvider,
  LLMPrompt,
  LLMMessage,
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMUsage,
  LLMProviderConfig,
  CreateProviderOptions,
  // Streaming
  StreamChunk,
  StreamToolCallDelta,
  // Tools
  IToolExecutor,
  LLMTool,
  LLMToolCall,
  ToolHandler,
  ToolRegistration,
} from './interfaces.js';

export type {
  SkillEntry,
  SkillPromptOptions,
} from './skill-loader.js';

export type {
  MCPToolDefinition,
  MCPToolResult,
  MCPServerConfig,
} from './mcp-client.js';
