/**
 * @ouraihub/llm — Error definitions.
 */

/** Base LLM error */
export class LLMError extends Error {
  readonly vendor: string;
  readonly statusCode?: number;
  readonly durationMs?: number;

  constructor(message: string, vendor: string, statusCode?: number, durationMs?: number) {
    super(message);
    this.name = 'LLMError';
    this.vendor = vendor;
    this.statusCode = statusCode;
    this.durationMs = durationMs;
  }
}

/** Timeout error */
export class LLMTimeoutError extends LLMError {
  readonly timeoutMs: number;

  constructor(vendor: string, timeoutMs: number) {
    super(`${vendor} request timed out after ${timeoutMs}ms`, vendor);
    this.name = 'LLMTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/** Schema validation error */
export class LLMSchemaError extends LLMError {
  constructor(vendor: string, details: string) {
    super(`${vendor} output failed schema validation: ${details}`, vendor);
    this.name = 'LLMSchemaError';
  }
}
