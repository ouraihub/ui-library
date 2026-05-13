# 类型定义

> **包**: `@ouraihub/core`  
> **版本**: 1.4.0  
> **最后更新**: 2026-05-13

本文档列出 `@ouraihub/core` 包中所有公共类型定义。

---

## 目录

- [主题系统类型](#主题系统类型)
- [日志系统类型](#日志系统类型)
- [预设系统类型](#预设系统类型)

---

## 主题系统类型

### ThemeMode

```typescript
type ThemeMode = 'light' | 'dark' | 'system';
```

主题模式类型。

| 值 | 描述 |
|------|------|
| `'light'` | 浅色主题 |
| `'dark'` | 深色主题 |
| `'system'` | 跟随系统设置 |

#### 导入

```typescript
import type { ThemeMode } from '@ouraihub/core/types';
```

#### 使用示例

```typescript
function setTheme(mode: ThemeMode) {
  // mode 只能是 'light' | 'dark' | 'system'
}
```

---

### ThemeOptions

```typescript
interface ThemeOptions {
  storageKey?: string;
  attribute?: string;
  defaultTheme?: ThemeMode;
}
```

ThemeManager 构造函数的配置选项。

#### 属性

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `storageKey` | `string` | 否 | `'theme'` | localStorage 存储键名 |
| `attribute` | `string` | 否 | `'data-theme'` | HTML 属性名 |
| `defaultTheme` | `ThemeMode` | 否 | `'system'` | 默认主题模式 |

#### 导入

```typescript
import type { ThemeOptions } from '@ouraihub/core/types';
```

#### 使用示例

```typescript
const options: ThemeOptions = {
  storageKey: 'my-app-theme',
  attribute: 'data-color-scheme',
  defaultTheme: 'light',
};

const theme = new ThemeManager(document.documentElement, options);
```

---

## 日志系统类型

### LogLevel

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
```

日志级别类型，按严重程度递增。

| 值 | 描述 | 使用场景 |
|------|------|----------|
| `'debug'` | 调试级别 | 开发环境的详细信息 |
| `'info'` | 信息级别 | 一般运行信息 |
| `'warn'` | 警告级别 | 潜在问题 |
| `'error'` | 错误级别 | 错误和异常 |

#### 导入

```typescript
import type { LogLevel } from '@ouraihub/core/logger';
```

---

### LogContext

```typescript
interface LogContext {
  component?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
}
```

日志上下文接口，用于在日志中添加结构化信息。

#### 预定义属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `component` | `string` | 组件名称 |
| `userId` | `string` | 用户 ID |
| `sessionId` | `string` | 会话 ID |

#### 导入

```typescript
import type { LogContext } from '@ouraihub/core/logger';
```

#### 使用示例

```typescript
const context: LogContext = {
  component: 'AuthService',
  userId: '123',
  sessionId: 'abc-def',
  requestId: 'req-456', // 自定义字段
};

logger.setContext(context);
```

---

### LogEntry

```typescript
interface LogEntry {
  ts: number;
  level: LogLevel;
  msg: string;
  [key: string]: any;
}
```

日志条目接口，表示单条日志记录。

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `ts` | `number` | 时间戳（毫秒） |
| `level` | `LogLevel` | 日志级别 |
| `msg` | `string` | 日志消息 |
| `[key: string]` | `any` | 上下文和附加字段 |

#### 导入

```typescript
import type { LogEntry } from '@ouraihub/core/logger';
```

#### 使用示例

```typescript
const entry: LogEntry = {
  ts: Date.now(),
  level: 'info',
  msg: '用户登录',
  userId: '123',
  ip: '192.168.1.1',
};
```

---

### LoggerOptions

```typescript
interface LoggerOptions {
  level?: LogLevel;
  context?: LogContext;
  output?: (entry: LogEntry) => void;
  enableConsole?: boolean;
  format?: 'json' | 'pretty';
  sensitiveFields?: string[];
  environment?: 'development' | 'production';
}
```

日志器配置选项。

#### 属性

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `level` | `LogLevel` | 否 | `'info'` | 最低日志级别 |
| `context` | `LogContext` | 否 | `{}` | 初始上下文 |
| `output` | `(entry: LogEntry) => void` | 否 | `undefined` | 自定义输出函数 |
| `enableConsole` | `boolean` | 否 | `true` | 是否输出到控制台 |
| `format` | `'json' \| 'pretty'` | 否 | `'pretty'` | 输出格式 |
| `sensitiveFields` | `string[]` | 否 | 见文档 | 敏感字段列表 |
| `environment` | `'development' \| 'production'` | 否 | 自动检测 | 运行环境 |

#### 导入

```typescript
import type { LoggerOptions } from '@ouraihub/core/logger';
```

#### 使用示例

```typescript
const options: LoggerOptions = {
  level: 'debug',
  context: { service: 'api' },
  format: 'json',
  sensitiveFields: ['password', 'token'],
  environment: 'production',
};

const logger = createLogger(options);
```

---

### Logger

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

日志器接口，定义日志器的所有方法。

#### 方法

| 方法 | 描述 |
|------|------|
| `debug()` | 记录调试级别日志 |
| `info()` | 记录信息级别日志 |
| `warn()` | 记录警告级别日志 |
| `error()` | 记录错误级别日志 |
| `setContext()` | 设置日志上下文 |
| `clearContext()` | 清除日志上下文 |
| `getContext()` | 获取当前上下文 |
| `child()` | 创建子日志器 |

#### 导入

```typescript
import type { Logger } from '@ouraihub/core/logger';
```

#### 使用示例

```typescript
class UserService {
  constructor(private logger: Logger) {}
  
  createUser(data: any) {
    this.logger.info('创建用户', { username: data.username });
  }
}
```

---

## 预设系统类型

### DesignTokens

```typescript
interface DesignTokens {
  colors?: Record<string, string | Record<string, string>>;
  spacing?: Record<string, string | number>;
  typography?: {
    fontFamily?: Record<string, string>;
    fontSize?: Record<string, string | number>;
    fontWeight?: Record<string, number>;
    lineHeight?: Record<string, number | string>;
    letterSpacing?: Record<string, string | number>;
  };
  shadows?: Record<string, string>;
  borderRadius?: Record<string, string | number>;
  transitions?: Record<string, string>;
  [key: string]: unknown;
}
```

设计令牌接口，定义设计系统的基础令牌。

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `colors` | `Record<string, string \| Record<string, string>>` | 颜色令牌 |
| `spacing` | `Record<string, string \| number>` | 间距令牌 |
| `typography` | `object` | 字体配置 |
| `shadows` | `Record<string, string>` | 阴影配置 |
| `borderRadius` | `Record<string, string \| number>` | 圆角配置 |
| `transitions` | `Record<string, string>` | 过渡/动画配置 |

#### 导入

```typescript
import type { DesignTokens } from '@ouraihub/core';
```

#### 使用示例

```typescript
const tokens: DesignTokens = {
  colors: {
    primary: '#0066cc',
    secondary: '#6c757d',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      900: '#111827',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: {
      sans: 'system-ui, sans-serif',
      mono: 'Menlo, monospace',
    },
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
    },
  },
};
```

---

### ComponentConfig

```typescript
interface ComponentConfig {
  name: string;
  enabled?: boolean;
  defaults?: Record<string, unknown>;
  styles?: Record<string, string | Record<string, string>>;
  variants?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
}
```

组件配置接口，定义单个组件的预设配置。

#### 属性

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `name` | `string` | 是 | 组件名称 |
| `enabled` | `boolean` | 否 | 组件是否启用 |
| `defaults` | `Record<string, unknown>` | 否 | 组件的默认属性 |
| `styles` | `Record<string, string \| Record<string, string>>` | 否 | 组件的样式覆盖 |
| `variants` | `Record<string, Record<string, unknown>>` | 否 | 组件的变体配置 |

#### 导入

```typescript
import type { ComponentConfig } from '@ouraihub/core';
```

#### 使用示例

```typescript
const buttonConfig: ComponentConfig = {
  name: 'Button',
  enabled: true,
  defaults: {
    size: 'md',
    variant: 'primary',
  },
  styles: {
    base: 'px-4 py-2 rounded',
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
  },
  variants: {
    size: {
      sm: { padding: '0.5rem 1rem' },
      md: { padding: '0.75rem 1.5rem' },
      lg: { padding: '1rem 2rem' },
    },
  },
};
```

---

### LayoutConfig

```typescript
interface LayoutConfig {
  type?: 'grid' | 'flex' | 'stack' | string;
  maxWidth?: string | number;
  containerPadding?: string | number;
  columns?: number;
  gap?: string | number;
  breakpoints?: Record<string, string | number>;
  [key: string]: unknown;
}
```

布局配置接口，定义布局系统的预设配置。

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `type` | `'grid' \| 'flex' \| 'stack' \| string` | 布局类型 |
| `maxWidth` | `string \| number` | 容器最大宽度 |
| `containerPadding` | `string \| number` | 容器内边距 |
| `columns` | `number` | 栅格列数 |
| `gap` | `string \| number` | 栅格间隙 |
| `breakpoints` | `Record<string, string \| number>` | 响应式断点配置 |

#### 导入

```typescript
import type { LayoutConfig } from '@ouraihub/core';
```

#### 使用示例

```typescript
const layout: LayoutConfig = {
  type: 'grid',
  maxWidth: '1280px',
  containerPadding: '1rem',
  columns: 12,
  gap: '1.5rem',
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};
```

---

### PresetOptions

```typescript
interface PresetOptions {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  tags?: string[];
  isDefault?: boolean;
  extends?: string | string[];
  [key: string]: unknown;
}
```

预设选项接口，定义预设的元数据。

#### 属性

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `name` | `string` | 是 | 预设名称 |
| `version` | `string` | 否 | 预设版本 |
| `description` | `string` | 否 | 预设描述 |
| `author` | `string` | 否 | 预设作者 |
| `tags` | `string[]` | 否 | 预设的标签/分类 |
| `isDefault` | `boolean` | 否 | 是否为默认预设 |
| `extends` | `string \| string[]` | 否 | 预设的依赖预设 |

#### 导入

```typescript
import type { PresetOptions } from '@ouraihub/core';
```

#### 使用示例

```typescript
const options: PresetOptions = {
  name: 'blog',
  version: '1.0.0',
  description: 'Blog preset with optimized components',
  author: 'OurAI Hub',
  tags: ['blog', 'content', 'seo'],
  isDefault: false,
  extends: 'base',
};
```

---

### Preset

```typescript
interface Preset {
  options: PresetOptions;
  tokens?: DesignTokens;
  components?: ComponentConfig[];
  layout?: LayoutConfig;
  plugins?: Record<string, unknown>;
  tools?: Record<string, unknown>;
  [key: string]: unknown;
}
```

预设接口，预设系统的主接口。预设是配置、插件和工具的预定义组合。

#### 属性

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `options` | `PresetOptions` | 是 | 预设的基本选项和元数据 |
| `tokens` | `DesignTokens` | 否 | 设计令牌配置 |
| `components` | `ComponentConfig[]` | 否 | 组件配置列表 |
| `layout` | `LayoutConfig` | 否 | 布局配置 |
| `plugins` | `Record<string, unknown>` | 否 | 插件配置 |
| `tools` | `Record<string, unknown>` | 否 | 工具配置 |

#### 导入

```typescript
import type { Preset } from '@ouraihub/core';
```

#### 使用示例

```typescript
const blogPreset: Preset = {
  options: {
    name: 'blog',
    version: '1.0.0',
    description: 'Blog preset with optimized components',
  },
  tokens: {
    colors: {
      primary: '#0066cc',
      secondary: '#6c757d',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
    },
  },
  components: [
    {
      name: 'Card',
      enabled: true,
      defaults: { shadow: 'md' },
    },
    {
      name: 'Button',
      enabled: true,
      defaults: { size: 'md', variant: 'primary' },
    },
  ],
  layout: {
    type: 'grid',
    maxWidth: '1280px',
    columns: 12,
    gap: '1.5rem',
  },
};
```

---

## 类型导入汇总

### 主题系统

```typescript
import type { ThemeMode, ThemeOptions } from '@ouraihub/core/types';
```

### 日志系统

```typescript
import type {
  LogLevel,
  LogContext,
  LogEntry,
  LoggerOptions,
  Logger,
} from '@ouraihub/core/logger';
```

### 预设系统

```typescript
import type {
  DesignTokens,
  ComponentConfig,
  LayoutConfig,
  PresetOptions,
  Preset,
} from '@ouraihub/core';
```

### 全部导入

```typescript
import type {
  // 主题
  ThemeMode,
  ThemeOptions,
  
  // 日志
  LogLevel,
  LogContext,
  LogEntry,
  LoggerOptions,
  Logger,
  
  // 预设
  DesignTokens,
  ComponentConfig,
  LayoutConfig,
  PresetOptions,
  Preset,
} from '@ouraihub/core';
```

---

## 相关文档

- [API 参考索引](./README.md)
- [ThemeManager API](./ThemeManager.md)
- [Logger API](./Logger.md)
- [完整设计方案](../DESIGN.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
