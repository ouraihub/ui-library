# Logger API

> **包**: `@ouraihub/core`  
> **版本**: 1.4.0  
> **最后更新**: 2026-05-13

结构化日志系统，支持多级别日志、上下文管理、敏感数据脱敏、子日志器。

---

## 导入

```typescript
import { createLogger, logger } from '@ouraihub/core/logger';
import type { Logger, LoggerOptions, LogLevel, LogContext } from '@ouraihub/core/logger';
```

---

## 快速开始

```typescript
import { logger } from '@ouraihub/core/logger';

// 使用默认日志器
logger.info('应用启动');
logger.warn('配置缺失', { key: 'apiUrl' });
logger.error('请求失败', { status: 500, url: '/api/users' });
```

---

## createLogger()

```typescript
createLogger(options?: LoggerOptions): Logger
```

创建自定义日志器实例。

### 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `options` | `LoggerOptions` | 否 | `{}` | 日志器配置选项 |

### LoggerOptions

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `level` | `LogLevel` | 否 | `'info'` | 最低日志级别 |
| `context` | `LogContext` | 否 | `{}` | 初始上下文 |
| `output` | `(entry: LogEntry) => void` | 否 | `undefined` | 自定义输出函数 |
| `enableConsole` | `boolean` | 否 | `true` | 是否输出到控制台 |
| `format` | `'json' \| 'pretty'` | 否 | `'pretty'` | 输出格式 |
| `sensitiveFields` | `string[]` | 否 | 见下文 | 敏感字段列表 |
| `environment` | `'development' \| 'production'` | 否 | 自动检测 | 运行环境 |

### 默认敏感字段

```typescript
[
  'password',
  'token',
  'secret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'authorization',
  'credential',
]
```

### 示例

```typescript
// 创建自定义日志器
const logger = createLogger({
  level: 'debug',
  context: { service: 'api', version: '1.0.0' },
  format: 'json',
  sensitiveFields: ['password', 'ssn'],
});

// 创建带自定义输出的日志器
const logger = createLogger({
  output: (entry) => {
    // 发送到远程日志服务
    fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
});
```

---

## Logger 接口

### debug()

```typescript
debug(msg: string, fields?: Record<string, any>): void
```

记录调试级别日志。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `msg` | `string` | 是 | 日志消息 |
| `fields` | `Record<string, any>` | 否 | 附加字段 |

#### 示例

```typescript
logger.debug('查询数据库', { query: 'SELECT * FROM users', duration: 45 });
```

---

### info()

```typescript
info(msg: string, fields?: Record<string, any>): void
```

记录信息级别日志。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `msg` | `string` | 是 | 日志消息 |
| `fields` | `Record<string, any>` | 否 | 附加字段 |

#### 示例

```typescript
logger.info('用户登录', { userId: '123', ip: '192.168.1.1' });
```

---

### warn()

```typescript
warn(msg: string, fields?: Record<string, any>): void
```

记录警告级别日志。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `msg` | `string` | 是 | 日志消息 |
| `fields` | `Record<string, any>` | 否 | 附加字段 |

#### 示例

```typescript
logger.warn('API 响应慢', { endpoint: '/api/users', duration: 3000 });
```

---

### error()

```typescript
error(msg: string, fields?: Record<string, any>): void
```

记录错误级别日志。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `msg` | `string` | 是 | 日志消息 |
| `fields` | `Record<string, any>` | 否 | 附加字段 |

#### 示例

```typescript
logger.error('数据库连接失败', { 
  error: err.message, 
  stack: err.stack,
  host: 'db.example.com' 
});
```

---

### setContext()

```typescript
setContext(ctx: LogContext): void
```

设置或合并日志上下文。上下文会自动添加到所有日志条目中。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `ctx` | `LogContext` | 是 | 要设置的上下文 |

#### 示例

```typescript
// 设置用户上下文
logger.setContext({ userId: '123', sessionId: 'abc' });

// 后续日志会自动包含上下文
logger.info('查看个人资料'); 
// 输出: { ts: ..., level: 'info', msg: '查看个人资料', userId: '123', sessionId: 'abc' }

// 合并新上下文
logger.setContext({ requestId: 'req-456' });
// 现在上下文包含: { userId: '123', sessionId: 'abc', requestId: 'req-456' }
```

---

### clearContext()

```typescript
clearContext(): void
```

清除所有上下文。

#### 示例

```typescript
logger.setContext({ userId: '123' });
logger.info('有上下文'); // 包含 userId

logger.clearContext();
logger.info('无上下文'); // 不包含 userId
```

---

### getContext()

```typescript
getContext(): LogContext
```

获取当前上下文的副本。

#### 返回值

| 类型 | 描述 |
|------|------|
| `LogContext` | 当前上下文对象 |

#### 示例

```typescript
logger.setContext({ userId: '123' });
const ctx = logger.getContext();
console.log(ctx); // { userId: '123' }
```

---

### child()

```typescript
child(childContext: LogContext): Logger
```

创建子日志器，继承父日志器的配置和上下文。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `childContext` | `LogContext` | 是 | 子日志器的额外上下文 |

#### 返回值

| 类型 | 描述 |
|------|------|
| `Logger` | 新的子日志器实例 |

#### 示例

```typescript
// 父日志器
const logger = createLogger({
  context: { service: 'api' }
});

// 为每个组件创建子日志器
const authLogger = logger.child({ component: 'auth' });
const dbLogger = logger.child({ component: 'database' });

authLogger.info('用户登录'); 
// 输出: { service: 'api', component: 'auth', msg: '用户登录' }

dbLogger.info('查询执行'); 
// 输出: { service: 'api', component: 'database', msg: '查询执行' }
```

---

## 类型定义

### LogLevel

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
```

日志级别，按严重程度递增：

- `'debug'`: 调试信息（开发环境）
- `'info'`: 一般信息
- `'warn'`: 警告信息
- `'error'`: 错误信息

### LogContext

```typescript
interface LogContext {
  component?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
}
```

日志上下文，可以包含任意键值对。

### LogEntry

```typescript
interface LogEntry {
  ts: number;           // 时间戳（毫秒）
  level: LogLevel;      // 日志级别
  msg: string;          // 日志消息
  [key: string]: any;   // 上下文和附加字段
}
```

日志条目的完整结构。

---

## 完整示例

### 基础用法

```typescript
import { createLogger } from '@ouraihub/core/logger';

const logger = createLogger({
  level: 'info',
  format: 'pretty',
});

logger.info('应用启动', { port: 3000 });
logger.warn('配置缺失', { key: 'apiUrl' });
logger.error('启动失败', { error: 'EADDRINUSE' });
```

### 上下文管理

```typescript
import { createLogger } from '@ouraihub/core/logger';

const logger = createLogger();

// 用户登录后设置上下文
function onLogin(user) {
  logger.setContext({
    userId: user.id,
    username: user.name,
    sessionId: generateSessionId(),
  });
  
  logger.info('用户登录成功');
}

// 用户登出后清除上下文
function onLogout() {
  logger.info('用户登出');
  logger.clearContext();
}
```

### 组件级日志

```typescript
import { createLogger } from '@ouraihub/core/logger';

// 应用级日志器
const appLogger = createLogger({
  context: { app: 'my-app', version: '1.0.0' }
});

// 为每个模块创建子日志器
class AuthService {
  private logger = appLogger.child({ component: 'AuthService' });
  
  login(username: string) {
    this.logger.info('登录尝试', { username });
    // ...
  }
  
  logout() {
    this.logger.info('用户登出');
    // ...
  }
}

class DatabaseService {
  private logger = appLogger.child({ component: 'DatabaseService' });
  
  query(sql: string) {
    this.logger.debug('执行查询', { sql });
    // ...
  }
}
```

### 敏感数据脱敏

```typescript
import { createLogger } from '@ouraihub/core/logger';

const logger = createLogger({
  sensitiveFields: ['password', 'token', 'ssn', 'creditCard'],
});

// 敏感字段会自动脱敏
logger.info('用户注册', {
  username: 'john',
  password: 'secret123',  // 会被脱敏为 '***'
  email: 'john@example.com',
});

// 输出: { username: 'john', password: '***', email: 'john@example.com' }
```

### 自定义输出

```typescript
import { createLogger } from '@ouraihub/core/logger';

const logger = createLogger({
  output: (entry) => {
    // 发送到远程日志服务
    if (entry.level === 'error') {
      fetch('https://logs.example.com/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    }
    
    // 存储到本地
    if (typeof localStorage !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('logs') || '[]');
      logs.push(entry);
      localStorage.setItem('logs', JSON.stringify(logs.slice(-100)));
    }
  },
  enableConsole: true, // 同时输出到控制台
});
```

### JSON 格式输出

```typescript
import { createLogger } from '@ouraihub/core/logger';

const logger = createLogger({
  format: 'json',
  level: 'info',
});

logger.info('用户登录', { userId: '123' });
// 控制台输出: {"ts":1715587200000,"level":"info","msg":"用户登录","userId":"123"}
```

---

## 日志级别过滤

日志器只会输出大于等于配置级别的日志：

```typescript
const logger = createLogger({ level: 'warn' });

logger.debug('调试信息'); // 不输出
logger.info('一般信息');  // 不输出
logger.warn('警告信息');  // 输出
logger.error('错误信息'); // 输出
```

级别优先级：`debug` < `info` < `warn` < `error`

---

## 注意事项

### 性能考虑

1. **避免在循环中记录日志**

```typescript
// ❌ 不好的做法
for (let i = 0; i < 10000; i++) {
  logger.debug('处理项目', { index: i });
}

// ✅ 好的做法
logger.debug('开始批量处理', { count: 10000 });
// ... 处理逻辑
logger.debug('批量处理完成');
```

2. **生产环境使用合适的日志级别**

```typescript
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});
```

### 敏感数据保护

1. **自动脱敏**: 配置 `sensitiveFields` 列表
2. **手动脱敏**: 在记录前处理敏感数据

```typescript
// 自动脱敏
const logger = createLogger({
  sensitiveFields: ['password', 'token'],
});

// 手动脱敏
logger.info('用户数据', {
  email: maskEmail(user.email), // john@example.com -> j***@example.com
  phone: maskPhone(user.phone), // 13812345678 -> 138****5678
});
```

### 最佳实践

1. **使用结构化日志**: 使用 `fields` 参数而不是字符串拼接

```typescript
// ❌ 不好的做法
logger.info(`用户 ${userId} 登录成功`);

// ✅ 好的做法
logger.info('用户登录成功', { userId });
```

2. **为每个模块创建子日志器**

```typescript
// ✅ 好的做法
class UserService {
  private logger = appLogger.child({ component: 'UserService' });
  
  createUser(data) {
    this.logger.info('创建用户', { username: data.username });
  }
}
```

3. **记录有意义的信息**

```typescript
// ❌ 不好的做法
logger.info('成功');

// ✅ 好的做法
logger.info('用户创建成功', { userId: newUser.id, username: newUser.name });
```

---

## 相关文档

- [API 参考索引](./README.md)
- [类型定义](./types.md)
- [错误处理指南](../guides/error-handling.md)
- [安全性指南](../guides/security.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
