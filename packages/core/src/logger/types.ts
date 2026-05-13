export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  component?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
}

export interface LogEntry {
  ts: number;
  level: LogLevel;
  msg: string;
  [key: string]: any;
}

export interface LoggerOptions {
  level?: LogLevel;
  context?: LogContext;
  output?: (entry: LogEntry) => void;
  enableConsole?: boolean;
  format?: 'json' | 'pretty';
  sensitiveFields?: string[];
  environment?: 'development' | 'production';
}

export interface Logger {
  debug(msg: string, fields?: Record<string, any>): void;
  info(msg: string, fields?: Record<string, any>): void;
  warn(msg: string, fields?: Record<string, any>): void;
  error(msg: string, fields?: Record<string, any>): void;
  
  setContext(ctx: LogContext): void;
  clearContext(): void;
  getContext(): LogContext;
  
  child(childContext: LogContext): Logger;
}
