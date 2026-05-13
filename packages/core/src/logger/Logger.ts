import type { LogLevel, LogContext, LogEntry, LoggerOptions, Logger } from './types';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'authorization',
  'credential',
];

function maskSensitiveData(obj: any, fields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const masked = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const key in masked) {
    const lowerKey = key.toLowerCase();
    const isSensitive = fields.some(field => 
      lowerKey.includes(field.toLowerCase())
    );
    
    if (isSensitive && typeof masked[key] === 'string') {
      masked[key] = '***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key], fields);
    }
  }
  
  return masked;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const {
    level = 'info',
    context: initialContext = {},
    output,
    enableConsole = true,
    format = 'pretty',
    sensitiveFields = DEFAULT_SENSITIVE_FIELDS,
    environment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' 
      ? 'production' 
      : 'development',
  } = options;

  let context: LogContext = { ...initialContext };
  const minLevel = LOG_LEVELS[level];

  function emit(level: LogLevel, msg: string, fields: Record<string, any> = {}): void {
    if (LOG_LEVELS[level] < minLevel) return;

    const maskedFields = maskSensitiveData(fields, sensitiveFields);
    const maskedContext = maskSensitiveData(context, sensitiveFields);

    const entry: LogEntry = {
      ts: Date.now(),
      level,
      msg,
      ...maskedContext,
      ...maskedFields,
    };

    if (output) {
      output(entry);
    }

    if (enableConsole) {
      const consoleMethod = console[level] || console.log;
      
      if (format === 'json') {
        consoleMethod(JSON.stringify(entry));
      } else {
        const style = level === 'error' ? 'color: red' : level === 'warn' ? 'color: orange' : '';
        if (style && typeof window !== 'undefined') {
          consoleMethod(`%c[${level.toUpperCase()}]`, style, msg, { ...maskedContext, ...maskedFields });
        } else {
          consoleMethod(`[${level.toUpperCase()}]`, msg, { ...maskedContext, ...maskedFields });
        }
      }
    }
  }

  function setContext(ctx: LogContext): void {
    context = { ...context, ...ctx };
  }

  function clearContext(): void {
    context = {};
  }

  function getContext(): LogContext {
    return { ...context };
  }

  function child(childContext: LogContext): Logger {
    return createLogger({
      level,
      context: { ...context, ...childContext },
      output,
      enableConsole,
      format,
      sensitiveFields,
      environment,
    });
  }

  return {
    debug: (msg, fields) => emit('debug', msg, fields),
    info: (msg, fields) => emit('info', msg, fields),
    warn: (msg, fields) => emit('warn', msg, fields),
    error: (msg, fields) => emit('error', msg, fields),
    
    setContext,
    clearContext,
    getContext,
    child,
  };
}

export const logger = createLogger();
