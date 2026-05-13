# SEOManager API

> **包**: `@ouraihub/core`  
> **版本**: 1.4.0  
> **最后更新**: 2026-05-13

SEO 元数据管理系统，提供完整的 SEO 标签生成功能，包括 Meta 标签、Open Graph、Twitter Card 和 Schema.org 结构化数据。

---

## 导入

```typescript
import { SEOManager } from '@ouraihub/core/seo';
```

---

## 构造函数

```typescript
constructor(options?: SEOOptions)
```

创建 SEOManager 实例。

### 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `options` | `SEOOptions` | 否 | `{}` | SEO 配置选项 |

### SEOOptions

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `meta` | `MetaTags` | 否 | 基础 meta 标签配置 |
| `openGraph` | `OpenGraphTags` | 否 | Open Graph 标签配置 |
| `twitter` | `TwitterCardTags` | 否 | Twitter Card 标签配置 |
| `canonical` | `string` | 否 | 规范链接 URL |
| `schema` | `SchemaOrgData \| SchemaOrgData[]` | 否 | Schema.org 结构化数据 |
| `hreflang` | `Array<{ lang: string; url: string }>` | 否 | 多语言链接 |

### 示例

```typescript
// 基础配置
const seo = new SEOManager({
  meta: {
    title: '我的网站',
    description: '网站描述',
    keywords: 'SEO, 网站, 优化'
  }
});

// 完整配置
const seo = new SEOManager({
  meta: {
    title: '产品页面',
    description: '产品详细描述',
    author: '作者名称',
    robots: 'index, follow'
  },
  openGraph: {
    type: 'website',
    siteName: '我的网站',
    locale: 'zh_CN'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mysite',
    creator: '@author'
  },
  canonical: 'https://example.com/page',
  schema: {
    '@type': 'WebPage',
    name: '页面名称',
    description: '页面描述'
  }
});
```

---

## 类型定义

### MetaTags

基础 meta 标签配置。

```typescript
interface MetaTags {
  title?: string;        // 页面标题
  description?: string;  // 页面描述
  keywords?: string;     // 关键词（逗号分隔）
  viewport?: string;     // 视口设置
  robots?: string;       // 搜索引擎爬虫指令
  author?: string;       // 作者
  charset?: string;      // 字符编码
}
```

### OpenGraphTags

Open Graph 标签配置（用于社交媒体分享）。

```typescript
interface OpenGraphTags {
  title?: string;        // 分享标题
  description?: string;  // 分享描述
  image?: string;        // 分享图片 URL
  imageWidth?: number;   // 图片宽度（像素）
  imageHeight?: number;  // 图片高度（像素）
  url?: string;          // 页面 URL
  type?: string;         // 内容类型（website, article 等）
  siteName?: string;     // 网站名称
  locale?: string;       // 语言区域（如 zh_CN）
}
```

### TwitterCardTags

Twitter Card 标签配置。

```typescript
interface TwitterCardTags {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title?: string;        // 卡片标题
  description?: string;  // 卡片描述
  image?: string;        // 卡片图片 URL
  site?: string;         // 网站 Twitter 账号（@username）
  creator?: string;      // 作者 Twitter 账号（@username）
}
```

### SchemaOrgData

Schema.org 结构化数据配置。

```typescript
interface SchemaOrgData {
  '@context'?: string;   // 默认 'https://schema.org'
  '@type': SchemaOrgType;
  [key: string]: unknown;
}

type SchemaOrgType = 
  | 'Article'           // 文章
  | 'WebPage'           // 网页
  | 'Organization'      // 组织
  | 'Person'            // 人物
  | 'WebSite'           // 网站
  | 'BlogPosting'       // 博客文章
  | 'NewsArticle'       // 新闻文章
  | 'Product'           // 产品
  | 'Event'             // 事件
  | 'BreadcrumbList';   // 面包屑导航
```

---

## 方法

### setTitle()

```typescript
setTitle(title: string): void
```

设置页面标题，自动同步到 Open Graph 和 Twitter Card。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `title` | `string` | 是 | 页面标题 |

#### 示例

```typescript
seo.setTitle('我的博客文章');
// 同时设置 meta title、og:title 和 twitter:title
```

---

### setDescription()

```typescript
setDescription(description: string): void
```

设置页面描述，自动同步到 Open Graph 和 Twitter Card。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `description` | `string` | 是 | 页面描述 |

#### 示例

```typescript
seo.setDescription('这是一篇关于 SEO 优化的文章');
// 同时设置 meta description、og:description 和 twitter:description
```

---

### setImage()

```typescript
setImage(url: string, width?: number, height?: number): void
```

设置分享图片，自动同步到 Open Graph 和 Twitter Card。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `url` | `string` | 是 | 图片 URL（建议使用绝对路径）|
| `width` | `number` | 否 | 图片宽度（像素）|
| `height` | `number` | 否 | 图片高度（像素）|

#### 示例

```typescript
seo.setImage('https://example.com/image.jpg', 1200, 630);
// 推荐尺寸：1200x630（Open Graph）或 1200x600（Twitter）
```

---

### setCanonical()

```typescript
setCanonical(url: string): void
```

设置规范链接，自动同步到 Open Graph URL。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `url` | `string` | 是 | 规范 URL（必须是绝对路径）|

#### 示例

```typescript
seo.setCanonical('https://example.com/blog/post-1');
// 用于避免重复内容问题
```

---

### setOpenGraph()

```typescript
setOpenGraph(data: OpenGraphTags): void
```

设置 Open Graph 标签（合并模式）。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `data` | `OpenGraphTags` | 是 | Open Graph 数据 |

#### 示例

```typescript
seo.setOpenGraph({
  type: 'article',
  siteName: '我的博客',
  locale: 'zh_CN'
});
```

---

### setTwitterCard()

```typescript
setTwitterCard(data: TwitterCardTags): void
```

设置 Twitter Card 标签（合并模式）。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `data` | `TwitterCardTags` | 是 | Twitter Card 数据 |

#### 示例

```typescript
seo.setTwitterCard({
  card: 'summary_large_image',
  site: '@myblog',
  creator: '@author'
});
```

---

### setSchemaOrg()

```typescript
setSchemaOrg(data: SchemaOrgData | SchemaOrgData[]): void
```

设置 Schema.org 结构化数据（替换模式）。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `data` | `SchemaOrgData \| SchemaOrgData[]` | 是 | Schema.org 数据 |

#### 示例

```typescript
// 单个 Schema
seo.setSchemaOrg({
  '@type': 'Article',
  headline: '文章标题',
  author: {
    '@type': 'Person',
    name: '作者名称'
  },
  datePublished: '2026-05-13'
});

// 多个 Schema
seo.setSchemaOrg([
  {
    '@type': 'WebSite',
    name: '我的网站',
    url: 'https://example.com'
  },
  {
    '@type': 'Organization',
    name: '我的公司',
    logo: 'https://example.com/logo.png'
  }
]);
```

---

### addSchemaOrg()

```typescript
addSchemaOrg(data: SchemaOrgData): void
```

添加 Schema.org 结构化数据（追加模式）。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `data` | `SchemaOrgData` | 是 | Schema.org 数据 |

#### 示例

```typescript
// 先设置网站信息
seo.setSchemaOrg({
  '@type': 'WebSite',
  name: '我的网站'
});

// 再添加面包屑导航
seo.addSchemaOrg({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首页', item: 'https://example.com' },
    { '@type': 'ListItem', position: 2, name: '博客', item: 'https://example.com/blog' }
  ]
});
```

---

### setHreflang()

```typescript
setHreflang(links: Array<{ lang: string; url: string }>): void
```

设置多语言链接。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `links` | `Array<{ lang: string; url: string }>` | 是 | 语言链接数组 |

#### 示例

```typescript
seo.setHreflang([
  { lang: 'zh-CN', url: 'https://example.com/zh/page' },
  { lang: 'en', url: 'https://example.com/en/page' },
  { lang: 'x-default', url: 'https://example.com/page' }
]);
```

---

### generateMetaTags()

```typescript
generateMetaTags(): string
```

生成所有 meta 标签的 HTML 字符串。

#### 返回值

| 类型 | 描述 |
|------|------|
| `string` | HTML 标签字符串（已转义，防止 XSS）|

#### 示例

```typescript
const metaTags = seo.generateMetaTags();
// 返回：
// <title>我的网站</title>
// <meta name="description" content="网站描述">
// <meta property="og:title" content="我的网站">
// ...
```

---

### generateSchemaOrg()

```typescript
generateSchemaOrg(): string
```

生成 Schema.org JSON-LD 脚本标签。

#### 返回值

| 类型 | 描述 |
|------|------|
| `string` | JSON-LD script 标签字符串 |

#### 示例

```typescript
const schemaScript = seo.generateSchemaOrg();
// 返回：
// <script type="application/ld+json">
// {
//   "@context": "https://schema.org",
//   "@type": "Article",
//   "headline": "文章标题"
// }
// </script>
```

---

### 获取方法

以下方法用于获取当前配置（返回副本，不影响原始数据）：

- `getMeta(): MetaTags` - 获取 meta 标签配置
- `getOpenGraph(): OpenGraphTags` - 获取 Open Graph 配置
- `getTwitterCard(): TwitterCardTags` - 获取 Twitter Card 配置
- `getSchemaOrg(): SchemaOrgData[]` - 获取 Schema.org 配置
- `getCanonical(): string | null` - 获取规范链接
- `getHreflang(): Array<{ lang: string; url: string }>` - 获取多语言链接

---

## 完整示例

### 基础用法

```typescript
import { SEOManager } from '@ouraihub/core/seo';

// 创建实例
const seo = new SEOManager();

// 设置基础信息
seo.setTitle('我的博客文章');
seo.setDescription('这是一篇关于 SEO 优化的详细文章');
seo.setImage('https://example.com/images/article.jpg', 1200, 630);
seo.setCanonical('https://example.com/blog/seo-guide');

// 生成标签
const metaTags = seo.generateMetaTags();

// 在 HTML 中使用
document.head.insertAdjacentHTML('beforeend', metaTags);
```

### 博客文章（完整配置）

```typescript
import { SEOManager } from '@ouraihub/core/seo';

const seo = new SEOManager({
  meta: {
    title: 'SEO 优化完全指南 - 我的博客',
    description: '学习如何优化网站的 SEO，提升搜索引擎排名',
    keywords: 'SEO, 搜索引擎优化, 网站优化',
    author: '张三',
    robots: 'index, follow'
  },
  openGraph: {
    type: 'article',
    siteName: '我的博客',
    locale: 'zh_CN'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@myblog',
    creator: '@zhangsan'
  },
  canonical: 'https://example.com/blog/seo-guide',
  schema: {
    '@type': 'BlogPosting',
    headline: 'SEO 优化完全指南',
    author: {
      '@type': 'Person',
      name: '张三',
      url: 'https://example.com/author/zhangsan'
    },
    datePublished: '2026-05-13T10:00:00+08:00',
    dateModified: '2026-05-13T15:30:00+08:00',
    image: 'https://example.com/images/seo-guide.jpg',
    publisher: {
      '@type': 'Organization',
      name: '我的博客',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png'
      }
    }
  }
});

// 生成并插入标签
const metaTags = seo.generateMetaTags();
const schemaScript = seo.generateSchemaOrg();

document.head.insertAdjacentHTML('beforeend', metaTags);
document.head.insertAdjacentHTML('beforeend', schemaScript);
```

### 产品页面

```typescript
import { SEOManager } from '@ouraihub/core/seo';

const seo = new SEOManager();

// 设置基础信息
seo.setTitle('iPhone 15 Pro - 官方商店');
seo.setDescription('全新 iPhone 15 Pro，钛金属设计，A17 Pro 芯片');
seo.setImage('https://example.com/products/iphone-15-pro.jpg', 1200, 630);
seo.setCanonical('https://example.com/products/iphone-15-pro');

// 设置产品 Schema
seo.setSchemaOrg({
  '@type': 'Product',
  name: 'iPhone 15 Pro',
  description: '全新 iPhone 15 Pro，钛金属设计',
  image: 'https://example.com/products/iphone-15-pro.jpg',
  brand: {
    '@type': 'Brand',
    name: 'Apple'
  },
  offers: {
    '@type': 'Offer',
    price: '7999',
    priceCurrency: 'CNY',
    availability: 'https://schema.org/InStock',
    url: 'https://example.com/products/iphone-15-pro'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1250'
  }
});

// 生成标签
const metaTags = seo.generateMetaTags();
const schemaScript = seo.generateSchemaOrg();
```

### 多语言网站

```typescript
import { SEOManager } from '@ouraihub/core/seo';

const seo = new SEOManager();

// 设置当前页面信息
seo.setTitle('关于我们');
seo.setDescription('了解我们的团队和使命');
seo.setCanonical('https://example.com/zh/about');

// 设置多语言链接
seo.setHreflang([
  { lang: 'zh-CN', url: 'https://example.com/zh/about' },
  { lang: 'en', url: 'https://example.com/en/about' },
  { lang: 'ja', url: 'https://example.com/ja/about' },
  { lang: 'x-default', url: 'https://example.com/en/about' }
]);

// 设置 Open Graph 语言
seo.setOpenGraph({
  locale: 'zh_CN'
});

const metaTags = seo.generateMetaTags();
```

---

## Schema.org 类型说明

### Article（文章）

适用于新闻文章、博客文章等。

```typescript
{
  '@type': 'Article',
  headline: '文章标题',
  author: {
    '@type': 'Person',
    name: '作者名称'
  },
  datePublished: '2026-05-13',
  image: 'https://example.com/image.jpg'
}
```

### WebPage（网页）

适用于普通网页。

```typescript
{
  '@type': 'WebPage',
  name: '页面名称',
  description: '页面描述',
  url: 'https://example.com/page'
}
```

### Organization（组织）

适用于公司、组织信息。

```typescript
{
  '@type': 'Organization',
  name: '公司名称',
  url: 'https://example.com',
  logo: 'https://example.com/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+86-10-12345678',
    contactType: 'customer service'
  }
}
```

### Product（产品）

适用于电商产品页面。

```typescript
{
  '@type': 'Product',
  name: '产品名称',
  image: 'https://example.com/product.jpg',
  description: '产品描述',
  brand: {
    '@type': 'Brand',
    name: '品牌名称'
  },
  offers: {
    '@type': 'Offer',
    price: '99.99',
    priceCurrency: 'CNY',
    availability: 'https://schema.org/InStock'
  }
}
```

### BreadcrumbList（面包屑导航）

适用于导航路径。

```typescript
{
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '首页',
      item: 'https://example.com'
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '博客',
      item: 'https://example.com/blog'
    }
  ]
}
```

**完整类型参考**: [Schema.org 官方文档](https://schema.org/)

---

## 最佳实践

### 1. 标题优化

```typescript
// ✅ 好的做法
seo.setTitle('SEO 优化指南 - 我的博客');
// 长度：50-60 字符
// 包含关键词
// 包含品牌名称

// ❌ 不好的做法
seo.setTitle('首页');
// 太短，不包含关键词
```

### 2. 描述优化

```typescript
// ✅ 好的做法
seo.setDescription('学习如何优化网站的 SEO，包括关键词研究、内容优化、技术 SEO 等实用技巧，提升搜索引擎排名。');
// 长度：150-160 字符
// 包含关键词
// 吸引点击

// ❌ 不好的做法
seo.setDescription('这是一篇文章');
// 太短，不吸引人
```

### 3. 图片优化

```typescript
// ✅ 好的做法
seo.setImage('https://example.com/images/article-og.jpg', 1200, 630);
// 使用绝对路径
// 推荐尺寸：1200x630（Open Graph）
// 文件大小 < 1MB

// ❌ 不好的做法
seo.setImage('/images/small-icon.png');
// 相对路径（可能无法显示）
// 尺寸太小
```

### 4. 规范链接

```typescript
// ✅ 好的做法
seo.setCanonical('https://example.com/blog/post-1');
// 使用绝对路径
// 指向主要版本

// ❌ 不好的做法
seo.setCanonical('/blog/post-1');
// 相对路径（无效）
```

### 5. Schema.org 数据

```typescript
// ✅ 好的做法
seo.setSchemaOrg({
  '@type': 'Article',
  headline: '文章标题',
  author: {
    '@type': 'Person',
    name: '作者名称',
    url: 'https://example.com/author/name'
  },
  datePublished: '2026-05-13T10:00:00+08:00',
  dateModified: '2026-05-13T15:30:00+08:00',
  image: 'https://example.com/image.jpg',
  publisher: {
    '@type': 'Organization',
    name: '网站名称',
    logo: {
      '@type': 'ImageObject',
      url: 'https://example.com/logo.png'
    }
  }
});
// 包含完整信息
// 使用 ISO 8601 日期格式
// 嵌套对象使用正确的 @type

// ❌ 不好的做法
seo.setSchemaOrg({
  '@type': 'Article',
  headline: '文章标题'
});
// 缺少必要字段
```

### 6. 安全性

```typescript
// ✅ 自动 HTML 转义
seo.setTitle('文章标题 <script>alert("xss")</script>');
const tags = seo.generateMetaTags();
// 输出：<title>文章标题 &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</title>

// SEOManager 自动转义所有输出，防止 XSS 攻击
```

### 7. 性能优化

```typescript
// ✅ 在服务端生成标签
// Hugo 模板
{{ $seo := partial "seo/generate" . }}
{{ $seo | safeHTML }}

// Astro 组件
---
const seo = new SEOManager({ ... });
const metaTags = seo.generateMetaTags();
---
<Fragment set:html={metaTags} />

// 避免在客户端动态生成（影响 SEO）
```

---

## 注意事项

### 浏览器兼容性

- 所有现代浏览器
- IE 11+（需要 polyfill）

### SEO 工具验证

生成标签后，使用以下工具验证：

- [Google Rich Results Test](https://search.google.com/test/rich-results) - 验证 Schema.org
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - 验证 Open Graph
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - 验证 Twitter Card

### 常见问题

**Q: 为什么社交媒体分享时图片不显示？**

A: 确保图片使用绝对路径，尺寸符合要求（1200x630），文件大小 < 1MB。

**Q: Schema.org 数据不生效？**

A: 使用 Google Rich Results Test 验证 JSON-LD 格式是否正确，确保包含必需字段。

**Q: 如何处理动态内容？**

A: 在服务端渲染时生成 SEO 标签，避免客户端动态生成（搜索引擎可能无法抓取）。

---

## 相关文档

- [API 参考索引](./README.md)
- [类型定义](./types.md)
- [完整设计方案](../DESIGN.md)
- [Hugo 使用示例](../../examples/hugo/seo/README.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
