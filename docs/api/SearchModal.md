# SearchModal API

> **包**: `@ouraihub/core`  
> **版本**: 1.4.0  
> **最后更新**: 2026-05-13

搜索模态框管理器，提供完整的搜索功能，包括键盘快捷键、防抖搜索、焦点管理、滚动锁定等。

---

## 导入

```typescript
import { SearchModal } from '@ouraihub/core/search';
import type { SearchResult, SearchModalOptions } from '@ouraihub/core/search';
```

---

## 构造函数

```typescript
constructor(options?: SearchModalOptions)
```

创建 SearchModal 实例。

### 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `options` | `SearchModalOptions` | 否 | `{}` | 配置选项 |

### SearchModalOptions

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `container` | `HTMLElement` | 否 | `document.body` | 模态框容器元素 |
| `shortcuts` | `string[]` | 否 | `['ctrl+k', 'cmd+k']` | 键盘快捷键 |
| `debounceDelay` | `number` | 否 | `300` | 搜索防抖延迟（毫秒） |
| `minSearchLength` | `number` | 否 | `2` | 最小搜索字符数 |
| `modalClass` | `string` | 否 | `'search-modal'` | 模态框 CSS 类名 |
| `placeholder` | `string` | 否 | `'搜索...'` | 输入框占位符文本 |
| `onOpen` | `() => void` | 否 | - | 打开时的回调 |
| `onClose` | `() => void` | 否 | - | 关闭时的回调 |
| `onSearch` | `(query: string) => Promise<SearchResult[]> \| SearchResult[]` | 否 | - | 搜索回调（返回搜索结果） |
| `onSelect` | `(result: SearchResult) => void` | 否 | - | 选择结果时的回调 |

### SearchResult

```typescript
interface SearchResult {
  id: string;                          // 结果唯一标识
  title: string;                       // 结果标题
  description?: string;                // 结果描述
  url: string;                         // 结果 URL
  type?: string;                       // 结果类型（如：page, post, doc）
  metadata?: Record<string, unknown>;  // 额外元数据
}
```

### 示例

```typescript
// 使用默认配置
const search = new SearchModal({
  onSearch: async (query) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  onSelect: (result) => {
    window.location.href = result.url;
  }
});

// 自定义配置
const search = new SearchModal({
  container: document.querySelector('#app'),
  shortcuts: ['ctrl+k', 'cmd+k', '/'],
  debounceDelay: 500,
  minSearchLength: 3,
  modalClass: 'custom-search',
  placeholder: '搜索文档...',
  onOpen: () => console.log('搜索打开'),
  onClose: () => console.log('搜索关闭'),
  onSearch: async (query) => {
    return await fetchResults(query);
  },
  onSelect: (result) => {
    console.log('选择:', result);
    window.location.href = result.url;
  }
});
```

---

## 方法

### open()

```typescript
open(): void
```

打开搜索模态框，锁定页面滚动，聚焦输入框。

#### 示例

```typescript
search.open();
```

---

### close()

```typescript
close(): void
```

关闭搜索模态框，解锁页面滚动，清空搜索状态，恢复之前的焦点。

#### 示例

```typescript
search.close();
```

---

### toggle()

```typescript
toggle(): void
```

切换搜索模态框状态（打开/关闭）。

#### 示例

```typescript
// 绑定到搜索按钮
document.querySelector('[data-search-toggle]')?.addEventListener('click', () => {
  search.toggle();
});
```

---

### getState()

```typescript
getState(): Readonly<SearchModalState>
```

获取当前搜索状态的只读副本。

#### 返回值

| 类型 | 描述 |
|------|------|
| `Readonly<SearchModalState>` | 当前搜索状态 |

#### SearchModalState

```typescript
interface SearchModalState {
  isOpen: boolean;         // 是否打开
  query: string;           // 当前搜索查询
  results: SearchResult[]; // 搜索结果
  selectedIndex: number;   // 当前选中的结果索引
  isSearching: boolean;    // 是否正在搜索
}
```

#### 示例

```typescript
const state = search.getState();
console.log('模态框状态:', state.isOpen ? '打开' : '关闭');
console.log('搜索查询:', state.query);
console.log('结果数量:', state.results.length);
console.log('选中索引:', state.selectedIndex);
```

---

### destroy()

```typescript
destroy(): void
```

销毁实例，清理所有事件监听器，移除 DOM 元素。

#### 示例

```typescript
search.destroy();
```

---

## 键盘快捷键

### 全局快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+K` / `Cmd+K` | 打开/关闭搜索模态框 |
| `Esc` | 关闭搜索模态框 |

### 模态框内快捷键

| 快捷键 | 功能 |
|--------|------|
| `↓` | 选择下一个结果 |
| `↑` | 选择上一个结果 |
| `Enter` | 确认选择当前结果 |
| `Tab` / `Shift+Tab` | 焦点循环（焦点陷阱） |

---

## 完整示例

### 基础用法

```typescript
import { SearchModal } from '@ouraihub/core/search';

// 创建实例
const search = new SearchModal({
  onSearch: async (query) => {
    // 调用搜索 API
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    return data.results.map(item => ({
      id: item.id,
      title: item.title,
      description: item.excerpt,
      url: item.url,
      type: item.type
    }));
  },
  onSelect: (result) => {
    // 跳转到选中的结果
    window.location.href = result.url;
  }
});

// 绑定搜索按钮
document.querySelector('[data-search-button]')?.addEventListener('click', () => {
  search.open();
});
```

### 高级用法：完整搜索系统

```typescript
import { SearchModal } from '@ouraihub/core/search';
import type { SearchResult } from '@ouraihub/core/search';

// 搜索 API 封装
async function searchContent(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('搜索失败');
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.excerpt || item.description,
      url: item.url,
      type: item.category || 'page',
      metadata: {
        date: item.date,
        author: item.author,
        tags: item.tags
      }
    }));
  } catch (error) {
    console.error('搜索错误:', error);
    return [];
  }
}

// 创建搜索实例
const search = new SearchModal({
  container: document.body,
  shortcuts: ['ctrl+k', 'cmd+k', '/'],
  debounceDelay: 300,
  minSearchLength: 2,
  modalClass: 'site-search',
  placeholder: '搜索文档、文章、教程...',
  
  onOpen: () => {
    console.log('搜索模态框已打开');
    
    // 记录分析事件
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search_open');
    }
  },
  
  onClose: () => {
    console.log('搜索模态框已关闭');
  },
  
  onSearch: async (query) => {
    console.log('搜索查询:', query);
    
    // 记录搜索查询
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', { search_term: query });
    }
    
    return await searchContent(query);
  },
  
  onSelect: (result) => {
    console.log('选择结果:', result);
    
    // 记录选择事件
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search_select', {
        result_id: result.id,
        result_title: result.title,
        result_type: result.type
      });
    }
    
    // 跳转到结果页面
    window.location.href = result.url;
  }
});

// 绑定搜索按钮
document.querySelectorAll('[data-search-trigger]').forEach(button => {
  button.addEventListener('click', () => {
    search.open();
  });
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  search.destroy();
});
```

### 本地搜索（无需 API）

```typescript
import { SearchModal } from '@ouraihub/core/search';
import type { SearchResult } from '@ouraihub/core/search';

// 本地搜索数据
const searchData: SearchResult[] = [
  {
    id: '1',
    title: '快速开始',
    description: '了解如何快速开始使用组件库',
    url: '/docs/quick-start',
    type: 'doc'
  },
  {
    id: '2',
    title: 'API 参考',
    description: '完整的 API 文档和使用示例',
    url: '/docs/api',
    type: 'doc'
  },
  // 更多数据...
];

// 本地搜索函数
function localSearch(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  
  return searchData.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(lowerQuery);
    const descMatch = item.description?.toLowerCase().includes(lowerQuery);
    return titleMatch || descMatch;
  });
}

// 创建搜索实例
const search = new SearchModal({
  debounceDelay: 100, // 本地搜索可以更快
  onSearch: (query) => {
    return localSearch(query);
  },
  onSelect: (result) => {
    window.location.href = result.url;
  }
});
```

### 使用 Fuse.js 模糊搜索

```typescript
import { SearchModal } from '@ouraihub/core/search';
import type { SearchResult } from '@ouraihub/core/search';
import Fuse from 'fuse.js';

// 搜索数据
const documents = [
  { id: '1', title: '快速开始', content: '...', url: '/docs/quick-start' },
  { id: '2', title: 'API 参考', content: '...', url: '/docs/api' },
  // 更多文档...
];

// 配置 Fuse.js
const fuse = new Fuse(documents, {
  keys: ['title', 'content'],
  threshold: 0.3,
  includeScore: true
});

// 创建搜索实例
const search = new SearchModal({
  onSearch: (query) => {
    const results = fuse.search(query);
    
    return results.map(result => ({
      id: result.item.id,
      title: result.item.title,
      description: result.item.content.substring(0, 100) + '...',
      url: result.item.url,
      type: 'doc',
      metadata: {
        score: result.score
      }
    }));
  },
  onSelect: (result) => {
    window.location.href = result.url;
  }
});
```

---

## HTML 结构

SearchModal 自动生成以下 HTML 结构：

```html
<div class="search-modal" role="dialog" aria-modal="true" aria-label="搜索">
  <!-- 遮罩层 -->
  <div class="search-modal__overlay" aria-hidden="true"></div>
  
  <!-- 内容区 -->
  <div class="search-modal__content">
    <!-- 输入框 -->
    <div class="search-modal__input-wrapper">
      <input
        type="text"
        class="search-modal__input"
        placeholder="搜索..."
        aria-label="搜索输入"
        autocomplete="off"
      />
    </div>
    
    <!-- 结果列表 -->
    <div class="search-modal__results" role="listbox" aria-label="搜索结果">
      <!-- 加载中 -->
      <div class="search-modal__loading">搜索中...</div>
      
      <!-- 空结果 -->
      <div class="search-modal__empty">未找到结果</div>
      
      <!-- 结果项 -->
      <div class="search-modal__result search-modal__result--selected"
           role="option"
           aria-selected="true"
           data-index="0"
           data-id="1">
        <div class="search-modal__result-title">标题</div>
        <div class="search-modal__result-description">描述</div>
        <div class="search-modal__result-type">类型</div>
      </div>
    </div>
  </div>
</div>
```

---

## CSS 集成

### 基础样式

```css
/* 模态框容器 */
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

/* 遮罩层 */
.search-modal__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* 内容区 */
.search-modal__content {
  position: relative;
  max-width: 600px;
  margin: 100px auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* 输入框 */
.search-modal__input-wrapper {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.search-modal__input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: none;
  outline: none;
}

/* 结果列表 */
.search-modal__results {
  max-height: 400px;
  overflow-y: auto;
}

/* 结果项 */
.search-modal__result {
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.search-modal__result:hover,
.search-modal__result--selected {
  background: #f5f5f5;
}

.search-modal__result-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.search-modal__result-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.search-modal__result-type {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
}

/* 加载中 / 空结果 */
.search-modal__loading,
.search-modal__empty {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

/* 暗色主题 */
[data-theme="dark"] .search-modal__content {
  background: #1a1a1a;
  color: #fff;
}

[data-theme="dark"] .search-modal__input {
  background: #2a2a2a;
  color: #fff;
}

[data-theme="dark"] .search-modal__result:hover,
[data-theme="dark"] .search-modal__result--selected {
  background: #2a2a2a;
}
```

### 使用 Tailwind CSS

```typescript
const search = new SearchModal({
  modalClass: 'search-modal',
  // 使用 Tailwind 类名需要在 CSS 中定义
});
```

```css
/* 使用 Tailwind 的自定义样式 */
.search-modal {
  @apply fixed inset-0 z-50;
}

.search-modal__overlay {
  @apply absolute inset-0 bg-black/50 backdrop-blur-sm;
}

.search-modal__content {
  @apply relative max-w-2xl mx-auto mt-24 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden;
}

.search-modal__input-wrapper {
  @apply p-5 border-b border-gray-200 dark:border-gray-700;
}

.search-modal__input {
  @apply w-full px-3 py-2 text-base border-none outline-none bg-transparent;
}

.search-modal__results {
  @apply max-h-96 overflow-y-auto;
}

.search-modal__result {
  @apply px-5 py-4 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800;
}

.search-modal__result--selected {
  @apply bg-gray-50 dark:bg-gray-800;
}

.search-modal__result-title {
  @apply font-semibold mb-1;
}

.search-modal__result-description {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-1;
}

.search-modal__result-type {
  @apply text-xs text-gray-500 uppercase;
}
```

---

## 内部机制

### 防抖搜索

用户输入时使用防抖机制，避免频繁调用搜索 API：

```typescript
// 清除之前的计时器
if (this.debounceTimer !== null) {
  window.clearTimeout(this.debounceTimer);
}

// 设置新的计时器
this.debounceTimer = window.setTimeout(() => {
  this.performSearch(query);
}, this.debounceDelay);
```

### 焦点管理

打开模态框时自动聚焦输入框，关闭时恢复之前的焦点：

```typescript
// 打开时
this.previousActiveElement = document.activeElement;
this.inputElement?.focus();

// 关闭时
if (this.previousActiveElement instanceof HTMLElement) {
  this.previousActiveElement.focus();
}
```

### 焦点陷阱

使用 Tab 键循环焦点，防止焦点跳出模态框：

```typescript
const firstElement = this.focusableElements[0];
const lastElement = this.focusableElements[this.focusableElements.length - 1];

if (event.shiftKey) {
  // Shift + Tab: 从第一个跳到最后一个
  if (document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }
} else {
  // Tab: 从最后一个跳到第一个
  if (document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}
```

### 滚动锁定

打开模态框时锁定页面滚动，避免滚动条抖动：

```typescript
// 计算滚动条宽度
const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

// 锁定滚动
document.body.style.overflow = 'hidden';
document.body.style.paddingRight = `${scrollbarWidth}px`;
```

---

## 注意事项

### 浏览器兼容性

- **所有现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 使用标准 DOM API，无需 polyfill

### 性能考虑

- 使用防抖机制减少搜索请求
- 自动清理事件监听器，防止内存泄漏
- 使用 `escapeHtml` 防止 XSS 攻击
- 结果列表使用虚拟滚动（如果结果很多，建议分页）

### 最佳实践

1. **防抖延迟**: API 搜索使用 300-500ms，本地搜索使用 100-200ms
2. **最小字符数**: 设置 `minSearchLength` 避免无意义的搜索
3. **错误处理**: 在 `onSearch` 中捕获错误，返回空数组
4. **加载状态**: 搜索时显示加载提示，提升用户体验
5. **键盘导航**: 支持完整的键盘操作，提升可访问性

```typescript
// ✅ 好的做法
const search = new SearchModal({
  debounceDelay: 300,
  minSearchLength: 2,
  onSearch: async (query) => {
    try {
      return await fetchResults(query);
    } catch (error) {
      console.error('搜索失败:', error);
      return [];
    }
  }
});

window.addEventListener('beforeunload', () => {
  search.destroy();
});

// ❌ 不好的做法
// 没有防抖，频繁请求
const search = new SearchModal({
  debounceDelay: 0,
  onSearch: async (query) => {
    return await fetchResults(query);
  }
});

// 忘记清理
// 可能导致内存泄漏
```

---

## 相关文档

- [API 参考索引](./README.md)
- [NavigationController API](./NavigationController.md)
- [LazyLoader API](./LazyLoader.md)
- [类型定义](./types.md)
- [完整设计方案](../DESIGN.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
