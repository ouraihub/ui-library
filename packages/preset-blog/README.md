# @ouraihub/preset-blog

博客场景的预设配置，提供优化的阅读体验和常用组件配置。

## 特性

- 📖 **优化的阅读体验** - 更大的字号、更宽松的行高，适合长文本阅读
- 🎨 **完整的设计令牌** - 颜色、字体、间距等设计系统
- 🧩 **常用组件配置** - 文章卡片、标签、分页、评论区等
- 📐 **响应式布局** - 首页、文章页、归档页、标签页等布局配置
- 🌗 **暗色主题支持** - 基于 CSS 变量的主题系统

## 安装

```bash
pnpm add @ouraihub/preset-blog
```

## 使用

### 完整预设

```typescript
import { blogPreset } from '@ouraihub/preset-blog';

// 使用完整预设
const config = {
  preset: blogPreset,
};
```

### 按需导入

```typescript
import { blogTokens, blogComponents, blogLayout } from '@ouraihub/preset-blog';

// 只使用设计令牌
const tokens = blogTokens;

// 只使用组件配置
const components = blogComponents;

// 只使用布局配置
const layout = blogLayout;
```

## 设计令牌

### 颜色

```typescript
blogTokens.colors = {
  brand: {
    primary: 'hsl(210, 100%, 50%)',
    primaryLight: 'hsl(210, 100%, 97%)',
    primaryDark: 'hsl(210, 100%, 30%)',
  },
  content: {
    heading: 'hsl(0, 0%, 10%)',
    body: 'hsl(0, 0%, 20%)',
    muted: 'hsl(0, 0%, 50%)',
    link: 'hsl(210, 100%, 50%)',
    linkHover: 'hsl(210, 100%, 40%)',
  },
  semantic: {
    featured: 'hsl(45, 100%, 51%)',
    new: 'hsl(142, 76%, 36%)',
    popular: 'hsl(0, 84%, 60%)',
    archived: 'hsl(0, 0%, 65%)',
  },
};
```

### 字体

```typescript
blogTokens.typography = {
  fontFamily: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...',
    heading: '"Georgia", "Times New Roman", serif',
    code: '"Fira Code", "Cascadia Code", "Consolas", monospace',
  },
  fontSize: {
    articleTitle: '2.5rem',
    articleBody: '1.125rem',
    meta: '0.875rem',
    tag: '0.8125rem',
  },
  lineHeight: {
    heading: 1.2,
    body: 1.75,
    code: 1.6,
  },
};
```

## 组件配置

### 文章卡片

```typescript
{
  name: 'ArticleCard',
  enabled: true,
  defaults: {
    showExcerpt: true,
    showThumbnail: true,
    showMeta: true,
    showTags: true,
    excerptLength: 150,
  },
  variants: {
    featured: { /* 特色文章样式 */ },
    compact: { /* 紧凑样式 */ },
  },
}
```

### 标签

```typescript
{
  name: 'Tag',
  enabled: true,
  defaults: {
    variant: 'default',
    size: 'sm',
    clickable: true,
  },
  variants: {
    default: { /* 默认样式 */ },
    primary: { /* 主色样式 */ },
    outlined: { /* 描边样式 */ },
  },
}
```

### 分页

```typescript
{
  name: 'Pagination',
  enabled: true,
  defaults: {
    showFirstLast: true,
    showPrevNext: true,
    maxPages: 7,
  },
}
```

### 其他组件

- **Comments** - 评论区配置
- **TableOfContents** - 目录配置
- **AuthorBio** - 作者信息配置
- **RelatedPosts** - 相关文章配置

## 布局配置

### 首页布局

```typescript
blogLayout.layouts.home = {
  type: 'grid',
  columns: 12,
  areas: {
    mobile: ['header', 'main', 'footer'],
    desktop: ['header', 'main + sidebar', 'footer'],
  },
};
```

### 文章页布局

```typescript
blogLayout.layouts.article = {
  type: 'grid',
  columns: 12,
  areas: {
    mobile: ['header', 'article', 'footer'],
    desktop: ['header', 'toc + article + sidebar', 'footer'],
  },
  styles: {
    article: {
      maxWidth: '720px',
      margin: '0 auto',
    },
  },
};
```

### 归档页布局

```typescript
blogLayout.layouts.archive = {
  type: 'flex',
  styles: {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
    },
  },
};
```

### 标签页布局

```typescript
blogLayout.layouts.tags = {
  type: 'grid',
  columns: 12,
  areas: {
    mobile: ['header', 'cloud', 'list', 'footer'],
    desktop: ['header', 'cloud', 'list + sidebar', 'footer'],
  },
};
```

## 响应式断点

```typescript
blogLayout.breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

## 自定义配置

### 扩展设计令牌

```typescript
import { blogPreset } from '@ouraihub/preset-blog';

const customPreset = {
  ...blogPreset,
  tokens: {
    ...blogPreset.tokens,
    colors: {
      ...blogPreset.tokens.colors,
      brand: {
        primary: '#your-color',
      },
    },
  },
};
```

### 覆盖组件配置

```typescript
import { blogPreset } from '@ouraihub/preset-blog';

const customPreset = {
  ...blogPreset,
  components: blogPreset.components?.map(comp => 
    comp.name === 'ArticleCard'
      ? { ...comp, defaults: { ...comp.defaults, excerptLength: 200 } }
      : comp
  ),
};
```

## 依赖

- `@ouraihub/core` - 核心类型定义
- `@ouraihub/tokens` - 基础设计令牌

## License

MIT
