# 懒加载示例

图片和内容懒加载实现，使用 IntersectionObserver API 提升页面加载性能。

## 功能特性

- ✅ 图片懒加载
- ✅ 背景图懒加载
- ✅ 响应式图片支持
- ✅ 淡入动画
- ✅ 加载失败重试
- ✅ 占位符显示

## 文件结构

```
lazy-loading/
├── README.md           # 本文件
├── index.html          # 完整示例页面
├── lazy-loading.js     # JavaScript 实现
└── lazy-loading.css    # 样式文件
```

## 快速开始

### 1. HTML 结构

```html
<!-- 图片懒加载 -->
<img data-src="image.jpg" 
     alt="描述"
     class="lazy-image">

<!-- 响应式图片 -->
<img data-src="image.jpg"
     data-srcset="image-320w.jpg 320w,
                  image-640w.jpg 640w,
                  image-1280w.jpg 1280w"
     sizes="(max-width: 320px) 280px,
            (max-width: 640px) 600px,
            1200px"
     alt="响应式图片"
     class="lazy-image">

<!-- 背景图懒加载 -->
<div data-bg="background.jpg" 
     class="lazy-bg hero">
  <h1>英雄区域</h1>
</div>

<!-- Picture 元素 -->
<picture>
  <source data-srcset="image.webp" type="image/webp">
  <source data-srcset="image.jpg" type="image/jpeg">
  <img data-src="image.jpg" alt="图片">
</picture>
```

### 2. JavaScript 初始化

```javascript
import { LazyLoader } from '@ouraihub/core/lazyload';

const loader = new LazyLoader({
  rootMargin: '50px',
  threshold: 0.1,
  fadeInDuration: 300,
  retryCount: 2,
  retryDelay: 1000,
  onEnter: (element) => {
    console.log('元素进入视口:', element);
  },
  onLoad: (element) => {
    console.log('加载成功:', element);
  },
  onError: (element, error) => {
    console.error('加载失败:', element, error);
  }
});

loader.observeAll('img[data-src]');
loader.observeAll('[data-bg]');
loader.observeAll('picture');
```

### 3. CSS 样式

```css
.lazy-placeholder {
  background: #f0f0f0;
  min-height: 200px;
}

.lazy-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.lazy-loaded {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lazy-error {
  background: #fee;
  border: 2px dashed #f00;
}
```

## 运行示例

1. 在浏览器中打开 `index.html`
2. 向下滚动页面查看图片懒加载效果
3. 打开浏览器控制台查看加载日志
4. 打开网络面板查看图片加载时机

## 自定义配置

### 提前加载距离

```javascript
const loader = new LazyLoader({
  rootMargin: '100px',
});
```

### 禁用淡入动画

```javascript
const loader = new LazyLoader({
  fadeInDuration: 0,
});
```

### 自定义 CSS 类名

```javascript
const loader = new LazyLoader({
  placeholderClass: 'img-placeholder',
  loadingClass: 'img-loading',
  loadedClass: 'img-loaded',
  errorClass: 'img-error'
});
```

### 增加重试次数

```javascript
const loader = new LazyLoader({
  retryCount: 3,
  retryDelay: 2000,
});
```

## 常见问题

### Q: 如何为图片设置固定高度避免布局抖动？

A: 使用 CSS aspect-ratio 或设置固定高度：

```css
.lazy-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

### Q: 如何添加降级方案？

A: 使用 `data-fallback` 属性：

```html
<img data-src="image.jpg"
     data-fallback="placeholder.jpg"
     alt="图片">
```

```javascript
const loader = new LazyLoader({
  onError: (element, error) => {
    const fallback = element.getAttribute('data-fallback');
    if (fallback && element.tagName === 'IMG') {
      element.src = fallback;
    }
  }
});
```

### Q: 如何在 SSR 环境中使用？

A: 在服务端渲染时使用 `<noscript>` 标签提供降级方案：

```html
<img data-src="image.jpg" alt="图片">
<noscript>
  <img src="image.jpg" alt="图片">
</noscript>
```

## 性能优化建议

1. **使用 WebP 格式**: 减少图片体积
2. **响应式图片**: 根据设备加载合适尺寸
3. **提前加载**: 使用 `rootMargin` 提前加载即将进入视口的图片
4. **占位符**: 使用低质量占位符或 SVG 占位符
5. **懒加载阈值**: 根据实际情况调整 `threshold`

## 浏览器兼容性

- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 79+

不支持的浏览器会立即加载所有图片（优雅降级）。

## 相关文档

- [LazyLoader API](../../../docs/api/LazyLoader.md)
- [完整设计方案](../../../docs/DESIGN.md)
