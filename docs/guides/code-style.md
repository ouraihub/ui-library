# 代码规范

> **版本**: 1.4.0  
> **最后更新**: 2026-05-12  
> **状态**: active  
> **维护者**: Sisyphus (AI Agent)

本文档定义 `@ouraihub/ui-library` 的代码规范，包括 TypeScript、CSS、命名约定、文件组织和最佳实践。

---

## 目录

- [TypeScript 规范](#typescript-规范)
- [CSS 规范](#css-规范)
- [命名约定](#命名约定)
- [文件组织](#文件组织)
- [Git 提交规范](#git-提交规范)
- [代码审查清单](#代码审查清单)

---

## TypeScript 规范

### 1. 基础配置

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    
    // 严格模式
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    
    // 代码质量
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    
    // 输出
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    
    // 路径
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 2. 类型定义

#### 优先使用 interface

```typescript
// ✅ 正确: 使用 interface 定义对象类型
interface ThemeOptions {
  storageKey: string;
  defaultTheme: Theme;
  transitions?: boolean;
}

// ❌ 错误: 使用 type 定义对象类型（除非需要联合类型）
type ThemeOptions = {
  storageKey: string;
  defaultTheme: Theme;
};
```

#### 使用 type 定义联合类型

```typescript
// ✅ 正确: 使用 type 定义联合类型
type Theme = 'light' | 'dark' | 'auto';
type StorageType = 'local' | 'session' | 'memory';

// ✅ 正确: 使用 type 定义工具类型
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
```

#### 避免 any

```typescript
// ❌ 错误: 使用 any
function processData(data: any): any {
  return data.value;
}

// ✅ 正确: 使用泛型
function processData<T extends { value: unknown }>(data: T): T['value'] {
  return data.value;
}

// ✅ 正确: 使用 unknown
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String(data.value);
  }
  throw new Error('Invalid data');
}
```

#### 使用严格的类型守卫

```typescript
// ✅ 正确: 类型守卫
function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && ['light', 'dark', 'auto'].includes(value);
}

// 使用
function setTheme(theme: unknown): void {
  if (!isTheme(theme)) {
    throw new TypeError(`Invalid theme: ${theme}`);
  }
  // theme 现在是 Theme 类型
  applyTheme(theme);
}
```

### 3. 函数规范

#### 函数签名

```typescript
// ✅ 正确: 明确的参数和返回类型
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ❌ 错误: 缺少类型注解
function debounce(fn, delay) {
  // ...
}
```

#### 可选参数和默认值

```typescript
// ✅ 正确: 使用默认值
function createThemeManager(options: Partial<ThemeOptions> = {}): ThemeManager {
  const defaults: ThemeOptions = {
    storageKey: 'theme',
    defaultTheme: 'auto',
    transitions: true,
  };
  
  return new ThemeManager({ ...defaults, ...options });
}

// ✅ 正确: 可选参数放在最后
function log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
  console[level](message);
}
```

#### 箭头函数 vs 普通函数

```typescript
// ✅ 正确: 类方法使用普通函数
class ThemeManager {
  applyTheme(theme: Theme): void {
    // 可以访问 this
  }
}

// ✅ 正确: 回调使用箭头函数
element.addEventListener('click', (event) => {
  // 保持外部 this
  this.handleClick(event);
});

// ✅ 正确: 工具函数使用箭头函数
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  // ...
};
```

### 4. 类规范

#### 类定义

```typescript
// ✅ 正确: 完整的类定义
export class ThemeManager extends EventEmitter {
  // 私有属性使用 # 或 private
  #currentTheme: Theme;
  private storage: Storage;
  
  // 公共属性
  public readonly options: ThemeOptions;
  
  // 构造函数
  constructor(options: Partial<ThemeOptions> = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.#currentTheme = this.loadTheme();
    this.storage = this.createStorage();
  }
  
  // Getter/Setter
  get currentTheme(): Theme {
    return this.#currentTheme;
  }
  
  // 公共方法
  public applyTheme(theme: Theme): void {
    this.#currentTheme = theme;
    this.saveTheme(theme);
    this.emit('theme-changed', { theme });
  }
  
  // 私有方法
  private loadTheme(): Theme {
    // ...
  }
  
  // 静态方法
  static create(options?: Partial<ThemeOptions>): ThemeManager {
    return new ThemeManager(options);
  }
}
```

#### 访问修饰符顺序

```typescript
class Example {
  // 1. 静态属性
  static readonly VERSION = '1.0.0';
  private static instance: Example;
  
  // 2. 实例属性
  public readonly id: string;
  protected name: string;
  private #data: any;
  
  // 3. 构造函数
  constructor() { }
  
  // 4. 静态方法
  static getInstance(): Example { }
  
  // 5. Getter/Setter
  get value(): string { }
  set value(v: string) { }
  
  // 6. 公共方法
  public method(): void { }
  
  // 7. 保护方法
  protected protectedMethod(): void { }
  
  // 8. 私有方法
  private privateMethod(): void { }
}
```

### 5. 错误处理

#### 自定义错误类

```typescript
// ✅ 正确: 自定义错误类
export class ThemeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ThemeError';
    
    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ThemeError);
    }
  }
}

// 使用
throw new ThemeError(
  'Invalid theme value',
  'INVALID_THEME',
  { theme, validThemes: ['light', 'dark', 'auto'] }
);
```

#### 错误处理模式

```typescript
// ✅ 正确: 具体的错误处理
try {
  const theme = loadTheme();
  applyTheme(theme);
} catch (error) {
  if (error instanceof ThemeError) {
    // 处理主题错误
    console.error('Theme error:', error.message, error.context);
  } else if (error instanceof StorageError) {
    // 处理存储错误
    console.error('Storage error:', error.message);
  } else {
    // 未知错误
    console.error('Unexpected error:', error);
    throw error;
  }
}

// ❌ 错误: 空的 catch 块
try {
  doSomething();
} catch (error) {
  // 静默失败
}
```

### 6. ESLint 配置

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    
    // 代码质量
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // 代码风格
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
  },
};
```

---

## CSS 规范

### 1. 基础规范

#### 使用 CSS 变量

```css
/* ✅ 正确: 使用 CSS 变量 */
:root {
  --color-primary: #3b82f6;
  --color-text: #1f2937;
  --spacing-unit: 0.25rem;
  --font-family-base: system-ui, sans-serif;
}

.button {
  color: var(--color-primary);
  padding: calc(var(--spacing-unit) * 2);
  font-family: var(--font-family-base);
}

/* ❌ 错误: 硬编码值 */
.button {
  color: #3b82f6;
  padding: 0.5rem;
  font-family: system-ui, sans-serif;
}
```

#### 命名约定 (BEM)

```css
/* ✅ 正确: BEM 命名 */
.theme-toggle { }
.theme-toggle__button { }
.theme-toggle__icon { }
.theme-toggle--active { }

/* ❌ 错误: 嵌套过深 */
.theme .toggle .button .icon { }
```

#### 选择器优先级

```css
/* ✅ 正确: 低优先级选择器 */
.button { }
.button--primary { }
.button[disabled] { }

/* ❌ 错误: 高优先级选择器 */
#button { }
.button.button-primary { }
div.button { }
```

### 2. Tailwind CSS v4 规范

#### 使用 @theme 定义主题

```css
/* styles/theme.css */
@theme {
  /* 颜色 */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-danger: #ef4444;
  
  /* 间距 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* 字体 */
  --font-sans: system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* 断点 */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

#### 使用 @layer 组织样式

```css
/* ✅ 正确: 使用 @layer */
@layer components {
  .button {
    @apply px-4 py-2 rounded-lg font-medium;
    @apply transition-colors duration-200;
  }
  
  .button--primary {
    @apply bg-primary text-white hover:bg-primary-dark;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### 3. PostCSS 配置

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
    require('cssnano')({
      preset: ['default', {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
      }],
    }),
  ],
};
```

### 4. Stylelint 配置

```javascript
// .stylelintrc.cjs
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss',
  ],
  rules: {
    // 禁止未知的 @ 规则
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['tailwind', 'apply', 'layer', 'theme'],
    }],
    
    // 颜色格式
    'color-hex-length': 'long',
    'color-named': 'never',
    
    // 选择器
    'selector-class-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
    'selector-max-id': 0,
    'selector-max-specificity': '0,3,0',
    
    // 声明
    'declaration-no-important': true,
    'declaration-block-no-duplicate-properties': true,
  },
};
```

---

## 命名约定

### 1. 文件命名

```
✅ 正确:
- ThemeManager.ts          (PascalCase for classes)
- useTheme.ts              (camelCase for hooks)
- theme-utils.ts           (kebab-case for utilities)
- index.ts                 (entry files)
- ThemeManager.test.ts     (test files)

❌ 错误:
- themeManager.ts
- theme_manager.ts
- ThemeManager.tsx         (不使用 .tsx 除非是 React)
```

### 2. 变量命名

```typescript
// ✅ 正确: camelCase
const themeManager = new ThemeManager();
const currentTheme = 'dark';
const isLightMode = theme === 'light';

// ✅ 正确: UPPER_SNAKE_CASE for constants
const DEFAULT_THEME = 'auto';
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// ❌ 错误
const ThemeManager = new ThemeManager();  // 变量不用 PascalCase
const current_theme = 'dark';             // 不用 snake_case
```

### 3. 类和接口命名

```typescript
// ✅ 正确: PascalCase
class ThemeManager { }
interface ThemeOptions { }
type Theme = 'light' | 'dark' | 'auto';
enum StorageType { Local, Session, Memory }

// ❌ 错误: 接口不加 I 前缀
interface IThemeOptions { }

// ❌ 错误: 类型不加 T 前缀
type TTheme = 'light' | 'dark' | 'auto';
```

### 4. 函数命名

```typescript
// ✅ 正确: 动词开头
function getTheme(): Theme { }
function setTheme(theme: Theme): void { }
function isValidTheme(theme: unknown): boolean { }
function hasThemeChanged(): boolean { }
function createThemeManager(): ThemeManager { }

// ✅ 正确: 事件处理器
function handleThemeChange(event: Event): void { }
function onThemeChanged(theme: Theme): void { }

// ❌ 错误: 名词开头
function theme(): Theme { }
function validation(theme: unknown): boolean { }
```

### 5. 布尔值命名

```typescript
// ✅ 正确: is/has/can/should 开头
const isLoading = true;
const hasError = false;
const canEdit = true;
const shouldUpdate = false;

// ❌ 错误
const loading = true;
const error = false;
```

---

## 文件组织

### 1. 项目结构

```
packages/core/
├── src/
│   ├── theme/
│   │   ├── ThemeManager.ts       # 主类
│   │   ├── ThemeManager.test.ts  # 测试
│   │   ├── types.ts               # 类型定义
│   │   ├── constants.ts           # 常量
│   │   └── index.ts               # 导出
│   ├── utils/
│   │   ├── dom.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   └── index.ts                   # 包入口
├── dist/                          # 构建输出
├── tests/                         # E2E 测试
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### 2. 导入顺序

```typescript
// ✅ 正确: 导入顺序
// 1. Node.js 内置模块
import { readFileSync } from 'fs';

// 2. 外部依赖
import DOMPurify from 'dompurify';

// 3. 内部模块 (绝对路径)
import { ThemeManager } from '@/theme';
import { debounce } from '@/utils';

// 4. 相对路径
import { ThemeOptions } from './types';
import { DEFAULT_THEME } from './constants';

// 5. 类型导入
import type { Theme } from './types';
```

### 3. 导出模式

```typescript
// ✅ 正确: 命名导出
// theme/ThemeManager.ts
export class ThemeManager { }

// theme/types.ts
export interface ThemeOptions { }
export type Theme = 'light' | 'dark' | 'auto';

// theme/index.ts
export { ThemeManager } from './ThemeManager';
export type { ThemeOptions, Theme } from './types';

// ❌ 错误: 默认导出
export default class ThemeManager { }
```

---

## Git 提交规范

### 1. Commit Message 格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构（不是新功能也不是修复）
perf:     性能优化
test:     测试相关
build:    构建系统或依赖更新
ci:       CI 配置更新
chore:    其他杂项
```

#### 示例

```bash
# 新功能
git commit -m "feat(theme): add theme transition animation"

# Bug 修复
git commit -m "fix(storage): handle localStorage quota exceeded error"

# 破坏性变更
git commit -m "feat(theme)!: rename setTheme to applyTheme

BREAKING CHANGE: ThemeManager.setTheme() has been renamed to applyTheme()
to better reflect its behavior."

# 多行提交
git commit -m "refactor(core): improve error handling

- Add custom error classes
- Implement error recovery mechanism
- Update error messages

Closes #123"
```

### 2. 分支命名

```
feat/theme-transitions      # 新功能
fix/storage-quota-error     # Bug 修复
refactor/error-handling     # 重构
docs/api-reference          # 文档
chore/update-dependencies   # 杂项
```

### 3. Pull Request 规范

#### PR 标题

```
feat(theme): Add theme transition animation
fix(storage): Handle localStorage quota exceeded error
docs: Update API reference
```

#### PR 描述模板

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 其他

## 变更描述
简要描述本次变更的内容和原因。

## 测试
- [ ] 单元测试通过
- [ ] E2E 测试通过
- [ ] 手动测试通过

## 检查清单
- [ ] 代码符合规范
- [ ] 添加/更新了测试
- [ ] 更新了文档
- [ ] 无破坏性变更（或已在 CHANGELOG 中说明）

## 相关 Issue
Closes #123
```

---

## 代码审查清单

### TypeScript

- [ ] 无 `any` 类型（除非有充分理由）
- [ ] 无 `@ts-ignore` 或 `@ts-expect-error`
- [ ] 所有函数有明确的返回类型
- [ ] 使用严格的类型守卫
- [ ] 错误处理完善

### 代码质量

- [ ] 无重复代码
- [ ] 函数职责单一
- [ ] 变量命名清晰
- [ ] 无魔法数字
- [ ] 注释充分（复杂逻辑）

### 性能

- [ ] 无不必要的重复计算
- [ ] 使用防抖/节流（如需要）
- [ ] 避免内存泄漏
- [ ] 懒加载大型依赖

### 测试

- [ ] 核心逻辑有单元测试
- [ ] 测试覆盖率 ≥80%
- [ ] 边界情况已测试
- [ ] 错误情况已测试

### 文档

- [ ] 公共 API 有 JSDoc
- [ ] README 已更新
- [ ] CHANGELOG 已更新
- [ ] 迁移指南已更新（如有破坏性变更）

---

## Prettier 配置

```javascript
// .prettierrc.cjs
module.exports = {
  // 基础
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // JSX
  jsxSingleQuote: false,
  
  // 尾随逗号
  trailingComma: 'es5',
  
  // 括号
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  
  // 其他
  endOfLine: 'lf',
  proseWrap: 'preserve',
};
```

---

## 相关文档

- [API 参考](../api/README.md) - API 文档规范
- [测试策略](../testing/README.md) - 测试规范
- [部署指南](../deployment/README.md) - 发布规范
- [贡献指南](../../CONTRIBUTING.md) - 贡献流程

---

## 工具和资源

- [TypeScript](https://www.typescriptlang.org/) - TypeScript 官方文档
- [ESLint](https://eslint.org/) - JavaScript/TypeScript 代码检查
- [Prettier](https://prettier.io/) - 代码格式化
- [Stylelint](https://stylelint.io/) - CSS 代码检查
- [Conventional Commits](https://www.conventionalcommits.org/) - 提交规范

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
