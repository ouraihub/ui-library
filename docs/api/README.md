# API 参考文档

> **版本**: 1.4.0  
> **最后更新**: 2026-05-13  
> **状态**: active  
> **维护者**: Sisyphus (AI Agent)

本文档提供 `@ouraihub/core` 包中所有核心类和工具函数的完整 API 参考。

---

## 目录

- [ThemeManager](./ThemeManager.md) - 主题管理系统
- [Logger](./Logger.md) - 结构化日志系统
- [类型定义](./types.md) - TypeScript 类型定义

---

## 快速导航

### 核心 API

| API | 描述 | 文档链接 |
|-----|------|----------|
| **ThemeManager** | 主题切换和管理系统，支持 light/dark/system 模式 | [查看文档](./ThemeManager.md) |
| **Logger** | 结构化日志系统，支持多级别、上下文管理、敏感数据脱敏 | [查看文档](./Logger.md) |

### 类型定义

| 类型 | 描述 | 文档链接 |
|------|------|----------|
| **ThemeMode** | 主题模式类型 (`'light' \| 'dark' \| 'system'`) | [查看文档](./types.md#thememode) |
| **ThemeOptions** | ThemeManager 配置选项 | [查看文档](./types.md#themeoptions) |
| **LogLevel** | 日志级别类型 | [查看文档](./types.md#loglevel) |
| **Logger** | 日志器接口 | [查看文档](./types.md#logger) |
| **Preset** | 预设系统接口 | [查看文档](./types.md#preset) |

---

## API 概览

### ThemeManager

主题管理系统，支持 light/dark/system 三态切换，自动持久化用户偏好。

**导入**:
```typescript
import { ThemeManager } from '@ouraihub/core/theme';
```

**快速开始**:
```typescript
const theme = new ThemeManager();
theme.toggle(); // 切换主题
```

**详细文档**: [ThemeManager API](./ThemeManager.md)

---

### Logger

结构化日志系统，支持多级别日志、上下文管理、敏感数据脱敏。

**导入**:
```typescript
import { createLogger, logger } from '@ouraihub/core/logger';
```

**快速开始**:
```typescript
logger.info('应用启动', { port: 3000 });
logger.error('请求失败', { status: 500 });
```

**详细文档**: [Logger API](./Logger.md)

---

## 已实现的 API

以下 API 已完成实现并可用：

- ✅ **ThemeManager** - 主题管理系统
- ✅ **Logger** - 结构化日志系统
- ✅ **类型定义** - 完整的 TypeScript 类型

## 计划中的 API

以下 API 在设计阶段，尚未实现：

- ⏳ **DOM 工具函数** - querySelector、addClass、removeClass 等
- ⏳ **验证工具** - isValidEmail、isValidUrl、sanitizeHtml 等
- ⏳ **格式化工具** - formatDate、formatNumber、formatFileSize 等
- ⏳ **SearchModal** - 搜索模态框控制器
- ⏳ **NavigationController** - 导航菜单控制器
- ⏳ **LazyLoader** - 图片懒加载控制器

---

## ThemeManager (已实现)

主题切换和管理系统，支持 light/dark/auto 模式，自动持久化用户偏好。

### 导入

```typescript
import { ThemeManager } from '@ouraihub/core/theme';
```

### 构造函数

```typescript
constructor(element?: HTMLElement, options?: ThemeOptions)
```

**参数**:
- `element` (可选) - 关联的 DOM 元素（通常是切换按钮）
- `options` (可选) - 配置选项

**ThemeOptions**:
```typescript
interface ThemeOptions {
  storageKey?: string;        // localStorage 键名，默认 'theme'
  defaultTheme?: ThemeMode;   // 默认主题，默认 'auto'
  attribute?: string;         // HTML 属性名，默认 'data-theme'
  transitions?: boolean;      // 是否启用过渡动画，默认 true
}
```

**ThemeMode**:
```typescript
type ThemeMode = 'light' | 'dark' | 'auto';
```

### 方法

#### `setTheme(mode: ThemeMode): void`

设置主题模式。

```typescript
const theme = new ThemeManager();
theme.setTheme('dark');  // 切换到暗色模式
```

#### `getTheme(): ThemeMode`

获取当前主题模式。

```typescript
const currentTheme = theme.getTheme();  // 'light' | 'dark' | 'auto'
```

#### `toggle(): void`

在 light 和 dark 之间切换（跳过 auto）。

```typescript
theme.toggle();  // light → dark 或 dark → light
```

#### `getResolvedTheme(): 'light' | 'dark'`

获取解析后的实际主题（将 auto 解析为 light 或 dark）。

```typescript
theme.setTheme('auto');
const resolved = theme.getResolvedTheme();  // 'light' 或 'dark'（取决于系统偏好）
```

#### `onThemeChange(callback: ThemeChangeCallback, owner?: Element): () => void`

订阅主题变化事件。

```typescript
type ThemeChangeCallback = (theme: ThemeMode, resolved: 'light' | 'dark') => void;

const unsubscribe = theme.onThemeChange((theme, resolved) => {
  console.log(`主题切换到: ${theme} (实际: ${resolved})`);
});

// 取消订阅
unsubscribe();
```

**参数**:
- `callback` - 主题变化时的回调函数
- `owner` (可选) - 订阅者元素，用于自动清理（Owner-based 订阅）

**返回**: 取消订阅函数

#### `destroy(): void`

销毁实例，清理所有事件监听器。

```typescript
theme.destroy();
```

### 事件

ThemeManager 会在 `document` 上触发自定义事件：

```typescript
document.addEventListener('theme-change', (event: CustomEvent) => {
  console.log(event.detail);  // { theme: 'dark', resolved: 'dark' }
});
```

### 完整示例

```typescript
import { ThemeManager } from '@ouraihub/core/theme';

// 创建实例
const themeToggle = document.querySelector('[data-theme-toggle]');
const theme = new ThemeManager(themeToggle, {
  storageKey: 'my-theme',
  defaultTheme: 'auto',
  transitions: true
});

// 订阅变化
theme.onThemeChange((mode, resolved) => {
  // 更新按钮图标
  themeToggle.innerHTML = resolved === 'dark' ? '🌙' : '☀️';
  
  // 通知其他组件
  console.log(`主题已切换: ${mode} (${resolved})`);
});

// 切换主题
themeToggle.addEventListener('click', () => {
  theme.toggle();
});
```



---

## 使用示例

### 主题切换 + 日志记录

```typescript
import { ThemeManager } from '@ouraihub/core/theme';
import { createLogger } from '@ouraihub/core/logger';

// 创建日志器
const logger = createLogger({
  level: 'info',
  context: { component: 'ThemeSystem' },
});

// 创建主题管理器
const theme = new ThemeManager();

// 订阅主题变化并记录日志
theme.onThemeChange((mode) => {
  logger.info('主题已切换', { theme: mode });
});

// 切换主题
document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
  theme.toggle();
});
```

### 完整应用初始化

```typescript
import { ThemeManager } from '@ouraihub/core/theme';
import { createLogger } from '@ouraihub/core/logger';
import type { ThemeMode } from '@ouraihub/core/types';

// 初始化日志系统
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  context: { app: 'my-app', version: '1.0.0' },
});

logger.info('应用启动');

// 初始化主题系统
const theme = new ThemeManager(document.documentElement, {
  storageKey: 'my-app-theme',
  defaultTheme: 'system',
});

// 记录初始主题
logger.info('主题系统初始化', { theme: theme.getTheme() });

// 订阅主题变化
theme.onThemeChange((mode: ThemeMode) => {
  logger.info('主题变化', { theme: mode });
  
  // 更新 UI
  const icon = mode === 'dark' ? '🌙' : '☀️';
  document.querySelector('[data-theme-icon]')?.textContent = icon;
});

logger.info('应用初始化完成');
```

---

## 相关文档

- [完整设计方案](../DESIGN.md) - 架构设计和技术选型
- [快速开始](../implementation/02-quick-start.md) - 安装和基础用法
- [测试策略](../testing/README.md) - 单元测试和集成测试
- [代码规范](../guides/code-style.md) - TypeScript 和命名约定
- [安全性指南](../guides/security.md) - XSS 防护和输入验证

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
