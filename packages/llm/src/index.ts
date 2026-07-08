/**
 * @ouraihub/llm — Package entry point.
 *
 * Usage:
 *   import { createProvider, ToolExecutor } from '@ouraihub/llm';
 *
 *   const llm = createProvider({ apiKey: '...', baseUrl: '...', model: '...' });
 *   const result = await llm.complete(prompt, schema);
 *
 *   // With tools (MCP)
 *   const executor = new ToolExecutor();
 *   executor.register([{ definition: {...}, handler: async (args) => '...' }]);
 *   const result = await executor.completeWithTools(llm, prompt, schema);
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

// ─── Re-exports ──────────────────────────────────────────────────────────────

export { OpenAIProvider } from './openai-provider.js';
export { AnthropicProvider } from './anthropic-provider.js';
export { ToolExecutor } from './tool-executor.js';
export { LLMError, LLMTimeoutError, LLMSchemaError } from './errors.js';
export { extractJsonObject } from './base-provider.js';

export type {
  ILLMProvider,
  IToolExecutor,
  LLMPrompt,
  LLMMessage,
  LLMTool,
  LLMToolCall,
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMUsage,
  LLMProviderConfig,
  CreateProviderOptions,
  ToolHandler,
  ToolRegistration,
} from './interfaces.js';
