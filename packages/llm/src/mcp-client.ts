/**
 * @ouraihub/llm — MCP Client.
 *
 * Connects to MCP (Model Context Protocol) servers and converts their
 * tool definitions into the format expected by ILLMProvider and ToolExecutor.
 *
 * Supports:
 * - HTTP/SSE transport (for remote MCP servers)
 * - Direct function registration (for in-process tools)
 * - Tool discovery and schema conversion
 *
 * Usage:
 *   const mcp = new MCPClient();
 *   await mcp.connect('http://localhost:3000/mcp');
 *   const tools = mcp.getToolRegistrations();
 *   executor.register(tools);
 */

import type { LLMTool, ToolRegistration, ToolHandler } from './interfaces.js';
import { LLMError } from './errors.js';

/** MCP server tool definition (from server's tools/list response) */
export interface MCPToolDefinition {
  readonly name: string;
  readonly description?: string;
  readonly inputSchema?: Record<string, unknown>;
}

/** MCP tool call result */
export interface MCPToolResult {
  readonly content: Array<{ type: string; text?: string }>;
  readonly isError?: boolean;
}

/** MCP server connection config */
export interface MCPServerConfig {
  /** Server URL (HTTP endpoint) */
  readonly url: string;
  /** Optional auth token */
  readonly authToken?: string;
  /** Request timeout (default: 15000ms) */
  readonly timeoutMs?: number;
  /** Server name (for logging) */
  readonly name?: string;
}

/**
 * MCPClient — connects to MCP servers and provides tool registrations.
 *
 * This is a lightweight HTTP-based MCP client that supports:
 * - Tool discovery (tools/list)
 * - Tool invocation (tools/call)
 * - Converting MCP tools to ToolRegistration format for ToolExecutor
 */
export class MCPClient {
  private servers: Map<string, MCPServerState> = new Map();

  /**
   * Connect to an MCP server and discover its tools.
   * Returns the number of tools discovered.
   */
  async connect(config: MCPServerConfig): Promise<number> {
    const serverName = config.name ?? new URL(config.url).hostname;
    const tools = await this.discoverTools(config);

    this.servers.set(serverName, { config, tools });
    return tools.length;
  }

  /** Disconnect from a server */
  disconnect(name: string): void {
    this.servers.delete(name);
  }

  /** Refresh tool list from a connected server (re-discovery) */
  async refresh(name: string): Promise<number> {
    const state = this.servers.get(name);
    if (!state) {
      throw new LLMError(`MCP server '${name}' is not connected`, 'mcp');
    }
    const tools = await this.discoverTools(state.config);
    this.servers.set(name, { config: state.config, tools });
    return tools.length;
  }

  /** Health check: ping a connected server */
  async healthCheck(name: string): Promise<boolean> {
    const state = this.servers.get(name);
    if (!state) return false;
    try {
      await this.rpcCall(state.config, 'ping', {});
      return true;
    } catch {
      return false;
    }
  }

  /** Get all connected server names */
  getServerNames(): string[] {
    return Array.from(this.servers.keys());
  }

  /** Get all tool definitions from all connected servers */
  getAllTools(): LLMTool[] {
    const tools: LLMTool[] = [];
    for (const state of this.servers.values()) {
      for (const tool of state.tools) {
        tools.push({
          name: tool.name,
          description: tool.description ?? '',
          parameters: tool.inputSchema ?? { type: 'object', properties: {} },
        });
      }
    }
    return tools;
  }

  /**
   * Get tool registrations ready for ToolExecutor.register().
   * Each tool's handler calls the MCP server via HTTP.
   */
  getToolRegistrations(): ToolRegistration[] {
    const registrations: ToolRegistration[] = [];

    for (const state of this.servers.values()) {
      for (const tool of state.tools) {
        const definition: LLMTool = {
          name: tool.name,
          description: tool.description ?? '',
          parameters: tool.inputSchema ?? { type: 'object', properties: {} },
        };

        const handler: ToolHandler = async (args) => {
          return this.callTool(state.config, tool.name, args);
        };

        registrations.push({ definition, handler });
      }
    }

    return registrations;
  }

  // ─── Private methods ─────────────────────────────────────────────────────

  /** Discover tools from MCP server */
  private async discoverTools(config: MCPServerConfig): Promise<MCPToolDefinition[]> {
    const response = await this.rpcCall(config, 'tools/list', {});

    const data = response as { tools?: MCPToolDefinition[] };
    return data.tools ?? [];
  }

  /** Call a tool on the MCP server */
  private async callTool(config: MCPServerConfig, toolName: string, args: Record<string, unknown>): Promise<string> {
    const response = await this.rpcCall(config, 'tools/call', {
      name: toolName,
      arguments: args,
    });

    const result = response as MCPToolResult;
    if (result.isError) {
      const errorText = result.content?.find((c) => c.type === 'text')?.text ?? 'Tool call failed';
      throw new LLMError(`MCP tool '${toolName}' returned error: ${errorText}`, 'mcp');
    }

    // Extract text content from result
    const textParts = result.content
      ?.filter((c) => c.type === 'text')
      .map((c) => c.text ?? '') ?? [];

    return textParts.join('\n') || JSON.stringify(result);
  }

  /** Send JSON-RPC request to MCP server */
  private async rpcCall(config: MCPServerConfig, method: string, params: Record<string, unknown>): Promise<unknown> {
    const timeout = config.timeoutMs ?? 15_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.authToken) {
      headers['Authorization'] = `Bearer ${config.authToken}`;
    }

    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method,
      params,
    });

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new LLMError(
          `MCP server '${config.name ?? config.url}' returned ${response.status}: ${text.slice(0, 200)}`,
          'mcp',
          response.status,
        );
      }

      const json = await response.json() as { result?: unknown; error?: { message: string } };
      if (json.error) {
        throw new LLMError(`MCP RPC error: ${json.error.message}`, 'mcp');
      }

      return json.result;
    } catch (err: unknown) {
      if (err instanceof LLMError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new LLMError(`MCP server '${config.name ?? config.url}' timed out after ${timeout}ms`, 'mcp');
      }
      throw new LLMError(
        `MCP connection failed: ${err instanceof Error ? err.message : 'unknown'}`,
        'mcp',
      );
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Internal server state */
interface MCPServerState {
  readonly config: MCPServerConfig;
  readonly tools: MCPToolDefinition[];
}
