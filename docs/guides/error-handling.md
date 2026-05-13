# 错误处理策略

> **版本**: 1.6.0  
> **最后更新**: 2026-05-12  
> **状态**: approved  
> **维护者**: Sisyphus (AI Agent)

本文档定义 `@ouraihub/ui-library` 的错误处理策略、错误分类、自定义错误类和恢复机制。

## 概述

错误处理是组件库稳定性的关键。本文档基于 Oracle 的架构评审建议，定义了完整的错误处理策略，确保组件库在各种异常情况下都能优雅降级，提供良好的用户体验和可调试性。

---

## 目录

- [概述](#概述)
- [核心原则](#核心原则)
- [错误分类](#错误分类)
  - [初始化错误](#初始化错误)
  - [运行时错误](#运行时错误)
  - [配置错误](#配置错误)
  - [环境错误](#环境错误)
- [错误处理模式](#错误处理模式)
- [边界情况处理](#边界情况处理)
- [错误上报](#错误上报)
- [测试策略](#测试策略)
- [最佳实践](#最佳实践)

---

## 核心原则

### 1. 优雅降级（Graceful Degradation）

错误不应导致页面崩溃或功能完全失效。组件应该能够在出错时回退到安全的默认行为。

```typescript
// ✅ 好的做法：优雅降级
export class ThemeManager {
  constructor(element?: HTMLElement, options?: ThemeOptions) {
    try {
      this.element = element || document.documentElement;
      if (!this.element) {
        throw new Error('[UI-Library] Element not found');
      }
      this.init(options);
    } catch (error) {
      console.error('[UI-Library] [ThemeManager] Init failed:', error);
      // 降级：使用默认行为
      this.element = document.documentElement;
      this.init({ ...options, defaultTheme: 'light' });
    }
  }
}

// ❌ 坏的做法：让错误传播导致崩溃
export class ThemeManager {
  constructor(element?: HTMLElement, options?: ThemeOptions) {
    this.element = element!; // 可能为 null，导致后续崩溃
    this.init(options);
  }
}
```

### 2. 错误边界（Error Boundaries）

隔离错误影响范围，防止一个组件的错误影响其他组件。

```typescript
// 每个核心类都应该有自己的错误处理
export class NavigationController {
  private handleError(context: string, error: Error): void {
    const errorMsg = `[UI-Library] [NavigationController] [${context}] ${error.message}`;
    console.error(errorMsg, error);
    
    // 不要让错误传播到外部
    // 组件应该继续工作（降级模式）
  }
  
  toggle(): void {
    try {
      // 核心逻辑
      this.menu.classList.toggle('open');
    } catch (error) {
      this.handleError('toggle', error as Error);
      // 降级：至少不要崩溃
    }
  }
}
```

### 3. 用户友好（User-Friendly）

提供清晰的错误提示，帮助用户理解发生了什么。

```typescript
// ✅ 好的错误消息
throw new Error('[UI-Library] [ThemeManager] Invalid theme mode: "invalid". Expected "light", "dark", or "system".');

// ❌ 坏的错误消息
throw new Error('Invalid mode');
```

### 4. 可调试（Debuggable）

记录详细的错误信息，帮助开发者快速定位问题。

```typescript
export class ThemeManager {
  private handleError(context: string, error: Error, metadata?: Record<string, any>): void {
    const errorMsg = `[UI-Library] [ThemeManager] [${context}] ${error.message}`;
    
    // 开发环境：详细日志
    if (process.env.NODE_ENV === 'development') {
      console.group(errorMsg);
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('Metadata:', metadata);
      console.trace();
      console.groupEnd();
    } else {
      // 生产环境：简洁日志
      console.error(errorMsg);
    }
    
    // 可选：上报到监控系统
    this.options.onError?.(errorMsg, error, metadata);
  }
}
```

---

## 错误分类

### 错误级别

| 级别 | 描述 | 处理方式 | 示例 |
|------|------|---------|------|
| **Fatal** | 致命错误，无法继续 | 抛出错误，停止执行 | 核心依赖缺失 |
| **Error** | 严重错误，功能不可用 | 记录错误，优雅降级 | API 调用失败 |
| **Warning** | 警告，功能可能受影响 | 记录警告，使用默认值 | 配置项无效 |
| **Info** | 信息性消息 | 记录信息 | 功能已弃用 |

### 错误类型

#### 1. 验证错误（Validation Errors）

用户输入或配置参数不符合要求。

```typescript
// 示例
if (!isValidEmail(email)) {
  throw new ValidationError('Invalid email format', { email });
}
```

**处理策略**: 
- 立即验证并抛出错误
- 提供清晰的错误消息
- 不允许无效状态传播

#### 2. 配置错误（Configuration Errors）

配置选项缺失或无效。

```typescript
// 示例
if (options.threshold < 0 || options.threshold > 1) {
  console.warn('Invalid threshold, using default 0.01');
  options.threshold = 0.01;
}
```

**处理策略**:
- 使用合理的默认值
- 记录警告信息
- 继续执行

#### 3. 运行时错误（Runtime Errors）

执行过程中发生的错误。

```typescript
// 示例
try {
  const data = JSON.parse(response);
} catch (error) {
  throw new RuntimeError('Failed to parse response', { cause: error });
}
```

**处理策略**:
- 捕获并包装错误
- 提供上下文信息
- 根据严重程度决定是否继续

#### 4. 网络错误（Network Errors）

API 调用或资源加载失败。

```typescript
// 示例
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new NetworkError(`HTTP ${response.status}`, { url, status: response.status });
  }
} catch (error) {
  // 重试或降级
}
```

**处理策略**:
- 实现重试机制
- 提供离线降级方案
- 缓存成功的响应

#### 5. DOM 错误（DOM Errors）

DOM 操作失败或元素不存在。

```typescript
// 示例
const element = document.querySelector(selector);
if (!element) {
  throw new DOMError(`Element not found: ${selector}`);
}
```

**处理策略**:
- 验证元素存在性
- 提供清晰的选择器信息
- 考虑延迟初始化

---

## 自定义错误类

### 基础错误类

```typescript
/**
 * 基础错误类，所有自定义错误的父类
 */
export class UILibraryError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timestamp = new Date();

    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 转换为 JSON 格式（用于日志）
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}
```

### 具体错误类

#### ValidationError

```typescript
/**
 * 验证错误 - 用户输入或参数不符合要求
 */
export class ValidationError extends UILibraryError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

// 使用示例
function setTheme(mode: string) {
  const validModes = ['light', 'dark', 'auto'];
  if (!validModes.includes(mode)) {
    throw new ValidationError(
      `Invalid theme mode: ${mode}`,
      { mode, validModes }
    );
  }
}
```

#### ConfigurationError

```typescript
/**
 * 配置错误 - 配置选项无效
 */
export class ConfigurationError extends UILibraryError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', context);
  }
}

// 使用示例
function validateOptions(options: ThemeOptions) {
  if (options.storageKey && options.storageKey.length === 0) {
    throw new ConfigurationError(
      'storageKey cannot be empty',
      { storageKey: options.storageKey }
    );
  }
}
```

#### RuntimeError

```typescript
/**
 * 运行时错误 - 执行过程中的错误
 */
export class RuntimeError extends UILibraryError {
  public readonly cause?: Error;

  constructor(
    message: string,
    context?: Record<string, any> & { cause?: Error }
  ) {
    super(message, 'RUNTIME_ERROR', context);
    this.cause = context?.cause;
  }
}

// 使用示例
try {
  localStorage.setItem(key, value);
} catch (error) {
  throw new RuntimeError(
    'Failed to save to localStorage',
    { key, cause: error as Error }
  );
}
```

#### NetworkError

```typescript
/**
 * 网络错误 - API 调用或资源加载失败
 */
export class NetworkError extends UILibraryError {
  public readonly status?: number;
  public readonly url?: string;

  constructor(
    message: string,
    context?: Record<string, any> & { status?: number; url?: string }
  ) {
    super(message, 'NETWORK_ERROR', context);
    this.status = context?.status;
    this.url = context?.url;
  }
}

// 使用示例
async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new NetworkError(
        `HTTP ${response.status}: ${response.statusText}`,
        { status: response.status, url }
      );
    }
    return response.json();
  } catch (error) {
    if (error instanceof NetworkError) throw error;
    throw new NetworkError('Network request failed', { url, cause: error as Error });
  }
}
```

#### DOMError

```typescript
/**
 * DOM 错误 - DOM 操作失败
 */
export class DOMError extends UILibraryError {
  public readonly selector?: string;

  constructor(
    message: string,
    context?: Record<string, any> & { selector?: string }
  ) {
    super(message, 'DOM_ERROR', context);
    this.selector = context?.selector;
  }
}

// 使用示例
function getElement(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new DOMError(
      `Element not found: ${selector}`,
      { selector }
    );
  }
  return element;
}
```

---

## 错误处理模式

### 1. Try-Catch 模式

用于同步代码和可能抛出错误的操作。

```typescript
export class ThemeManager {
  setTheme(mode: ThemeMode): void {
    try {
      // 验证输入
      this.validateTheme(mode);
      
      // 更新状态
      this.currentTheme = mode;
      
      // 持久化
      this.saveToStorage(mode);
      
      // 更新 DOM
      this.updateDOM(mode);
      
      // 触发事件
      this.emit('theme-change', mode);
    } catch (error) {
      // 记录错误
      console.error('Failed to set theme:', error);
      
      // 恢复到之前的状态
      this.rollback();
      
      // 重新抛出
      throw error;
    }
  }
}
```

### 2. Promise 错误处理

用于异步操作。

```typescript
export class SearchModal {
  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new NetworkError(
          `Search failed: ${response.statusText}`,
          { status: response.status, query }
        );
      }
      
      return await response.json();
    } catch (error) {
      // 记录错误
      this.logError(error);
      
      // 显示用户友好的错误消息
      this.showError('搜索失败，请稍后重试');
      
      // 返回空结果（优雅降级）
      return [];
    }
  }
}
```

### 3. 错误边界模式

用于捕获组件树中的错误。

```typescript
export class ComponentErrorBoundary {
  private errorHandlers = new Map<Element, ErrorHandler>();

  /**
   * 为组件注册错误处理器
   */
  register(element: Element, handler: ErrorHandler): void {
    this.errorHandlers.set(element, handler);
  }

  /**
   * 捕获并处理错误
   */
  handleError(error: Error, element: Element): void {
    const handler = this.errorHandlers.get(element);
    
    if (handler) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
        this.fallbackHandler(error, element);
      }
    } else {
      this.fallbackHandler(error, element);
    }
  }

  /**
   * 默认错误处理器
   */
  private fallbackHandler(error: Error, element: Element): void {
    console.error('Unhandled error:', error);
    
    // 显示错误 UI
    element.innerHTML = `
      <div class="error-message">
        <p>抱歉，出现了一个错误</p>
        <button onclick="location.reload()">刷新页面</button>
      </div>
    `;
  }
}
```

### 4. 重试模式

用于可能暂时失败的操作。

```typescript
/**
 * 带重试的异步操作
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt);
        
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw new RuntimeError(
    `Operation failed after ${maxRetries} retries`,
    { cause: lastError! }
  );
}

// 使用示例
const data = await withRetry(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxRetries: 3,
    delay: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    }
  }
);
```

---

## 错误恢复机制

### 1. 状态回滚

```typescript
export class ThemeManager {
  private previousTheme?: ThemeMode;

  setTheme(mode: ThemeMode): void {
    // 保存当前状态
    this.previousTheme = this.currentTheme;

    try {
      this.currentTheme = mode;
      this.updateDOM(mode);
      this.saveToStorage(mode);
    } catch (error) {
      // 回滚到之前的状态
      this.rollback();
      throw error;
    }
  }

  private rollback(): void {
    if (this.previousTheme) {
      this.currentTheme = this.previousTheme;
      this.updateDOM(this.previousTheme);
    }
  }
}
```

### 2. 默认值降级

```typescript
export class LazyLoader {
  constructor(options: LazyLoaderOptions = {}) {
    // 使用默认值处理无效配置
    this.options = {
      root: options.root ?? null,
      rootMargin: this.validateRootMargin(options.rootMargin) ?? '50px',
      threshold: this.validateThreshold(options.threshold) ?? 0.01,
      loadingClass: options.loadingClass || 'loading',
      loadedClass: options.loadedClass || 'loaded',
      errorClass: options.errorClass || 'error',
    };
  }

  private validateThreshold(value?: number): number | undefined {
    if (value === undefined) return undefined;
    
    if (value < 0 || value > 1) {
      console.warn(`Invalid threshold ${value}, using default 0.01`);
      return undefined;
    }
    
    return value;
  }
}
```

### 3. 功能降级

```typescript
export class SearchModal {
  private searchProvider: 'pagefind' | 'fallback' = 'pagefind';

  async search(query: string): Promise<SearchResult[]> {
    try {
      // 尝试使用主要搜索提供商
      return await this.searchWithPagefind(query);
    } catch (error) {
      console.warn('Pagefind search failed, falling back to simple search');
      
      // 降级到简单搜索
      this.searchProvider = 'fallback';
      return this.searchWithFallback(query);
    }
  }

  private async searchWithFallback(query: string): Promise<SearchResult[]> {
    // 简单的客户端搜索实现
    const allContent = await this.loadAllContent();
    return allContent.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}
```

### 4. 自动重连

```typescript
export class WebSocketManager {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onclose = () => {
        this.handleDisconnect();
      };
      
      this.ws.onerror = (error) => {
        this.handleError(error);
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection-failed');
    }
  }
}
```

---

## 错误日志和监控

### 错误日志器

```typescript
export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * 记录错误
   */
  log(error: Error, context?: Record<string, any>): void {
    const log: ErrorLog = {
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logs.push(log);

    // 发送到监控服务
    this.sendToMonitoring(log);

    // 控制台输出
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', log);
    }
  }

  /**
   * 发送到监控服务
   */
  private async sendToMonitoring(log: ErrorLog): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (error) {
      // 静默失败，不影响用户体验
      console.warn('Failed to send error log:', error);
    }
  }

  /**
   * 获取错误历史
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * 清空日志
   */
  clear(): void {
    this.logs = [];
  }
}

interface ErrorLog {
  timestamp: Date;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, any>;
  userAgent: string;
  url: string;
}
```

### 全局错误处理

```typescript
/**
 * 设置全局错误处理器
 */
export function setupGlobalErrorHandlers(): void {
  const logger = ErrorLogger.getInstance();

  // 捕获未处理的错误
  window.addEventListener('error', (event) => {
    logger.log(event.error, {
      type: 'unhandled-error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // 捕获未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    logger.log(
      new Error(event.reason),
      { type: 'unhandled-rejection' }
    );
  });
}
```

---

## 用户友好的错误消息

### 错误消息映射

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  // 验证错误
  'VALIDATION_ERROR': '输入的信息格式不正确，请检查后重试',
  
  // 网络错误
  'NETWORK_ERROR': '网络连接失败，请检查您的网络设置',
  'NETWORK_TIMEOUT': '请求超时，请稍后重试',
  
  // DOM 错误
  'DOM_ERROR': '页面元素加载失败，请刷新页面',
  
  // 配置错误
  'CONFIGURATION_ERROR': '配置错误，请联系管理员',
  
  // 默认消息
  'DEFAULT': '抱歉，出现了一个错误，请稍后重试',
};

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof UILibraryError) {
    return ERROR_MESSAGES[error.code] || ERROR_MESSAGES.DEFAULT;
  }
  return ERROR_MESSAGES.DEFAULT;
}
```

### 错误 UI 组件

```typescript
export class ErrorDisplay {
  /**
   * 显示错误消息
   */
  show(error: Error, options: ErrorDisplayOptions = {}): void {
    const {
      container = document.body,
      duration = 5000,
      dismissible = true,
    } = options;

    const message = getUserFriendlyMessage(error);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-toast';
    errorElement.innerHTML = `
      <div class="error-toast__content">
        <span class="error-toast__icon">⚠️</span>
        <span class="error-toast__message">${message}</span>
        ${dismissible ? '<button class="error-toast__close">×</button>' : ''}
      </div>
    `;

    container.appendChild(errorElement);

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => this.dismiss(errorElement), duration);
    }

    // 手动关闭
    if (dismissible) {
      errorElement.querySelector('.error-toast__close')?.addEventListener('click', () => {
        this.dismiss(errorElement);
      });
    }
  }

  /**
   * 关闭错误消息
   */
  private dismiss(element: HTMLElement): void {
    element.classList.add('error-toast--dismissing');
    setTimeout(() => element.remove(), 300);
  }
}

interface ErrorDisplayOptions {
  container?: HTMLElement;
  duration?: number;
  dismissible?: boolean;
}
```

---

## 最佳实践总结

### ✅ 应该做的

1. **早期验证** - 在函数入口验证参数
2. **明确的错误类型** - 使用自定义错误类
3. **提供上下文** - 错误消息包含足够的调试信息
4. **优雅降级** - 非关键功能失败时保持核心功能可用
5. **记录错误** - 所有错误都应该被记录
6. **用户友好** - 向用户展示友好的错误消息

### ❌ 不应该做的

1. **吞掉错误** - 不要空的 catch 块
2. **泄露敏感信息** - 错误消息不应包含密码、token 等
3. **过度捕获** - 不要捕获所有错误然后什么都不做
4. **忽略错误** - 不要用 `console.log` 代替正确的错误处理
5. **阻塞用户** - 错误不应该让整个应用崩溃

---

## 相关文档

- [API 参考](../api/README.md) - 核心 API 和错误类型
- [测试策略](../testing/README.md) - 错误场景测试
- [安全性文档](./security.md) - 安全相关的错误处理
- [故障排查](./troubleshooting.md) - 常见错误和解决方案

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
