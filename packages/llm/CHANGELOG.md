# @ouraihub/llm

## 0.2.1

### Patch Changes

- 9f3a2ff: fix(llm): reasoning model compatibility — temperature opt-in, jsonMode auto-fallback, custom headers

## 0.2.0

### Minor Changes

- 9dc63c1: feat(llm): initial release — LLM provider abstraction with streaming support

  - ILLMProvider interface: complete(), raw(), messages(), stream(), streamMessages()
  - OpenAI-compatible provider (supports any relay/proxy)
  - Anthropic native Messages API provider
  - ToolExecutor: multi-round tool calling loop
  - SkillLoader: parse SKILL.md frontmatter into system prompts
  - MCPClient: HTTP JSON-RPC MCP tool discovery and invocation
  - Structured logging with injectable ILogger
  - Retry with exponential backoff (429/5xx), timeout control
  - StreamChunk type with text + tool call delta support
