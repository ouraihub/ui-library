# @ouraihub/astro

Astro 组件包装层，为 `@ouraihub/core` 提供 Astro 框架集成。

## 安装

```bash
npm install @ouraihub/astro @ouraihub/core
```

## 组件

### SEO 组件

管理页面的 SEO 元数据，包括 Meta 标签、Open Graph、Twitter Cards 和 Schema.org 结构化数据。

#### 基础使用

```astro
---
import { SEO } from '@ouraihub/astro';
---

<html>
  <head>
    <SEO
      meta={{
        title: "我的网站",
        description: "网站描述",
        keywords: "关键词1, 关键词2"
      }}
      openGraph={{
        title: "我的网站",
        description: "网站描述",
        image: "https://example.com/og-image.jpg",
        url: "https://example.com"
      }}
    />
  </head>
  <body>
    <!-- 页面内容 -->
  </body>
</html>
```

#### 完整配置

```astro
---
import { SEO } from '@ouraihub/astro';
---

<SEO
  meta={{
    title: "文章标题",
    description: "文章描述",
    keywords: "SEO, Astro, 优化",
    author: "作者名称",
    robots: "index, follow"
  }}
  openGraph={{
    title: "文章标题",
    description: "文章描述",
    image: "https://example.com/article-image.jpg",
    url: "https://example.com/blog/article",
    type: "article",
    siteName: "我的网站",
    locale: "zh_CN"
  }}
  twitter={{
    card: "summary_large_image",
    title: "文章标题",
    description: "文章描述",
    image: "https://example.com/article-image.jpg",
    site: "@mysite",
    creator: "@author"
  }}
  canonical="https://example.com/blog/article"
  schema={{
    "@type": "BlogPosting",
    headline: "文章标题",
    description: "文章描述",
    image: "https://example.com/article-image.jpg",
    datePublished: "2026-05-13T10:00:00Z",
    dateModified: "2026-05-13T15:30:00Z",
    author: {
      "@type": "Person",
      name: "作者名称"
    }
  }}
/>
```

#### 多语言支持

```astro
---
import { SEO } from '@ouraihub/astro';

const currentLang = Astro.currentLocale || 'zh';
const alternateUrls = [
  { lang: 'zh', url: 'https://example.com/zh/page' },
  { lang: 'en', url: 'https://example.com/en/page' }
];
---

<SEO
  meta={{
    title: "页面标题",
    description: "页面描述"
  }}
  hreflang={alternateUrls}
/>
```

## API 参考

完整的 API 文档请参考 [@ouraihub/core SEOManager 文档](../core/README.md#seomanager)。

## 示例

查看 [examples/astro/seo](../../examples/astro/seo) 目录获取完整示例。

## 许可证

MIT
