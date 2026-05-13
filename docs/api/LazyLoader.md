# LazyLoader API

> **包**: `@ouraihub/core`  
> **版本**: 1.4.0  
> **最后更新**: 2026-05-13

图片和内容懒加载控制器，使用 IntersectionObserver API 实现高性能懒加载，支持图片、背景图、picture 元素和自定义内容。

---

## 导入

```typescript
import { LazyLoader } from '@ouraihub/core/lazyload';
```

---

## 构造函数

```typescript
constructor(options?: LazyLoadOptions)
```

创建 LazyLoader 实例。

### 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `options` | `LazyLoadOptions` | 否 | `{}` | 配置选项 |

### LazyLoadOptions

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `root` | `Element \| null` | 否 | `null` | IntersectionObserver 的根元素 |
| `rootMargin` | `string` | 否 | `'0px'` | 根元素的外边距 |
| `threshold` | `number` | 否 | `0` | 触发加载的可见比例（0-1） |
| `placeholderClass` | `string` | 否 | `'lazy-placeholder'` | 占位符 CSS 类名 |
| `loadingClass` | `string` | 否 | `'lazy-loading'` | 加载中 CSS 类名 |
| `loadedClass` | `string` | 否 | `'lazy-loaded'` | 加载完成 CSS 类名 |
| `errorClass` | `string` | 否 | `'lazy-error'` | 加载失败 CSS 类名 |
| `retryCount` | `number` | 否 | `2` | 失败重试次数 |
| `retryDelay` | `number` | 否 | `1000` | 重试延迟（毫秒） |
| `fadeInDuration` | `number` | 否 | `300` | 淡入动画时长（毫秒） |
| `onEnter` | `(element: HTMLElement) => void` | 否 | - | 元素进入视口时的回调 |
| `onLoad` | `(element: HTMLElement) => void` | 否 | - | 加载成功时的回调 |
| `onError` | `(element: HTMLElement, error: Error) => void` | 否 | - | 加载失败时的回调 |

### 示例

```typescript
// 使用默认配置
const loader = new LazyLoader();

// 自定义配置
const loader = new LazyLoader({
  rootMargin: '50px',
  threshold: 0.1,
  placeholderClass: 'placeholder',
  loadingClass: 'loading',
  loadedClass: 'loaded',
  errorClass: 'error',
  retryCount: 3,
  retryDelay: 2000,
  fadeInDuration: 500,
  onEnter: (el) => console.log('进入视口:', el),
  onLoad: (el) => console.log('加载成功:', el),
  onError: (el, err) => console.error('加载失败:', el, err)
});
```

---

## 方法

### observe()

```typescript
observe(element: HTMLElement | string): void
```

观察单个元素，当元素进入视口时自动加载。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `element` | `HTMLElement \| string` | 是 | 要观察的元素或 CSS 选择器 |

#### 示例

```typescript
// 使用元素
const img = document.querySelector('img[data-src]');
loader.observe(img);

// 使用选择器
loader.observe('img[data-src]');
```

---

### observeAll()

```typescript
observeAll(selector: string): void
```

观察所有匹配选择器的元素。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `selector` | `string` | 是 | CSS 选择器 |

#### 示例

```typescript
// 观察所有懒加载图片
loader.observeAll('img[data-src]');

// 观察所有懒加载背景
loader.observeAll('[data-bg]');

// 观察所有懒加载内容
loader.observeAll('[data-content]');
```

---

### unobserve()

```typescript
unobserve(element: HTMLElement): void
```

停止观察指定元素。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `element` | `HTMLElement` | 是 | 要停止观察的元素 |

#### 示例

```typescript
const img = document.querySelector('img[data-src]');
loader.unobserve(img);
```

---

### disconnect()

```typescript
disconnect(): void
```

断开所有观察，清理资源。

#### 示例

```typescript
loader.disconnect();
```

---

### getState()

```typescript
getState(element: HTMLElement): LazyLoadState | undefined
```

获取元素的加载状态。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `element` | `HTMLElement` | 是 | 要查询的元素 |

#### 返回值

| 类型 | 描述 |
|------|------|
| `LazyLoadState \| undefined` | 元素的加载状态，如果元素未被观察则返回 `undefined` |

#### LazyLoadState

```typescript
interface LazyLoadState {
  status: LoadStatus;    // 加载状态
  retries: number;       // 已重试次数
  error?: Error;         // 错误信息（如果失败）
}

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';
```

#### 示例

```typescript
const img = document.querySelector('img[data-src]');
const state = loader.getState(img);

if (state) {
  console.log('状态:', state.status);
  console.log('重试次数:', state.retries);
  if (state.error) {
    console.error('错误:', state.error);
  }
}
```

---

## 支持的元素类型

### 1. 图片元素 (`<img>`)

使用 `data-src` 和 `data-srcset` 属性：

```html
<img data-src="image.jpg" 
     data-srcset="image-320w.jpg 320w, image-640w.jpg 640w"
     alt="描述">
```

### 2. Picture 元素 (`<picture>`)

使用 `data-srcset` 属性：

```html
<picture>
  <source data-srcset="image.webp" type="image/webp">
  <source data-srcset="image.jpg" type="image/jpeg">
  <img data-src="image.jpg" alt="描述">
</picture>
```

### 3. 背景图片

使用 `data-bg` 属性：

```html
<div data-bg="background.jpg" class="hero"></div>
```

### 4. 自定义内容

使用 `data-content` 属性：

```html
<div data-content="<p>延迟加载的内容</p>"></div>
```

---

## 完整示例

### 基础用法

```typescript
import { LazyLoader } from '@ouraihub/core/lazyload';

// 创建实例
const loader = new LazyLoader({
  rootMargin: '50px',
  threshold: 0.1,
  fadeInDuration: 300
});

// 观察所有懒加载图片
loader.observeAll('img[data-src]');

// 观察所有懒加载背景
loader.observeAll('[data-bg]');
```

### 高级用法：完整配置

```typescript
import { LazyLoader } from '@ouraihub/core/lazyload';

// 创建实例
const loader = new LazyLoader({
  // IntersectionObserver 配置
  root: null,
  rootMargin: '100px',
  threshold: 0.1,
  
  // CSS 类名
  placeholderClass: 'img-placeholder',
  loadingClass: 'img-loading',
  loadedClass: 'img-loaded',
  errorClass: 'img-error',
  
  // 重试配置
  retryCount: 3,
  retryDelay: 2000,
  
  // 动画配置
  fadeInDuration: 500,
  
  // 事件回调
  onEnter: (element) => {
    console.log('元素进入视口:', element);
    
    // 添加加载动画
    element.classList.add('entering');
  },
  
  onLoad: (element) => {
    console.log('加载成功:', element);
    
    // 移除占位符
    element.classList.remove('entering');
    
    // 记录性能指标
    const src = element.getAttribute('src');
    console.log(`图片加载完成: ${src}`);
  },
  
  onError: (element, error) => {
    console.error('加载失败:', element, error);
    
    // 显示错误提示
    const fallback = element.getAttribute('data-fallback');
    if (fallback && element.tagName === 'IMG') {
      (element as HTMLImageElement).src = fallback;
    }
  }
});

// 观察所有懒加载元素
loader.observeAll('img[data-src]');
loader.observeAll('picture');
loader.observeAll('[data-bg]');

// 动态添加元素
const newImg = document.createElement('img');
newImg.setAttribute('data-src', 'new-image.jpg');
document.body.appendChild(newImg);
loader.observe(newImg);

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  loader.disconnect();
});
```

### 响应式图片

```html
<!-- 使用 srcset -->
<img data-src="image.jpg"
     data-srcset="image-320w.jpg 320w,
                  image-640w.jpg 640w,
                  image-1280w.jpg 1280w"
     sizes="(max-width: 320px) 280px,
            (max-width: 640px) 600px,
            1200px"
     alt="响应式图片">

<!-- 使用 picture -->
<picture>
  <source data-srcset="image-large.webp" 
          media="(min-width: 1024px)" 
          type="image/webp">
  <source data-srcset="image-medium.webp" 
          media="(min-width: 640px)" 
          type="image/webp">
  <source data-srcset="image-small.webp" 
          type="image/webp">
  <img data-src="image.jpg" alt="响应式图片">
</picture>
```

```typescript
// 观察所有响应式图片
loader.observeAll('img[data-srcset]');
loader.observeAll('picture');
```

### 背景图片懒加载

```html
<div class="hero" 
     data-bg="hero-bg.jpg"
     style="height: 400px;">
  <h1>英雄区域</h1>
</div>
```

```typescript
loader.observeAll('[data-bg]');
```

### 带降级方案的懒加载

```html
<img data-src="image.jpg"
     data-fallback="placeholder.jpg"
     alt="图片">
```

```typescript
const loader = new LazyLoader({
  onError: (element, error) => {
    const fallback = element.getAttribute('data-fallback');
    if (fallback && element.tagName === 'IMG') {
      (element as HTMLImageElement).src = fallback;
      element.classList.add('fallback-loaded');
    }
  }
});

loader.observeAll('img[data-src]');
```

---

## CSS 集成

### 基础样式

```css
/* 占位符 */
.lazy-placeholder {
  background: #f0f0f0;
  min-height: 200px;
}

/* 加载中 */
.lazy-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 加载完成 */
.lazy-loaded {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 加载失败 */
.lazy-error {
  background: #fee;
  border: 2px dashed #f00;
}

.lazy-error::after {
  content: '加载失败';
  display: block;
  text-align: center;
  color: #f00;
  padding: 20px;
}
```

### 使用 Tailwind CSS

```html
<img data-src="image.jpg"
     class="lazy-placeholder 
            data-[loading]:animate-pulse
            data-[loaded]:animate-fade-in
            data-[error]:border-2 data-[error]:border-red-500"
     alt="图片">
```

```typescript
const loader = new LazyLoader({
  placeholderClass: 'bg-gray-200 min-h-[200px]',
  loadingClass: 'animate-pulse',
  loadedClass: 'animate-fade-in',
  errorClass: 'border-2 border-red-500'
});
```

---

## 内部机制

### IntersectionObserver

LazyLoader 使用 IntersectionObserver API 监听元素可见性：

```typescript
new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // 元素进入视口，开始加载
      this.load(entry.target);
    }
  });
}, {
  root: null,           // 视口
  rootMargin: '50px',   // 提前 50px 开始加载
  threshold: 0.1        // 10% 可见时触发
});
```

### 加载流程

1. **观察元素**: 调用 `observe()` 或 `observeAll()`
2. **进入视口**: IntersectionObserver 检测到元素可见
3. **触发回调**: 调用 `onEnter` 回调
4. **开始加载**: 根据元素类型加载资源
5. **加载成功**: 调用 `onLoad` 回调，添加 `loadedClass`
6. **加载失败**: 重试或调用 `onError` 回调，添加 `errorClass`
7. **停止观察**: 加载完成后自动停止观察

### 重试机制

加载失败时自动重试：

```typescript
if (state.retries < this.options.retryCount) {
  state.retries++;
  await this.delay(this.options.retryDelay);
  this.load(element);
}
```

### 淡入动画

加载完成后自动添加淡入效果：

```typescript
if (this.options.fadeInDuration > 0) {
  element.style.transition = `opacity ${this.options.fadeInDuration}ms`;
  element.style.opacity = '0';
  requestAnimationFrame(() => {
    element.style.opacity = '1';
  });
}
```

---

## 注意事项

### 浏览器兼容性

- **IntersectionObserver**: Chrome 51+, Firefox 55+, Safari 12.1+
- 对于不支持的浏览器，LazyLoader 会立即加载所有元素（优雅降级）

### 性能考虑

- IntersectionObserver 使用浏览器原生 API，性能优异
- 使用 `rootMargin` 提前加载，避免用户看到加载过程
- 使用 `threshold` 控制触发时机，平衡性能和用户体验
- 自动停止观察已加载的元素，减少内存占用

### 最佳实践

1. **提前加载**: 使用 `rootMargin: '50px'` 提前加载即将进入视口的图片
2. **占位符**: 为图片设置固定高度或使用 aspect-ratio，避免布局抖动
3. **降级方案**: 提供 `data-fallback` 属性作为加载失败时的备用图片
4. **响应式图片**: 使用 `srcset` 和 `sizes` 属性优化不同设备的加载
5. **清理资源**: 页面卸载时调用 `disconnect()` 方法

```typescript
// ✅ 好的做法
const loader = new LazyLoader({
  rootMargin: '50px',
  threshold: 0.1,
  retryCount: 2
});

loader.observeAll('img[data-src]');

window.addEventListener('beforeunload', () => {
  loader.disconnect();
});

// ❌ 不好的做法
// 没有占位符，导致布局抖动
<img data-src="image.jpg" alt="图片">

// 没有清理资源
const loader = new LazyLoader();
loader.observeAll('img[data-src]');
// 忘记调用 disconnect()
```

---

## 相关文档

- [API 参考索引](./README.md)
- [NavigationController API](./NavigationController.md)
- [SearchModal API](./SearchModal.md)
- [类型定义](./types.md)
- [完整设计方案](../DESIGN.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
