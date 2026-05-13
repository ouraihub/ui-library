# Preset 系统设计

> **版本**: 1.0.0  
> **创建日期**: 2026-05-12  
> **状态**: approved  
> **维护者**: Sisyphus (AI Agent)

## 概述

Preset（预设）是 @ouraihub/ui-library 六层架构中的 **Layer 4**，位于框架基础层（Layer 3）和完整主题层（Layer 5）之间。Preset 提供**配置驱动的快速启动方案**，让用户无需从零配置即可启动特定类型的项目。

**设计灵感**: Tailwind CSS Presets、Chakra UI Theme Presets

---

## 核心概念

### Preset 是什么？

Preset 是一个**纯配置对象**，包含：
- 设计令牌覆盖（可选）
- 组件配置
- 布局选择
- 插件列表（未来）
- 构建配置（可选）

**关键特性**：
- ✅ 纯配置，无代码实现
- ✅ 可跨框架复用（Hugo、Astro、React）
- ✅ 可组合、可覆盖
- ✅ 类型安全（TypeScript）

### Preset vs Theme

| 维度 | Preset（Layer 4） | Theme（Layer 5） |
|------|------------------|-----------------|
| **本质** | 配置对象 | 完整实现 |
| **内容** | 配置 + 选项 | 代码 + 样式 + 布局 |
| **跨框架** | ✅ 可复用 | ❌ 框架特定 |
| **开箱即用** | ❌ 需要配合 Base | ✅ 零配置启动 |
| **定制性** | 高（覆盖配置） | 中（继承主题） |

**关系**：
```
Preset（配置） + Base（基础） = Theme（主题）

@ouraihub/preset-blog        (Layer 4: 配置)
    +
@ouraihub/hugo-base          (Layer 3: 基础)
    =
@ouraihub/hugo-theme-blog    (Layer 5: 主题)
```

---

## API 设计

### Preset 接口定义

```typescript
/**
 * Preset 配置接口
 */
export interface Preset {
  // ========== 元数据 ==========
  
  /** Preset 名称 */
  name: string;
  
  /** Preset 版本 */
  version: string;
  
  /** Preset 描述 */
  description: string;
  
  /** Preset 作者 */
  author?: string;
  
  /** Preset 许可证 */
  license?: string;
  
  // ========== 设计令牌覆盖 ==========
  
  /**
   * 设计令牌覆盖（可选）
   * 覆盖 @ouraihub/tokens 的默认值
   */
  tokens?: Partial<DesignTokens>;
  
  // ========== 组件配置 ==========
  
  /**
   * 组件配置
   * 为每个组件提供默认选项
   */
  components: {
    /** 主题切换组件配置 */
    themeToggle?: ThemeOptions;
    
    /** 搜索组件配置 */
    search?: SearchOptions;
    
    /** 导航组件配置 */
    navigation?: NavigationOptions;
    
    /** 懒加载配置 */
    lazyload?: LazyloadOptions;
    
    /** 自定义组件配置 */
    [key: string]: any;
  };
  
  // ========== 布局选择 ==========
  
  /**
   * 布局列表
   * 指定 Preset 使用的布局模板
   */
  layouts: string[];
  
  // ========== 插件系统（未来） ==========
  
  /**
   * 插件列表（未来扩展）
   * 例如: SEO、Analytics、RSS 等
   */
  plugins?: string[];
  
  // ========== 构建配置 ==========
  
  /**
   * 构建配置（可选）
   */
  build?: {
    /** Tailwind 配置覆盖 */
    tailwind?: Partial<TailwindConfig>;
    
    /** PostCSS 配置覆盖 */
    postcss?: Partial<PostCSSConfig>;
  };
  
  // ========== 扩展机制 ==========
  
  /**
   * 继承其他 Preset（可选）
   * 支持 Preset 组合
   */
  extends?: string | string[];
}
```

### 设计令牌接口

```typescript
/**
 * 设计令牌接口
 */
export interface DesignTokens {
  /** 颜色系统 */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  /** 间距系统 */
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  
  /** 字体系统 */
  typography: {
    fontFamily: {
      sans: string;
      serif: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  };
  
  /** 圆角系统 */
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  
  /** 阴影系统 */
  boxShadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}
```

---

## 内置 Preset

### @ouraihub/preset-blog

**目标用户**: 个人博客、技术博客、内容创作者

**特性**：
- 文章阅读优化（字体、行距、宽度）
- 代码高亮支持
- 标签和分类系统
- RSS 订阅支持
- SEO 优化

**配置**：

```typescript
import type { Preset } from '@ouraihub/core/preset';

export const blogPreset: Preset = {
  // 元数据
  name: '@ouraihub/preset-blog',
  version: '0.1.0',
  description: '博客网站预设配置',
  author: '@ouraihub',
  license: 'MIT',
  
  // 设计令牌覆盖
  tokens: {
    colors: {
      primary: '#2937f0',
      accent: '#f59e0b',
      neutral: '#6b7280',
    },
    typography: {
      fontFamily: {
        sans: 'Inter, system-ui, sans-serif',
        serif: 'Georgia, serif',
        mono: 'Fira Code, monospace',
      },
      fontSize: {
        base: '1.125rem', // 18px，阅读优化
      },
    },
  },
  
  // 组件配置
  components: {
    themeToggle: {
      storageKey: 'blog-theme',
      defaultTheme: 'system',
      attribute: 'data-theme',
    },
    search: {
      placeholder: '搜索文章...',
      hotkey: 'ctrl+k',
      maxResults: 10,
    },
    navigation: {
      sticky: true,
      hideOnScroll: false,
    },
  },
  
  // 布局列表
  layouts: [
    'post',        // 文章详情页
    'archive',     // 归档页
    'about',       // 关于页
    'tags',        // 标签页
    'categories',  // 分类页
  ],
  
  // 插件列表（未来）
  plugins: [
    '@ouraihub/plugin-seo',
    '@ouraihub/plugin-analytics',
    '@ouraihub/plugin-rss',
    '@ouraihub/plugin-sitemap',
  ],
  
  // 构建配置
  build: {
    tailwind: {
      content: [
        './content/**/*.md',
        './layouts/**/*.html',
      ],
    },
  },
};

export default blogPreset;
```

---

### @ouraihub/preset-docs

**目标用户**: 技术文档、API 文档、产品文档

**特性**：
- 侧边栏导航
- 目录（TOC）
- 代码块复制
- 版本切换
- 搜索功能

**配置**：

```typescript
import type { Preset } from '@ouraihub/core/preset';

export const docsPreset: Preset = {
  // 元数据
  name: '@ouraihub/preset-docs',
  version: '0.1.0',
  description: '文档网站预设配置',
  author: '@ouraihub',
  license: 'MIT',
  
  // 设计令牌覆盖
  tokens: {
    colors: {
      primary: '#0ea5e9',
      accent: '#8b5cf6',
      neutral: '#64748b',
    },
    spacing: {
      md: '1.5rem', // 文档需要更多空间
    },
  },
  
  // 组件配置
  components: {
    themeToggle: {
      storageKey: 'docs-theme',
      defaultTheme: 'light',
    },
    search: {
      placeholder: '搜索文档...',
      hotkey: 'ctrl+k',
      maxResults: 20,
    },
    navigation: {
      sticky: true,
      hideOnScroll: false,
      sidebar: true,
    },
  },
  
  // 布局列表
  layouts: [
    'doc',         // 文档页
    'api',         // API 参考页
    'guide',       // 指南页
    'tutorial',    // 教程页
    'changelog',   // 更新日志
  ],
  
  // 插件列表（未来）
  plugins: [
    '@ouraihub/plugin-seo',
    '@ouraihub/plugin-search',
    '@ouraihub/plugin-toc',
    '@ouraihub/plugin-code-copy',
  ],
  
  // 构建配置
  build: {
    tailwind: {
      content: [
        './content/**/*.md',
        './layouts/**/*.html',
      ],
    },
  },
};

export default docsPreset;
```

---

## 使用方式

### 方式 1: 直接使用（推荐）

**Hugo 项目**：

```toml
# config.toml
[params]
  preset = "@ouraihub/preset-blog"
```

```html
<!-- layouts/partials/head.html -->
{{ $preset := resources.Get "presets/blog.json" | unmarshal }}
{{ $tokens := $preset.tokens }}

<style>
  :root {
    --color-primary: {{ $tokens.colors.primary }};
    --color-accent: {{ $tokens.colors.accent }};
  }
</style>
```

**Astro 项目**：

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { blogPreset } from '@ouraihub/preset-blog';

export default defineConfig({
  integrations: [
    ouraihubPreset(blogPreset),
  ],
});
```

### 方式 2: 覆盖配置

```typescript
import { blogPreset } from '@ouraihub/preset-blog';
import type { Preset } from '@ouraihub/core/preset';

// 覆盖部分配置
const myPreset: Preset = {
  ...blogPreset,
  tokens: {
    ...blogPreset.tokens,
    colors: {
      ...blogPreset.tokens?.colors,
      primary: '#ff6b6b', // 自定义主色
    },
  },
  components: {
    ...blogPreset.components,
    themeToggle: {
      ...blogPreset.components.themeToggle,
      defaultTheme: 'dark', // 默认暗色主题
    },
  },
};

export default myPreset;
```

### 方式 3: 组合多个 Preset

```typescript
import { blogPreset } from '@ouraihub/preset-blog';
import { docsPreset } from '@ouraihub/preset-docs';
import type { Preset } from '@ouraihub/core/preset';

// 组合两个 Preset
const hybridPreset: Preset = {
  name: 'my-hybrid-preset',
  version: '1.0.0',
  description: '博客 + 文档混合预设',
  
  extends: [
    '@ouraihub/preset-blog',
    '@ouraihub/preset-docs',
  ],
  
  // 合并配置
  tokens: {
    ...blogPreset.tokens,
    ...docsPreset.tokens,
  },
  
  components: {
    ...blogPreset.components,
    ...docsPreset.components,
  },
  
  layouts: [
    ...blogPreset.layouts,
    ...docsPreset.layouts,
  ],
};

export default hybridPreset;
```

---

## 实施计划

### 任务清单

在实施路线图中添加以下任务（Batch 4.5）：

- [ ] **T20: 创建 Preset 接口定义**
  - 创建 `packages/core/src/preset/types.ts`
  - 定义 `Preset` 接口
  - 定义 `DesignTokens` 接口
  - 导出类型定义

- [ ] **T20.1: 实现 @ouraihub/preset-blog**
  - 创建 `packages/preset-blog/`
  - 定义博客预设配置
  - 编写使用文档
  - 提供使用示例

- [ ] **T20.2: 实现 @ouraihub/preset-docs**
  - 创建 `packages/preset-docs/`
  - 定义文档预设配置
  - 编写使用文档
  - 提供使用示例

### 包结构

```
packages/
├── preset-blog/
│   ├── src/
│   │   └── index.ts          # 博客预设配置
│   ├── README.md             # 使用文档
│   ├── package.json
│   └── tsconfig.json
│
└── preset-docs/
    ├── src/
    │   └── index.ts          # 文档预设配置
    ├── README.md             # 使用文档
    ├── package.json
    └── tsconfig.json
```

### package.json 示例

```json
{
  "name": "@ouraihub/preset-blog",
  "version": "0.1.0",
  "description": "Blog preset for @ouraihub/ui-library",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "dependencies": {
    "@ouraihub/core": "workspace:^"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  },
  "keywords": [
    "preset",
    "blog",
    "ouraihub",
    "ui-library"
  ],
  "license": "MIT"
}
```

---

## 未来扩展

### 插件系统

```typescript
export interface PresetPlugin {
  name: string;
  version: string;
  install: (preset: Preset) => void;
}

// 使用示例
import { seoPlugin } from '@ouraihub/plugin-seo';

const myPreset: Preset = {
  // ...
  plugins: [
    seoPlugin({
      siteName: 'My Blog',
      twitterHandle: '@myblog',
    }),
  ],
};
```

### 社区 Preset

鼓励社区创建自定义 Preset：

```typescript
// @awesome-dev/preset-portfolio
export const portfolioPreset: Preset = {
  name: '@awesome-dev/preset-portfolio',
  version: '1.0.0',
  description: '作品集网站预设',
  // ...
};
```

### Preset 市场

未来可以创建 Preset 市场，类似 npm：

```bash
# 搜索 Preset
npx @ouraihub/cli search preset blog

# 安装 Preset
npx @ouraihub/cli add preset @awesome-dev/preset-portfolio
```

---

## 最佳实践

### 1. 保持 Preset 简洁

❌ **不好**：
```typescript
const preset: Preset = {
  // 包含大量自定义逻辑
  components: {
    themeToggle: {
      onThemeChange: (theme) => {
        // 复杂的自定义逻辑
        console.log('Theme changed:', theme);
        // ...
      },
    },
  },
};
```

✅ **好**：
```typescript
const preset: Preset = {
  // 只包含配置
  components: {
    themeToggle: {
      storageKey: 'theme',
      defaultTheme: 'system',
    },
  },
};
```

### 2. 使用语义化命名

❌ **不好**：
```typescript
const preset: Preset = {
  name: 'my-preset-1',
  // ...
};
```

✅ **好**：
```typescript
const preset: Preset = {
  name: '@myorg/preset-tech-blog',
  // ...
};
```

### 3. 提供完整的元数据

✅ **好**：
```typescript
const preset: Preset = {
  name: '@ouraihub/preset-blog',
  version: '0.1.0',
  description: '博客网站预设配置',
  author: '@ouraihub',
  license: 'MIT',
  // ...
};
```

### 4. 文档化配置选项

每个 Preset 都应该有完整的 README，说明：
- 适用场景
- 包含的组件
- 配置选项
- 使用示例
- 覆盖方法

---

## 相关文档

- [六层架构设计](../decisions/005-six-layer-architecture.md) - Layer 4 定义
- [实施路线图](../implementation/01-roadmap.md) - Preset 实施任务
- [Critical 修复计划](../implementation/03-critical-fixes.md) - C1 问题修复

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
