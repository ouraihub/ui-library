# 性能优化策略

> **版本**: 1.4.0  
> **最后更新**: 2026-05-12  
> **状态**: active  
> **维护者**: Sisyphus (AI Agent)

本文档定义 `@ouraihub/ui-library` 的性能优化策略，包括包体积优化、代码分割、懒加载、缓存策略和性能监控。

---

## 目录

- [性能目标](#性能目标)
- [包体积优化](#包体积优化)
- [代码分割](#代码分割)
- [懒加载策略](#懒加载策略)
- [缓存策略](#缓存策略)
- [性能监控](#性能监控)
- [优化检查清单](#优化检查清单)

---

## 性能目标

### 核心指标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| **包体积** | `@ouraihub/core` ≤ 15 KB (gzip) | `size-limit` |
| **首次加载** | ≤ 1s (3G 网络) | Lighthouse |
| **TTI** | ≤ 3s | Lighthouse |
| **FCP** | ≤ 1.5s | Lighthouse |
| **CLS** | ≤ 0.1 | Lighthouse |
| **Tree-shaking** | 100% 未使用代码可移除 | Rollup analysis |

### Web Vitals 目标

```typescript
// 性能预算
const PERFORMANCE_BUDGET = {
  // Core Web Vitals
  LCP: 2500,  // Largest Contentful Paint (ms)
  FID: 100,   // First Input Delay (ms)
  CLS: 0.1,   // Cumulative Layout Shift
  
  // 其他指标
  FCP: 1500,  // First Contentful Paint (ms)
  TTI: 3000,  // Time to Interactive (ms)
  TBT: 300,   // Total Blocking Time (ms)
  
  // 资源预算
  javascript: 150 * 1024,  // 150 KB
  css: 50 * 1024,          // 50 KB
  images: 500 * 1024,      // 500 KB
};
```

---

## 包体积优化

### 1. Tree-shaking 友好设计

#### ESM 优先

```typescript
// ✅ 正确: 使用 ESM 导出
// packages/core/src/index.ts
export { ThemeManager } from './theme/ThemeManager';
export { SearchModal } from './search/SearchModal';
export { NavigationController } from './navigation/NavigationController';

// 用户可以按需导入
import { ThemeManager } from '@ouraihub/core';
```

```typescript
// ❌ 错误: 使用 CommonJS 或默认导出
// 不利于 tree-shaking
module.exports = {
  ThemeManager,
  SearchModal,
  NavigationController,
};
```

#### 避免副作用

```typescript
// ✅ 正确: 纯函数，无副作用
export function createThemeManager(options: ThemeOptions): ThemeManager {
  return new ThemeManager(options);
}

// ❌ 错误: 模块级副作用
// 即使不使用，也会执行
console.log('ThemeManager loaded');
document.addEventListener('DOMContentLoaded', () => {
  // 自动初始化
});
```

#### package.json 配置

```json
{
  "name": "@ouraihub/core",
  "sideEffects": false,  // 声明无副作用，启用 tree-shaking
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./theme": {
      "types": "./dist/theme/index.d.ts",
      "import": "./dist/theme/index.js"
    },
    "./search": {
      "types": "./dist/search/index.d.ts",
      "import": "./dist/search/index.js"
    }
  }
}
```

### 2. 代码压缩

#### esbuild 配置

```typescript
// build.config.ts
import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  bundle: true,
  minify: true,
  
  // 压缩选项
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  
  // 目标环境
  target: ['es2020', 'chrome90', 'firefox88', 'safari14'],
  
  // 代码分割
  splitting: true,
  format: 'esm',
  
  // Source maps
  sourcemap: true,
});
```

#### Terser 高级压缩

```typescript
// 对于需要极致压缩的场景
import { minify } from 'terser';

const result = await minify(code, {
  compress: {
    dead_code: true,
    drop_console: true,  // 生产环境移除 console
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info'],
  },
  mangle: {
    toplevel: true,
    properties: {
      regex: /^_/,  // 压缩以 _ 开头的私有属性
    },
  },
  format: {
    comments: false,  // 移除注释
  },
});
```

### 3. 依赖优化

#### 避免大型依赖

```typescript
// ❌ 错误: 引入整个 lodash (70 KB)
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ 正确: 只引入需要的函数 (2 KB)
import debounce from 'lodash-es/debounce';
debounce(fn, 300);

// ✅ 更好: 自己实现简单工具函数 (0.5 KB)
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

#### 依赖分析

```bash
# 分析包体积
pnpm exec size-limit

# 可视化依赖
pnpm exec vite-bundle-visualizer

# 检查重复依赖
pnpm dedupe
```

### 4. 包体积监控

#### size-limit 配置

```json
// .size-limit.json
[
  {
    "name": "@ouraihub/core",
    "path": "packages/core/dist/index.js",
    "limit": "15 KB",
    "gzip": true
  },
  {
    "name": "@ouraihub/core (theme only)",
    "path": "packages/core/dist/theme/index.js",
    "limit": "5 KB",
    "gzip": true
  },
  {
    "name": "@ouraihub/styles",
    "path": "packages/styles/dist/index.css",
    "limit": "20 KB",
    "gzip": true
  }
]
```

#### CI 集成

```yaml
# .github/workflows/size-check.yml
name: Size Check

on: [pull_request]

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          skip_step: install
          build_script: build
```

---

## 代码分割

### 1. 动态导入

#### 按需加载组件

```typescript
// ✅ 正确: 动态导入大型组件
export async function loadSearchModal(): Promise<typeof SearchModal> {
  const { SearchModal } = await import('./search/SearchModal');
  return SearchModal;
}

// 使用
button.addEventListener('click', async () => {
  const SearchModal = await loadSearchModal();
  const modal = new SearchModal();
  modal.open();
});
```

#### 条件加载

```typescript
// 只在需要时加载 polyfill
async function ensureIntersectionObserver(): Promise<void> {
  if (!('IntersectionObserver' in window)) {
    await import('intersection-observer');
  }
}

// 只在移动端加载触摸手势库
async function loadTouchGestures(): Promise<void> {
  if (window.matchMedia('(max-width: 768px)').matches) {
    await import('./gestures/touch');
  }
}
```

### 2. 路由级分割

#### Hugo 示例

```html
<!-- layouts/partials/scripts.html -->
{{ $core := resources.Get "js/core.ts" | js.Build }}
<script src="{{ $core.RelPermalink }}" defer></script>

<!-- 只在搜索页加载搜索功能 -->
{{ if .IsPage "search" }}
  {{ $search := resources.Get "js/search.ts" | js.Build }}
  <script src="{{ $search.RelPermalink }}" defer></script>
{{ end }}

<!-- 只在文章页加载评论功能 -->
{{ if .IsPage "post" }}
  {{ $comments := resources.Get "js/comments.ts" | js.Build }}
  <script src="{{ $comments.RelPermalink }}" defer></script>
{{ end }}
```

#### Astro 示例

```astro
---
// src/pages/search.astro
// 搜索页才加载搜索组件
import SearchModal from '@components/SearchModal.astro';
---

<Layout>
  <SearchModal />
  
  <!-- 动态导入搜索逻辑 -->
  <script>
    import('@ouraihub/core/search').then(({ SearchModal }) => {
      new SearchModal({ container: '#search-modal' });
    });
  </script>
</Layout>
```

### 3. Vendor 分离

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库单独打包
          vendor: ['dompurify', 'fuse.js'],
          
          // 核心功能
          core: ['./src/theme', './src/utils'],
          
          // 可选功能
          search: ['./src/search'],
          navigation: ['./src/navigation'],
        },
      },
    },
  },
});
```

---

## 懒加载策略

### 1. 图片懒加载

#### LazyLoader 类

```typescript
// packages/core/src/lazy/LazyLoader.ts
export class LazyLoader {
  private observer: IntersectionObserver;
  
  constructor(options: LazyLoaderOptions = {}) {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.01,
      }
    );
  }
  
  observe(element: HTMLElement): void {
    this.observer.observe(element);
  }
  
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target as HTMLElement);
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  private loadElement(element: HTMLElement): void {
    if (element instanceof HTMLImageElement) {
      const src = element.dataset.src;
      const srcset = element.dataset.srcset;
      
      if (src) element.src = src;
      if (srcset) element.srcset = srcset;
      
      element.classList.add('loaded');
    }
  }
}
```

#### 使用示例

```html
<!-- Hugo partial -->
<img
  data-src="{{ .Resize "800x" }}"
  data-srcset="{{ .Resize "400x" }} 400w, {{ .Resize "800x" }} 800w"
  alt="{{ .Title }}"
  class="lazy"
  loading="lazy"
>

<script type="module">
  import { LazyLoader } from '@ouraihub/core';
  
  const loader = new LazyLoader({ rootMargin: '100px' });
  document.querySelectorAll('img.lazy').forEach((img) => {
    loader.observe(img);
  });
</script>
```

### 2. 组件懒加载

```typescript
// 懒加载组件注册器
export class ComponentRegistry {
  private components = new Map<string, () => Promise<any>>();
  private observer: IntersectionObserver;
  
  register(name: string, loader: () => Promise<any>): void {
    this.components.set(name, loader);
  }
  
  async load(name: string): Promise<any> {
    const loader = this.components.get(name);
    if (!loader) throw new Error(`Component ${name} not registered`);
    return await loader();
  }
  
  observeElement(element: HTMLElement): void {
    const componentName = element.dataset.component;
    if (!componentName) return;
    
    this.observer.observe(element);
  }
  
  private async handleIntersection(entry: IntersectionObserverEntry): Promise<void> {
    if (!entry.isIntersecting) return;
    
    const element = entry.target as HTMLElement;
    const componentName = element.dataset.component!;
    
    try {
      const Component = await this.load(componentName);
      new Component({ container: element });
      this.observer.unobserve(element);
    } catch (error) {
      console.error(`Failed to load component ${componentName}`, error);
    }
  }
}

// 使用
const registry = new ComponentRegistry();

registry.register('search-modal', () => import('./search/SearchModal'));
registry.register('comments', () => import('./comments/Comments'));

document.querySelectorAll('[data-component]').forEach((el) => {
  registry.observeElement(el as HTMLElement);
});
```

### 3. 字体懒加载

```css
/* 使用 font-display: swap 避免 FOIT */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
}

/* 可选: 预加载关键字体 */
```

```html
<link
  rel="preload"
  href="/fonts/custom.woff2"
  as="font"
  type="font/woff2"
  crossorigin
>
```

---

## 缓存策略

### 1. HTTP 缓存

#### 静态资源缓存

```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location ~* \.(html)$ {
  expires 1h;
  add_header Cache-Control "public, must-revalidate";
}
```

#### 文件指纹

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 生成带 hash 的文件名
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
});
```

### 2. Service Worker 缓存

```typescript
// sw.ts
const CACHE_NAME = 'ouraihub-ui-v1';
const STATIC_ASSETS = [
  '/',
  '/styles/main.css',
  '/scripts/core.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 缓存优先策略
      return response || fetch(event.request);
    })
  );
});
```

### 3. 浏览器缓存

#### LocalStorage 缓存

```typescript
export class CacheManager {
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 小时
  
  set(key: string, value: any): void {
    const item = {
      value,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
  
  get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { value, timestamp } = JSON.parse(item);
    
    // 检查是否过期
    if (Date.now() - timestamp > this.TTL) {
      localStorage.removeItem(key);
      return null;
    }
    
    return value;
  }
}
```

#### IndexedDB 缓存

```typescript
// 用于大型数据（如搜索索引）
export class IndexedDBCache {
  private db: IDBDatabase | null = null;
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ouraihub-cache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('search-index', { keyPath: 'id' });
      };
    });
  }
  
  async set(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('DB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['search-index'], 'readwrite');
      const store = transaction.objectStore('search-index');
      const request = store.put({ id: key, data: value });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
```

---

## 性能监控

### 1. Web Vitals 监控

```typescript
// packages/core/src/performance/metrics.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export function initPerformanceMonitoring(): void {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

function sendToAnalytics(metric: Metric): void {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });
  
  // 使用 sendBeacon 确保数据发送
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body);
  } else {
    fetch('/api/analytics', { method: 'POST', body, keepalive: true });
  }
}
```

### 2. 自定义性能标记

```typescript
export class PerformanceTracker {
  mark(name: string): void {
    performance.mark(name);
  }
  
  measure(name: string, startMark: string, endMark?: string): void {
    performance.measure(name, startMark, endMark);
  }
  
  getMetrics(): PerformanceEntry[] {
    return performance.getEntriesByType('measure');
  }
  
  // 测量组件初始化时间
  trackComponentInit(componentName: string, fn: () => void): void {
    this.mark(`${componentName}-start`);
    fn();
    this.mark(`${componentName}-end`);
    this.measure(
      `${componentName}-init`,
      `${componentName}-start`,
      `${componentName}-end`
    );
  }
}

// 使用
const tracker = new PerformanceTracker();

tracker.trackComponentInit('ThemeManager', () => {
  new ThemeManager();
});

// 获取结果
const metrics = tracker.getMetrics();
console.log(metrics); // [{ name: 'ThemeManager-init', duration: 12.5 }]
```

### 3. 资源加载监控

```typescript
export function monitorResourceLoading(): void {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming;
        
        // 监控慢资源
        if (resource.duration > 1000) {
          console.warn('Slow resource:', {
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize,
          });
        }
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
}
```

### 4. 性能预算监控

```typescript
// performance-budget.config.ts
export const PERFORMANCE_BUDGET = {
  javascript: 150 * 1024,  // 150 KB
  css: 50 * 1024,          // 50 KB
  images: 500 * 1024,      // 500 KB
  fonts: 100 * 1024,       // 100 KB
};

export function checkPerformanceBudget(): void {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const usage = {
    javascript: 0,
    css: 0,
    images: 0,
    fonts: 0,
  };
  
  resources.forEach((resource) => {
    const size = resource.transferSize;
    
    if (resource.name.endsWith('.js')) {
      usage.javascript += size;
    } else if (resource.name.endsWith('.css')) {
      usage.css += size;
    } else if (/\.(png|jpg|jpeg|gif|svg|webp)$/.test(resource.name)) {
      usage.images += size;
    } else if (/\.(woff|woff2|ttf|otf)$/.test(resource.name)) {
      usage.fonts += size;
    }
  });
  
  // 检查是否超出预算
  Object.entries(usage).forEach(([type, size]) => {
    const budget = PERFORMANCE_BUDGET[type as keyof typeof PERFORMANCE_BUDGET];
    if (size > budget) {
      console.error(`Performance budget exceeded for ${type}: ${size} > ${budget}`);
    }
  });
}
```

---

## 优化检查清单

### 构建时优化

- [ ] **Tree-shaking**
  - [ ] 使用 ESM 导出
  - [ ] `package.json` 设置 `sideEffects: false`
  - [ ] 避免模块级副作用

- [ ] **代码压缩**
  - [ ] 启用 minify
  - [ ] 移除 console.log (生产环境)
  - [ ] 压缩标识符和属性名

- [ ] **依赖优化**
  - [ ] 使用 lodash-es 而非 lodash
  - [ ] 避免引入整个库
  - [ ] 检查重复依赖 (`pnpm dedupe`)

- [ ] **包体积监控**
  - [ ] 配置 size-limit
  - [ ] CI 中运行体积检查
  - [ ] 设置合理的体积预算

### 运行时优化

- [ ] **代码分割**
  - [ ] 路由级分割
  - [ ] 组件级分割
  - [ ] Vendor 分离

- [ ] **懒加载**
  - [ ] 图片懒加载
  - [ ] 组件懒加载
  - [ ] 字体懒加载

- [ ] **缓存策略**
  - [ ] HTTP 缓存头配置
  - [ ] 文件指纹 (hash)
  - [ ] Service Worker 缓存

### 监控和分析

- [ ] **性能监控**
  - [ ] Web Vitals 监控
  - [ ] 自定义性能标记
  - [ ] 资源加载监控

- [ ] **性能预算**
  - [ ] 设置预算阈值
  - [ ] CI 中检查预算
  - [ ] 超出预算时告警

---

## 相关文档

- [浏览器兼容性](../compatibility/browsers.md) - 兼容性策略
- [测试策略](../testing/README.md) - 性能测试
- [部署指南](../deployment/README.md) - 生产环境优化
- [API 参考](../api/README.md) - LazyLoader API

---

## 工具和资源

- [web-vitals](https://github.com/GoogleChrome/web-vitals) - Web Vitals 监控库
- [size-limit](https://github.com/ai/size-limit) - 包体积限制工具
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - 性能审计工具
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) - 包分析工具

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
