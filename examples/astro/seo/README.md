# Astro SEO 使用示例

本示例展示如何在 Astro 项目中使用 `@ouraihub/astro` 的 SEO 组件。

## 安装

```bash
npm install @ouraihub/astro @ouraihub/core
```

## 基础使用

### 1. 在布局中使用

创建 `src/layouts/BaseLayout.astro`：

```astro
---
import { SEO } from '@ouraihub/astro';

interface Props {
  title: string;
  description: string;
  image?: string;
}

const { title, description, image } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <SEO
      meta={{
        title: `${title} - 我的网站`,
        description,
        robots: "index, follow"
      }}
      openGraph={{
        title,
        description,
        image: image || '/og-default.jpg',
        url: canonicalURL.toString(),
        type: "website",
        siteName: "我的网站"
      }}
      twitter={{
        card: "summary_large_image",
        title,
        description,
        image: image || '/og-default.jpg'
      }}
      canonical={canonicalURL.toString()}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 2. 在页面中使用

创建 `src/pages/blog/[slug].astro`：

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { SEO } from '@ouraihub/astro';

const { slug } = Astro.params;
const post = await getPost(slug);
---

<BaseLayout title={post.title} description={post.description}>
  <SEO
    schema={{
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: post.image,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Person",
        name: post.author
      },
      publisher: {
        "@type": "Organization",
        name: "我的网站",
        logo: {
          "@type": "ImageObject",
          url: "/logo.png"
        }
      }
    }}
  />
  
  <article>
    <h1>{post.title}</h1>
    <div set:html={post.content} />
  </article>
</BaseLayout>
```

## 常见场景

### 博客文章

```astro
---
import { SEO } from '@ouraihub/astro';

const post = {
  title: "如何使用 Astro 构建静态网站",
  description: "详细介绍 Astro 的使用方法",
  image: "/images/astro-tutorial.jpg",
  publishedAt: "2026-05-13T10:00:00Z",
  updatedAt: "2026-05-13T15:30:00Z",
  author: "张三"
};
---

<SEO
  meta={{
    title: post.title,
    description: post.description,
    keywords: "Astro, 静态网站, SSG"
  }}
  openGraph={{
    title: post.title,
    description: post.description,
    image: post.image,
    type: "article"
  }}
  schema={{
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author
    }
  }}
/>
```

### 产品页面

```astro
---
import { SEO } from '@ouraihub/astro';

const product = {
  name: "iPhone 15 Pro",
  description: "全新 iPhone 15 Pro，钛金属设计",
  image: "/images/iphone-15-pro.jpg",
  price: 7999,
  currency: "CNY",
  availability: "InStock",
  rating: 4.8,
  reviewCount: 1250
};
---

<SEO
  meta={{
    title: product.name,
    description: product.description
  }}
  openGraph={{
    title: product.name,
    description: product.description,
    image: product.image,
    type: "product"
  }}
  schema={{
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      "@type": "Brand",
      name: "Apple"
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    }
  }}
/>
```

### 多语言支持

```astro
---
import { SEO } from '@ouraihub/astro';

const currentLang = Astro.currentLocale || 'zh';
const translations = {
  zh: { title: "首页", description: "欢迎访问我的网站" },
  en: { title: "Home", description: "Welcome to my website" }
};

const t = translations[currentLang];
const alternateUrls = [
  { lang: 'zh', url: 'https://example.com/zh' },
  { lang: 'en', url: 'https://example.com/en' }
];
---

<SEO
  meta={{
    title: t.title,
    description: t.description
  }}
  hreflang={alternateUrls}
/>
```

## 与 Content Collections 集成

```astro
---
import { getCollection } from 'astro:content';
import { SEO } from '@ouraihub/astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<html>
  <head>
    <SEO
      meta={{
        title: post.data.title,
        description: post.data.description,
        keywords: post.data.tags.join(', ')
      }}
      openGraph={{
        title: post.data.title,
        description: post.data.description,
        image: post.data.image,
        type: "article"
      }}
      schema={{
        "@type": "BlogPosting",
        headline: post.data.title,
        description: post.data.description,
        datePublished: post.data.publishedAt.toISOString(),
        author: {
          "@type": "Person",
          name: post.data.author
        }
      }}
    />
  </head>
  <body>
    <article>
      <h1>{post.data.title}</h1>
      <Content />
    </article>
  </body>
</html>
```

## 最佳实践

### 1. 使用布局组件

将 SEO 配置集中在布局组件中，避免重复代码：

```astro
---
// src/layouts/BlogLayout.astro
import { SEO } from '@ouraihub/astro';

interface Props {
  frontmatter: {
    title: string;
    description: string;
    image?: string;
    publishedAt: Date;
  };
}

const { frontmatter } = Astro.props;
---

<html>
  <head>
    <SEO
      meta={{
        title: `${frontmatter.title} - 博客`,
        description: frontmatter.description
      }}
      openGraph={{
        title: frontmatter.title,
        description: frontmatter.description,
        image: frontmatter.image || '/og-default.jpg',
        type: "article"
      }}
      schema={{
        "@type": "BlogPosting",
        headline: frontmatter.title,
        datePublished: frontmatter.publishedAt.toISOString()
      }}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 2. 图片优化

确保 Open Graph 图片尺寸正确：

```astro
---
const ogImage = post.image 
  ? `${post.image}?w=1200&h=630&fit=cover`
  : '/og-default.jpg';
---

<SEO
  openGraph={{
    image: ogImage
  }}
/>
```

### 3. 动态 Canonical URL

```astro
---
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<SEO
  canonical={canonicalURL.toString()}
/>
```

## 验证工具

生成 SEO 标签后，使用以下工具验证：

1. **Google Rich Results Test**  
   https://search.google.com/test/rich-results

2. **Facebook Sharing Debugger**  
   https://developers.facebook.com/tools/debug/

3. **Twitter Card Validator**  
   https://cards-dev.twitter.com/validator

## 相关文档

- [SEOManager API 文档](../../../docs/api/SEOManager.md)
- [Astro 文档](https://docs.astro.build/)
- [Schema.org 文档](https://schema.org/)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
