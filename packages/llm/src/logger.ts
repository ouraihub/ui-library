/**
 * @ouraihub/llm — Logger interface.
 *
 * This package defines its own minimal ILogger interface.
 * Any logger that satisfies this interface can be injected:
 * - @ouraihub/core's Logger
 * - pino / winston / console
 * - Custom structured loggers
 *
 * The interface is intentionally minimal (info/warn/error + fields)
 * to maximize compatibility across different logging implementations.
 */

/** Structured log data — any key-value pairs for context */
export type LogData = Record<string, unknown>;

/** Logger interface — consumers inject their implementation */
export interface ILogger {
  info(message: string, data?: LogData): void;
  warn(message: string, data?: LogData): void;
  error(message: string, data?: LogData): void;
}

/** No-op logger (default when no logger is injected) */
export const noopLogger: ILogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

/** Console logger (convenient default for development) */
export const consoleLogger: ILogger = {
  info: (msg, data) => console.log(JSON.stringify({ level: 'info', msg, ...data, ts: new Date().toISOString() })),
  warn: (msg, data) => console.warn(JSON.stringify({ level: 'warn', msg, ...data, ts: new Date().toISOString() })),
  error: (msg, data) => console.error(JSON.stringify({ level: 'error', msg, ...data, ts: new Date().toISOString() })),
};
