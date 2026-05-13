# Logger 使用文档

## 概述

基于 msgflow/log.js 设计的结构化日志组件，适配前端场景。

## 核心特性

✅ **结构化 JSON 输出**（参考 msgflow）
✅ **敏感信息自动脱敏**（password、token 等）
✅ **上下文自动注入**（userId、sessionId 等）
✅ **子 logger 支持**
✅ **开发/生产环境区分**
✅ **浏览器控制台样式**

## 基础使用

### 1. 导入

```typescript
import { logger } from '@ouraihub/core/logger';
```

### 2. 基本日志

```typescript
logger.debug('调试信息', { detail: 'some data' });
logger.info('用户登录', { userId: '123' });
logger.warn('请求超时', { url: '/api/data', timeout: 5000 });
logger.error('请求失败', { error: 'Network error' });
```

### 3. 设置全局上下文

```typescript
// 在应用初始化时设置
logger.setContext({
  userId: '123',
  sessionId: 'abc-def',
  version: '1.0.0',
});

// 之后所有日志都会自动包含这些字段
logger.info('页面访问', { page: '/home' });
// 输出: { ts: 1234567890, level: 'info', msg: '页面访问', userId: '123', sessionId: 'abc-def', version: '1.0.0', page: '/home' }
```

### 4. 子 Logger

```typescript
// 为特定组件创建子 logger
const componentLogger = logger.child({ component: 'ThemeToggle' });

componentLogger.info('主题切换', { theme: 'dark' });
// 输出: { ..., component: 'ThemeToggle', msg: '主题切换', theme: 'dark' }
```

## 高级配置

### 自定义 Logger

```typescript
import { createLogger } from '@ouraihub/core/logger';

const customLogger = createLogger({
  level: 'debug',                    // 最低日志级别
  format: 'json',                    // 'json' | 'pretty'
  enableConsole: true,               // 是否输出到控制台
  environment: 'production',         // 'development' | 'production'
  sensitiveFields: ['password', 'token', 'secret'],  // 需要脱敏的字段
  context: {                         // 初始上下文
    appName: 'my-app',
  },
  output: (entry) => {               // 自定义输出函数（如远程上报）
    fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
});
```

## 敏感信息脱敏

自动脱敏包含以下关键词的字段：
- password
- token
- secret
- apiKey
- accessToken
- refreshToken
- authorization
- credential

```typescript
logger.info('用户登录', {
  username: 'john',
  password: '123456',        // 自动脱敏为 '***'
  accessToken: 'abc123',     // 自动脱敏为 '***'
});
// 输出: { ..., username: 'john', password: '***', accessToken: '***' }
```

## 输出格式

### Pretty 格式（开发环境默认）

```
[INFO] 用户登录 { userId: '123', ip: '1.2.3.4' }
```

### JSON 格式（生产环境推荐）

```json
{"ts":1234567890,"level":"info","msg":"用户登录","userId":"123","ip":"1.2.3.4"}
```

## 最佳实践

### 1. 应用初始化时设置上下文

```typescript
// main.ts
import { logger } from '@ouraihub/core/logger';

logger.setContext({
  appVersion: import.meta.env.VITE_APP_VERSION,
  environment: import.meta.env.MODE,
});
```

### 2. 为每个组件创建子 Logger

```typescript
// ThemeToggle.tsx
import { logger } from '@ouraihub/core/logger';

const log = logger.child({ component: 'ThemeToggle' });

export function ThemeToggle() {
  const handleToggle = () => {
    log.info('主题切换', { from: 'light', to: 'dark' });
  };
}
```

### 3. 错误日志包含完整上下文

```typescript
try {
  await fetchData();
} catch (error) {
  logger.error('数据获取失败', {
    url: '/api/data',
    error: error.message,
    stack: error.stack,
  });
}
```

### 4. 生产环境使用 JSON 格式

```typescript
// vite.config.ts
const logger = createLogger({
  format: import.meta.env.PROD ? 'json' : 'pretty',
  level: import.meta.env.PROD ? 'info' : 'debug',
});
```

## 与 msgflow/log.js 的对比

| 特性 | msgflow/log.js | @ouraihub/logger |
|------|----------------|------------------|
| 结构化 JSON 输出 | ✅ | ✅ |
| 上下文注入 | ✅ | ✅ |
| 敏感信息脱敏 | ❌ | ✅ |
| 子 logger | ❌ | ✅ |
| 日志级别过滤 | ❌ | ✅ |
| 自定义输出 | ❌ | ✅ |
| 浏览器样式 | ❌ | ✅ |
| 代码行数 | 17 行 | ~120 行 |

## API 参考

### Logger 接口

```typescript
interface Logger {
  debug(msg: string, fields?: Record<string, any>): void;
  info(msg: string, fields?: Record<string, any>): void;
  warn(msg: string, fields?: Record<string, any>): void;
  error(msg: string, fields?: Record<string, any>): void;
  
  setContext(ctx: LogContext): void;
  clearContext(): void;
  getContext(): LogContext;
  
  child(childContext: LogContext): Logger;
}
```

### LoggerOptions

```typescript
interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  context?: LogContext;
  output?: (entry: LogEntry) => void;
  enableConsole?: boolean;
  format?: 'json' | 'pretty';
  sensitiveFields?: string[];
  environment?: 'development' | 'production';
}
```
