# 搜索模态框示例

全功能搜索模态框实现，支持键盘快捷键、防抖搜索、焦点管理等功能。

## 功能特性

- ✅ 键盘快捷键（Ctrl+K / Cmd+K）
- ✅ 防抖搜索
- ✅ 键盘导航（↑↓ 选择，Enter 确认）
- ✅ 焦点管理和焦点陷阱
- ✅ 滚动锁定
- ✅ 点击外部关闭
- ✅ ESC 键关闭

## 文件结构

```
search/
├── README.md           # 本文件
├── index.html          # 完整示例页面
├── search.js           # JavaScript 实现
└── search.css          # 样式文件
```

## 快速开始

### 1. HTML 结构

```html
<button data-search-trigger>
  搜索 <kbd>Ctrl+K</kbd>
</button>
```

搜索模态框会自动创建，无需手动添加 HTML。

### 2. JavaScript 初始化

```javascript
import { SearchModal } from '@ouraihub/core/search';

const search = new SearchModal({
  shortcuts: ['ctrl+k', 'cmd+k'],
  debounceDelay: 300,
  minSearchLength: 2,
  placeholder: '搜索文档...',
  onSearch: async (query) => {
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
    window.location.href = result.url;
  }
});

document.querySelector('[data-search-trigger]')?.addEventListener('click', () => {
  search.open();
});
```

### 3. CSS 样式

```css
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.search-modal__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.search-modal__content {
  position: relative;
  max-width: 600px;
  margin: 100px auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.search-modal__input {
  width: 100%;
  padding: 20px;
  font-size: 16px;
  border: none;
  outline: none;
  border-bottom: 1px solid #e0e0e0;
}

.search-modal__results {
  max-height: 400px;
  overflow-y: auto;
}

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
```

## 运行示例

1. 在浏览器中打开 `index.html`
2. 按 `Ctrl+K` 或 `Cmd+K` 打开搜索
3. 输入搜索关键词
4. 使用 `↑` `↓` 键选择结果
5. 按 `Enter` 确认选择
6. 按 `ESC` 关闭搜索

## 自定义配置

### 修改快捷键

```javascript
const search = new SearchModal({
  shortcuts: ['ctrl+k', 'cmd+k', '/'],
});
```

### 调整防抖延迟

```javascript
const search = new SearchModal({
  debounceDelay: 500,
});
```

### 修改最小搜索长度

```javascript
const search = new SearchModal({
  minSearchLength: 3,
});
```

### 自定义 CSS 类名

```javascript
const search = new SearchModal({
  modalClass: 'custom-search',
});
```

## 搜索实现示例

### 本地搜索

```javascript
const searchData = [
  { id: '1', title: '快速开始', url: '/docs/quick-start', type: 'doc' },
  { id: '2', title: 'API 参考', url: '/docs/api', type: 'doc' },
];

function localSearch(query) {
  const lowerQuery = query.toLowerCase();
  return searchData.filter(item => 
    item.title.toLowerCase().includes(lowerQuery)
  );
}

const search = new SearchModal({
  onSearch: (query) => localSearch(query)
});
```

### API 搜索

```javascript
async function apiSearch(query) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('搜索失败');
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('搜索错误:', error);
    return [];
  }
}

const search = new SearchModal({
  onSearch: apiSearch
});
```

### 使用 Fuse.js 模糊搜索

```javascript
import Fuse from 'fuse.js';

const documents = [
  { id: '1', title: '快速开始', content: '...', url: '/docs/quick-start' },
  { id: '2', title: 'API 参考', content: '...', url: '/docs/api' },
];

const fuse = new Fuse(documents, {
  keys: ['title', 'content'],
  threshold: 0.3
});

const search = new SearchModal({
  onSearch: (query) => {
    const results = fuse.search(query);
    return results.map(result => ({
      id: result.item.id,
      title: result.item.title,
      description: result.item.content.substring(0, 100) + '...',
      url: result.item.url,
      type: 'doc'
    }));
  }
});
```

## 常见问题

### Q: 如何添加搜索历史？

A: 使用 localStorage 保存搜索历史：

```javascript
const HISTORY_KEY = 'search-history';

function saveHistory(query) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  history.unshift(query);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

const search = new SearchModal({
  onSearch: async (query) => {
    saveHistory(query);
    return await apiSearch(query);
  }
});
```

### Q: 如何高亮搜索关键词？

A: 在结果渲染时高亮关键词：

```javascript
function highlightText(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
```

### Q: 如何添加搜索分类？

A: 在搜索结果中添加 `type` 字段，并在 CSS 中区分显示。

## 性能优化建议

1. **防抖延迟**: API 搜索使用 300-500ms，本地搜索使用 100-200ms
2. **结果限制**: 限制返回结果数量（如 20 条）
3. **缓存结果**: 缓存最近的搜索结果
4. **懒加载**: 结果列表使用虚拟滚动
5. **取消请求**: 新搜索时取消之前的请求

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 相关文档

- [SearchModal API](../../../docs/api/SearchModal.md)
- [完整设计方案](../../../docs/DESIGN.md)
