# @ouraihub/preset-docs

文档站点预设配置，提供开箱即用的文档站点解决方案。

## 特性

- ✨ **优化可读性** - 更大的字体、更宽松的行高，专为长文档阅读优化
- 🎨 **专业配色** - 适合技术文档的配色方案，支持亮色/暗色主题
- 📦 **完整组件** - 侧边栏、目录、代码块、警告框、面包屑等文档专用组件
- 📐 **响应式布局** - 适配桌面、平板、移动端的布局配置
- 🔍 **搜索优化** - 内置搜索页面布局和样式
- 📚 **API 参考** - 专门的 API 文档页面布局

## 安装

```bash
pnpm add @ouraihub/preset-docs
```

## 使用

### 基础使用

```typescript
import { docsPreset } from '@ouraihub/preset-docs';

const config = {
  presets: [docsPreset],
};
```

### 使用特定布局

```typescript
import { 
  docsLayout,           // 标准文档页布局
  apiReferenceLayout,   // API 参考页布局
  searchLayout,         // 搜索页布局
  fullWidthLayout       // 全宽布局（首页等）
} from '@ouraihub/preset-docs/layouts';

// 在你的页面中使用
const pageConfig = {
  layout: docsLayout,
};
```

### 自定义设计令牌

```typescript
import { docsPreset } from '@ouraihub/preset-docs';
import type { Preset } from '@ouraihub/core/preset';

const customPreset: Preset = {
  ...docsPreset,
  tokens: {
    ...docsPreset.tokens,
    colors: {
      ...docsPreset.tokens?.colors,
      primary: {
        base: 'hsl(200, 100%, 50%)',  // 自定义主色
      },
    },
  },
};
```

### 自定义组件配置

```typescript
import { docsPreset, docsComponents } from '@ouraihub/preset-docs';
import type { Preset } from '@ouraihub/core/preset';

const customPreset: Preset = {
  ...docsPreset,
  components: docsComponents.map(component => {
    if (component.name === 'Sidebar') {
      return {
        ...component,
        defaults: {
          ...component.defaults,
          width: '20rem',  // 更宽的侧边栏
        },
      };
    }
    return component;
  }),
};
```

## 包含的组件

### Sidebar（侧边栏）
- 可折叠导航
- 固定定位支持
- 响应式隐藏

### TableOfContents（目录）
- 自动生成目录
- 可配置深度
- 固定定位支持

### CodeBlock（代码块）
- 语法高亮
- 行号显示
- 复制按钮
- 行高亮

### Callout（警告框）
- 多种类型：note、tip、warning、danger
- 可选图标
- 可折叠

### Breadcrumb（面包屑）
- 自动路径生成
- 可配置分隔符
- 最大项数限制

### SearchModal（搜索模态框）
- 快捷键支持
- 结果高亮
- 键盘导航

### ApiReference（API 参考）
- 类型展示
- 示例代码
- 可展开/折叠

### Pagination（分页）
- 上一页/下一页
- 可选页码

## 设计令牌

### 颜色

```css
/* 主色调 */
--ui-primary: hsl(212, 100%, 48%);

/* 代码高亮 */
--ui-code-background: hsl(220, 13%, 18%);
--ui-code-text: hsl(220, 14%, 96%);

/* 语义化颜色 */
--ui-note-background: hsl(212, 100%, 96%);
--ui-tip-background: hsl(142, 76%, 96%);
--ui-warning-background: hsl(38, 92%, 96%);
--ui-danger-background: hsl(0, 84%, 96%);
```

### 间距

```css
/* 内容间距 */
--ui-content-sm: 1rem;
--ui-content-md: 1.5rem;
--ui-content-lg: 2rem;

/* 布局宽度 */
--ui-sidebar-width: 16rem;
--ui-toc-width: 14rem;
--ui-content-max-width: 48rem;
```

### 字体

```css
/* 字体大小 */
--ui-body-base: 1rem;
--ui-h1: 2.5rem;
--ui-h2: 2rem;
--ui-h3: 1.5rem;

/* 行高 */
--ui-line-height-normal: 1.6;
--ui-line-height-heading: 1.3;
--ui-line-height-code: 1.7;
```

## 布局配置

### 文档页布局

```typescript
{
  type: 'flex',
  maxWidth: '80rem',
  areas: {
    sidebar: { width: '16rem' },
    content: { maxWidth: '48rem' },
    toc: { width: '14rem' },
  }
}
```

### API 参考页布局

```typescript
{
  type: 'flex',
  maxWidth: '80rem',
  areas: {
    sidebar: { width: '16rem' },
    content: { maxWidth: '60rem' },
  }
}
```

### 搜索页布局

```typescript
{
  type: 'stack',
  maxWidth: '48rem',
  areas: {
    searchBar: { width: '100%' },
    results: { width: '100%' },
  }
}
```

## 响应式断点

```typescript
{
  sm: '640px',   // 移动端
  md: '768px',   // 平板
  lg: '1024px',  // 桌面
  xl: '1280px',  // 大屏
}
```

## 依赖

- `@ouraihub/core` - 核心类型定义
- `@ouraihub/tokens` - 基础设计令牌

## License

MIT
