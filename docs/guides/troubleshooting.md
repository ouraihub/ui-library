# 故障排查指南

> **版本**: 1.4.0  
> **最后更新**: 2026-05-12  
> **状态**: active  
> **维护者**: Sisyphus (AI Agent)

本文档提供 `@ouraihub/ui-library` 常见问题的诊断和解决方案，帮助快速定位和修复问题。

---

## 目录

- [快速诊断](#快速诊断)
- [安装问题](#安装问题)
- [主题系统问题](#主题系统问题)
- [导航问题](#导航问题)
- [搜索问题](#搜索问题)
- [懒加载问题](#懒加载问题)
- [构建问题](#构建问题)
- [性能问题](#性能问题)
- [浏览器兼容性问题](#浏览器兼容性问题)

---

## 快速诊断

### 诊断工具

```typescript
// 添加到项目中用于诊断
import { ThemeManager } from '@ouraihub/core';

// 启用调试模式
const themeManager = new ThemeManager({
  debug: true,  // 输出详细日志
});

// 检查版本
console.log('Core version:', ThemeManager.VERSION);

// 检查浏览器支持
console.log('IntersectionObserver:', 'IntersectionObserver' in window);
console.log('localStorage:', (() => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch {
    return false;
  }
})());
```

### 常见问题检查清单

- [ ] 依赖版本正确？(`pnpm list @ouraihub/core`)
- [ ] 构建成功？(`pnpm build`)
- [ ] 浏览器控制台有错误？
- [ ] 网络请求失败？(检查 Network 面板)
- [ ] CSS 样式加载？(检查 Elements 面板)

---

## 安装问题

### 问题 1: 依赖安装失败

**症状**:
```bash
ERR_PNPM_PEER_DEP_ISSUES  Unmet peer dependencies
```

**原因**: peer dependencies 版本不匹配

**解决方案**:

```bash
# 检查 peer dependencies
pnpm why @ouraihub/core

# 强制安装（不推荐）
pnpm install --force

# 推荐: 更新到兼容版本
pnpm add @ouraihub/core@latest
```

### 问题 2: 类型定义缺失

**症状**:
```typescript
// TypeScript 报错
Cannot find module '@ouraihub/core' or its corresponding type declarations.
```

**原因**: 类型定义未正确导出

**解决方案**:

```bash
# 1. 确保安装了类型定义
pnpm add -D @types/node

# 2. 检查 tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",  // 或 "node"
    "types": ["node"]
  }
}

# 3. 重启 TypeScript 服务器
# VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### 问题 3: 模块解析失败

**症状**:
```
Error: Cannot find module '@ouraihub/core'
```

**原因**: 模块解析配置错误

**解决方案**:

```javascript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@ouraihub/core': '@ouraihub/core/dist/index.js',
    },
  },
});

// 或使用 package.json exports
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

---

## 主题系统问题

### 问题 1: 主题不切换

**症状**: 点击主题切换按钮，主题没有变化

**诊断步骤**:

```typescript
// 1. 检查 ThemeManager 是否初始化
console.log('ThemeManager instance:', window.themeManager);

// 2. 检查当前主题
console.log('Current theme:', themeManager.currentTheme);

// 3. 监听主题变化事件
themeManager.on('theme-changed', (event) => {
  console.log('Theme changed to:', event.theme);
});

// 4. 手动切换主题
themeManager.applyTheme('dark');
```

**常见原因和解决方案**:

#### 原因 1: HTML 属性未更新

```typescript
// 检查 DOM
console.log(document.documentElement.getAttribute('data-theme'));

// 如果为 null，检查 ThemeManager 配置
const themeManager = new ThemeManager({
  attribute: 'data-theme',  // 确保配置正确
});
```

#### 原因 2: CSS 变量未定义

```css
/* 检查 CSS 变量是否定义 */
:root {
  --color-bg: #ffffff;
  --color-text: #000000;
}

[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
}

/* 使用 CSS 变量 */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

#### 原因 3: localStorage 被禁用

```typescript
// 检查 localStorage 可用性
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage available');
} catch (error) {
  console.error('localStorage not available:', error);
  
  // 使用内存存储作为降级
  const themeManager = new ThemeManager({
    storageType: 'memory',
  });
}
```

### 问题 2: 主题闪烁 (FOUC)

**症状**: 页面加载时先显示默认主题，然后切换到保存的主题

**原因**: 主题应用时机太晚

**解决方案**:

```html
<!-- 在 <head> 中添加阻塞脚本 -->
<script>
  // 立即执行，阻塞渲染
  (function() {
    const theme = localStorage.getItem('theme') || 'auto';
    const resolvedTheme = theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  })();
</script>

<!-- 然后加载主脚本 -->
<script type="module" src="/main.js" defer></script>
```

### 问题 3: 系统主题不同步

**症状**: 设置为 `auto` 模式，但系统主题变化时页面不更新

**原因**: 未监听系统主题变化

**解决方案**:

```typescript
// ThemeManager 应该自动处理，检查是否正确初始化
const themeManager = new ThemeManager({
  defaultTheme: 'auto',
  watchSystemTheme: true,  // 确保启用
});

// 手动监听（调试用）
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (e) => {
  console.log('System theme changed:', e.matches ? 'dark' : 'light');
});
```

---

## 导航问题

### 问题 1: 移动端菜单不打开

**症状**: 点击菜单按钮，菜单没有显示

**诊断步骤**:

```typescript
// 1. 检查 NavigationController 初始化
console.log('Nav instance:', window.navController);

// 2. 检查菜单状态
console.log('Menu open:', navController.isOpen);

// 3. 检查 DOM 元素
console.log('Menu element:', document.querySelector('.mobile-menu'));
console.log('Toggle button:', document.querySelector('[data-nav-toggle]'));

// 4. 手动打开菜单
navController.open();
```

**常见原因和解决方案**:

#### 原因 1: 选择器错误

```typescript
// 检查选择器是否匹配
const nav = new NavigationController({
  menuSelector: '.mobile-menu',      // 确保元素存在
  toggleSelector: '[data-nav-toggle]',
});

// 验证
console.log(document.querySelector('.mobile-menu'));  // 应该不为 null
```

#### 原因 2: CSS 类名错误

```css
/* 确保 CSS 类名正确 */
.mobile-menu {
  display: none;
}

.mobile-menu.open {
  display: block;
}

/* 或使用 data 属性 */
.mobile-menu[data-open="true"] {
  display: block;
}
```

#### 原因 3: z-index 问题

```css
/* 菜单被其他元素遮挡 */
.mobile-menu {
  position: fixed;
  z-index: 1000;  /* 确保足够高 */
}
```

### 问题 2: 菜单关闭后页面仍然不可滚动

**症状**: 关闭菜单后，页面 `overflow: hidden` 未移除

**原因**: 事件监听器未正确清理

**解决方案**:

```typescript
// 检查 body 样式
console.log(document.body.style.overflow);  // 应该为 '' 或 'auto'

// 手动修复
document.body.style.overflow = '';

// 确保 NavigationController 正确清理
navController.on('menu-closed', () => {
  console.log('Menu closed, overflow:', document.body.style.overflow);
});
```

---

## 搜索问题

### 问题 1: 搜索无结果

**症状**: 输入搜索关键词，没有返回结果

**诊断步骤**:

```typescript
// 1. 检查 Pagefind 是否加载
console.log('Pagefind loaded:', window.pagefind);

// 2. 手动搜索
const results = await window.pagefind.search('test');
console.log('Search results:', results);

// 3. 检查索引文件
fetch('/pagefind/pagefind.js')
  .then(res => console.log('Pagefind index:', res.ok))
  .catch(err => console.error('Pagefind not found:', err));
```

**常见原因和解决方案**:

#### 原因 1: Pagefind 索引未生成

```bash
# 生成 Pagefind 索引
pnpm exec pagefind --source dist

# 检查输出
ls -la dist/pagefind/
```

#### 原因 2: 路径配置错误

```typescript
const search = new SearchModal({
  pagefindPath: '/pagefind/pagefind.js',  // 确保路径正确
});

// 或使用绝对路径
const search = new SearchModal({
  pagefindPath: `${window.location.origin}/pagefind/pagefind.js`,
});
```

#### 原因 3: CORS 问题

```
Access to fetch at 'file:///pagefind/pagefind.js' from origin 'null' has been blocked by CORS policy
```

**解决方案**: 使用本地服务器而非 `file://` 协议

```bash
# 使用 http-server
pnpm exec http-server dist -p 8080

# 或使用 Python
python -m http.server 8080 --directory dist
```

### 问题 2: 搜索结果不准确

**症状**: 搜索结果与预期不符

**原因**: Pagefind 索引配置不当

**解决方案**:

```javascript
// pagefind.config.js
export default {
  source: 'dist',
  bundle_dir: 'pagefind',
  
  // 排除不需要索引的内容
  exclude_selectors: [
    '.no-index',
    'nav',
    'footer',
    '.sidebar',
  ],
  
  // 提高特定元素的权重
  ranking: {
    page_rank: {
      h1: 10,
      h2: 5,
      h3: 3,
      p: 1,
    },
  },
};
```

---

## 懒加载问题

### 问题 1: 图片不加载

**症状**: 滚动到图片位置，图片仍然不显示

**诊断步骤**:

```typescript
// 1. 检查 LazyLoader 初始化
console.log('LazyLoader instance:', window.lazyLoader);

// 2. 检查 IntersectionObserver 支持
console.log('IntersectionObserver:', 'IntersectionObserver' in window);

// 3. 检查图片元素
const img = document.querySelector('img[data-src]');
console.log('Image element:', img);
console.log('data-src:', img?.dataset.src);

// 4. 手动触发加载
lazyLoader.observe(img);
```

**常见原因和解决方案**:

#### 原因 1: data-src 属性缺失

```html
<!-- ❌ 错误 -->
<img src="placeholder.jpg" alt="Image">

<!-- ✅ 正确 -->
<img data-src="image.jpg" alt="Image" loading="lazy">
```

#### 原因 2: IntersectionObserver 不支持

```typescript
// 检测并加载 polyfill
if (!('IntersectionObserver' in window)) {
  await import('intersection-observer');
}

// 或使用降级方案
if (!('IntersectionObserver' in window)) {
  // 立即加载所有图片
  document.querySelectorAll('img[data-src]').forEach((img) => {
    img.src = img.dataset.src;
  });
}
```

#### 原因 3: rootMargin 设置不当

```typescript
// rootMargin 太小，图片进入视口才开始加载
const loader = new LazyLoader({
  rootMargin: '10px',  // 太小
});

// 增大 rootMargin，提前加载
const loader = new LazyLoader({
  rootMargin: '200px',  // 提前 200px 开始加载
});
```

---

## 构建问题

### 问题 1: 构建失败

**症状**:
```bash
Error: Build failed with 1 error:
src/index.ts:1:23: ERROR: Could not resolve "@ouraihub/core"
```

**原因**: 依赖未安装或路径配置错误

**解决方案**:

```bash
# 1. 清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. 检查依赖
pnpm list @ouraihub/core

# 3. 重新构建
pnpm build
```

### 问题 2: 类型检查失败

**症状**:
```bash
src/main.ts:10:5 - error TS2322: Type 'string' is not assignable to type 'Theme'.
```

**解决方案**:

```typescript
// 使用类型断言
const theme = 'dark' as Theme;

// 或使用类型守卫
function isTheme(value: string): value is Theme {
  return ['light', 'dark', 'auto'].includes(value);
}

const theme = 'dark';
if (isTheme(theme)) {
  themeManager.applyTheme(theme);
}
```

### 问题 3: 包体积过大

**症状**: 构建后的包体积超出预期

**诊断**:

```bash
# 分析包体积
pnpm exec vite-bundle-visualizer

# 检查 tree-shaking
pnpm exec rollup-plugin-visualizer
```

**解决方案**:

```typescript
// 1. 按需导入
// ❌ 错误
import * as Core from '@ouraihub/core';

// ✅ 正确
import { ThemeManager } from '@ouraihub/core';

// 2. 动态导入
const SearchModal = await import('@ouraihub/core/search');

// 3. 配置 tree-shaking
// package.json
{
  "sideEffects": false
}
```

---

## 性能问题

### 问题 1: 页面加载慢

**诊断**:

```typescript
// 使用 Performance API
performance.mark('start');

// ... 初始化代码 ...

performance.mark('end');
performance.measure('init', 'start', 'end');

const measure = performance.getEntriesByName('init')[0];
console.log('Init time:', measure.duration, 'ms');
```

**优化方案**:

```typescript
// 1. 延迟非关键初始化
window.addEventListener('load', () => {
  // 页面加载完成后再初始化
  const search = new SearchModal();
});

// 2. 使用 requestIdleCallback
requestIdleCallback(() => {
  // 浏览器空闲时初始化
  const loader = new LazyLoader();
});

// 3. 代码分割
const SearchModal = await import('@ouraihub/core/search');
```

### 问题 2: 内存泄漏

**症状**: 页面使用时间越长，内存占用越高

**诊断**:

```typescript
// Chrome DevTools → Memory → Take Heap Snapshot
// 查找 Detached DOM nodes

// 检查事件监听器
getEventListeners(document);
```

**解决方案**:

```typescript
// 确保清理事件监听器
class Component {
  private listeners: Array<() => void> = [];
  
  init(): void {
    const handler = () => { /* ... */ };
    window.addEventListener('resize', handler);
    this.listeners.push(() => window.removeEventListener('resize', handler));
  }
  
  destroy(): void {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}
```

---

## 浏览器兼容性问题

### 问题 1: IE11 不支持

**症状**: IE11 中页面白屏或报错

**原因**: 使用了 ES6+ 语法

**解决方案**:

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',  // 降低目标版本
    polyfillDynamicImport: true,
  },
});

// 或添加 polyfill
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### 问题 2: Safari 私有模式问题

**症状**: Safari 私有模式下 localStorage 不可用

**解决方案**:

```typescript
// 使用 try-catch 包裹
try {
  localStorage.setItem('theme', 'dark');
} catch (error) {
  // 降级到内存存储
  console.warn('localStorage not available, using memory storage');
  const memoryStorage = new Map();
  memoryStorage.set('theme', 'dark');
}

// 或使用 ThemeManager 的内存存储
const themeManager = new ThemeManager({
  storageType: 'memory',
});
```

---

## 获取帮助

### 1. 查看文档

- [API 参考](../api/README.md)
- [快速开始](../implementation/02-quick-start.md)
- [迁移指南](./migration.md)

### 2. 搜索已知问题

```bash
# GitHub Issues
https://github.com/ouraihub/ui-library/issues

# 搜索关键词
"ThemeManager not working"
"SearchModal no results"
```

### 3. 提交 Issue

```markdown
## 问题描述
简要描述问题

## 复现步骤
1. 安装 @ouraihub/core@1.0.0
2. 初始化 ThemeManager
3. 点击主题切换按钮
4. 主题没有变化

## 预期行为
主题应该切换

## 实际行为
主题没有变化

## 环境信息
- OS: macOS 14.0
- Browser: Chrome 120
- Package version: @ouraihub/core@1.0.0
- Node version: 20.10.0

## 相关代码
\`\`\`typescript
const themeManager = new ThemeManager();
\`\`\`

## 错误日志
\`\`\`
TypeError: Cannot read property 'setAttribute' of null
\`\`\`
```

---

## 相关文档

- [API 参考](../api/README.md) - 完整 API 文档
- [测试策略](../testing/README.md) - 测试和调试
  - [浏览器兼容性](../compatibility/browsers.md) - 兼容性信息
- [性能优化](./performance.md) - 性能优化指南

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
