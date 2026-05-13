# Hugo SEO 使用示例

本示例展示如何在 Hugo 主题中使用 `@ouraihub/core` 的 SEOManager 来管理 SEO 元数据。

## 目录

- [基础配置](#基础配置)
- [Hugo Front Matter 配置](#hugo-front-matter-配置)
- [常见场景](#常见场景)
  - [博客文章](#博客文章)
  - [产品页面](#产品页面)
  - [首页](#首页)
- [Partial 模板](#partial-模板)
- [最佳实践](#最佳实践)

---

## 基础配置

### 1. 安装依赖

```bash
npm install @ouraihub/core
```

### 2. 创建 SEO Partial

创建 `layouts/partials/seo.html`：

```html
{{- $seo := partial "seo/generate" . -}}
{{ $seo | safeHTML }}
```

### 3. 在 baseof.html 中引入

```html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  {{/* SEO 标签 */}}
  {{ partial "seo.html" . }}
  
  {{/* 其他 head 内容 */}}
</head>
<body>
  {{ block "main" . }}{{ end }}
</body>
</html>
```

---

## Hugo Front Matter 配置

### 基础配置

```yaml
---
title: "文章标题"
description: "文章描述"
date: 2026-05-13T10:00:00+08:00
lastmod: 2026-05-13T15:30:00+08:00
author: "作者名称"
keywords: ["SEO", "Hugo", "优化"]
image: "/images/article-cover.jpg"
---
```

### 完整配置（包含 SEO 选项）

```yaml
---
title: "SEO 优化完全指南"
description: "学习如何优化网站的 SEO，提升搜索引擎排名"
date: 2026-05-13T10:00:00+08:00
lastmod: 2026-05-13T15:30:00+08:00
author: "张三"
keywords: ["SEO", "搜索引擎优化", "网站优化"]
image: "/images/seo-guide.jpg"

# SEO 配置
seo:
  # Meta 标签
  robots: "index, follow"
  canonical: "https://example.com/blog/seo-guide"
  
  # Open Graph
  og_type: "article"
  og_locale: "zh_CN"
  
  # Twitter Card
  twitter_card: "summary_large_image"
  twitter_site: "@myblog"
  twitter_creator: "@zhangsan"
  
  # Schema.org
  schema_type: "BlogPosting"
  schema_extra:
    wordCount: 2500
    timeRequired: "PT15M"
---
```

---

## 常见场景

### 博客文章

#### Front Matter

```yaml
---
title: "如何使用 Hugo 构建静态网站"
description: "详细介绍 Hugo 静态网站生成器的使用方法，包括安装、配置、主题开发等"
date: 2026-05-13T10:00:00+08:00
lastmod: 2026-05-13T15:30:00+08:00
author: "李四"
keywords: ["Hugo", "静态网站", "SSG"]
image: "/images/hugo-tutorial.jpg"
categories: ["教程"]
tags: ["Hugo", "Web开发"]

seo:
  robots: "index, follow"
  canonical: "https://example.com/blog/hugo-tutorial"
  og_type: "article"
  twitter_card: "summary_large_image"
  twitter_creator: "@lisi"
  schema_type: "BlogPosting"
---
```

#### Partial 模板 (`layouts/partials/seo/generate.html`)

```html
{{- $title := .Title -}}
{{- $description := .Description | default .Summary -}}
{{- $image := .Params.image | default .Site.Params.defaultImage -}}
{{- $imageUrl := $image | absURL -}}
{{- $canonical := .Params.seo.canonical | default .Permalink -}}
{{- $author := .Params.author | default .Site.Params.author -}}
{{- $keywords := delimit .Params.keywords ", " -}}

{{- $seoConfig := dict
  "meta" (dict
    "title" (printf "%s - %s" $title .Site.Title)
    "description" $description
    "keywords" $keywords
    "author" $author
    "robots" (.Params.seo.robots | default "index, follow")
  )
  "openGraph" (dict
    "title" $title
    "description" $description
    "image" $imageUrl
    "url" $canonical
    "type" (.Params.seo.og_type | default "article")
    "siteName" .Site.Title
    "locale" (.Params.seo.og_locale | default "zh_CN")
  )
  "twitter" (dict
    "card" (.Params.seo.twitter_card | default "summary_large_image")
    "title" $title
    "description" $description
    "image" $imageUrl
    "site" (.Params.seo.twitter_site | default .Site.Params.twitter)
    "creator" (.Params.seo.twitter_creator | default .Site.Params.twitter)
  )
  "canonical" $canonical
  "schema" (dict
    "@type" (.Params.seo.schema_type | default "BlogPosting")
    "headline" $title
    "description" $description
    "image" $imageUrl
    "datePublished" (.Date.Format "2006-01-02T15:04:05Z07:00")
    "dateModified" (.Lastmod.Format "2006-01-02T15:04:05Z07:00")
    "author" (dict
      "@type" "Person"
      "name" $author
    )
    "publisher" (dict
      "@type" "Organization"
      "name" .Site.Title
      "logo" (dict
        "@type" "ImageObject"
        "url" (.Site.Params.logo | absURL)
      )
    )
  )
-}}

<script type="module">
  import { SEOManager } from '/js/core.js';
  
  const seo = new SEOManager({{ $seoConfig | jsonify | safeJS }});
  
  const metaTags = seo.generateMetaTags();
  const schemaScript = seo.generateSchemaOrg();
  
  document.head.insertAdjacentHTML('beforeend', metaTags);
  document.head.insertAdjacentHTML('beforeend', schemaScript);
</script>
```

---

### 产品页面

#### Front Matter

```yaml
---
title: "iPhone 15 Pro"
description: "全新 iPhone 15 Pro，钛金属设计，A17 Pro 芯片，专业级摄像系统"
image: "/images/products/iphone-15-pro.jpg"

# 产品信息
product:
  name: "iPhone 15 Pro"
  brand: "Apple"
  price: 7999
  currency: "CNY"
  availability: "InStock"
  rating: 4.8
  reviewCount: 1250

seo:
  robots: "index, follow"
  canonical: "https://example.com/products/iphone-15-pro"
  og_type: "product"
  twitter_card: "summary_large_image"
  schema_type: "Product"
---
```

#### Partial 模板 (`layouts/partials/seo/product.html`)

```html
{{- $product := .Params.product -}}
{{- $imageUrl := .Params.image | absURL -}}

{{- $seoConfig := dict
  "meta" (dict
    "title" (printf "%s - %s" .Title .Site.Title)
    "description" .Description
    "robots" "index, follow"
  )
  "openGraph" (dict
    "title" .Title
    "description" .Description
    "image" $imageUrl
    "url" .Permalink
    "type" "product"
    "siteName" .Site.Title
  )
  "twitter" (dict
    "card" "summary_large_image"
    "title" .Title
    "description" .Description
    "image" $imageUrl
  )
  "canonical" .Permalink
  "schema" (dict
    "@type" "Product"
    "name" $product.name
    "description" .Description
    "image" $imageUrl
    "brand" (dict
      "@type" "Brand"
      "name" $product.brand
    )
    "offers" (dict
      "@type" "Offer"
      "price" $product.price
      "priceCurrency" $product.currency
      "availability" (printf "https://schema.org/%s" $product.availability)
      "url" .Permalink
    )
    "aggregateRating" (dict
      "@type" "AggregateRating"
      "ratingValue" $product.rating
      "reviewCount" $product.reviewCount
    )
  )
-}}

<script type="module">
  import { SEOManager } from '/js/core.js';
  
  const seo = new SEOManager({{ $seoConfig | jsonify | safeJS }});
  
  document.head.insertAdjacentHTML('beforeend', seo.generateMetaTags());
  document.head.insertAdjacentHTML('beforeend', seo.generateSchemaOrg());
</script>
```

---

### 首页

#### config.yaml

```yaml
title: "我的网站"
params:
  description: "网站描述"
  author: "网站作者"
  defaultImage: "/images/og-default.jpg"
  logo: "/images/logo.png"
  twitter: "@mysite"
  
  # 首页 SEO
  home:
    title: "我的网站 - 专业的内容平台"
    description: "提供高质量的技术文章、教程和资源"
    keywords: ["技术博客", "教程", "开发"]
```

#### Partial 模板 (`layouts/partials/seo/home.html`)

```html
{{- $title := .Site.Params.home.title | default .Site.Title -}}
{{- $description := .Site.Params.home.description | default .Site.Params.description -}}
{{- $keywords := delimit .Site.Params.home.keywords ", " -}}
{{- $imageUrl := .Site.Params.defaultImage | absURL -}}

{{- $seoConfig := dict
  "meta" (dict
    "title" $title
    "description" $description
    "keywords" $keywords
    "robots" "index, follow"
  )
  "openGraph" (dict
    "title" $title
    "description" $description
    "image" $imageUrl
    "url" .Site.BaseURL
    "type" "website"
    "siteName" .Site.Title
    "locale" "zh_CN"
  )
  "twitter" (dict
    "card" "summary_large_image"
    "title" $title
    "description" $description
    "image" $imageUrl
    "site" .Site.Params.twitter
  )
  "canonical" .Site.BaseURL
  "schema" (slice
    (dict
      "@type" "WebSite"
      "name" .Site.Title
      "url" .Site.BaseURL
      "description" $description
      "potentialAction" (dict
        "@type" "SearchAction"
        "target" (printf "%s/search?q={search_term_string}" .Site.BaseURL)
        "query-input" "required name=search_term_string"
      )
    )
    (dict
      "@type" "Organization"
      "name" .Site.Title
      "url" .Site.BaseURL
      "logo" (dict
        "@type" "ImageObject"
        "url" (.Site.Params.logo | absURL)
      )
      "sameAs" (slice
        "https://twitter.com/mysite"
        "https://github.com/mysite"
      )
    )
  )
-}}

<script type="module">
  import { SEOManager } from '/js/core.js';
  
  const seo = new SEOManager({{ $seoConfig | jsonify | safeJS }});
  
  document.head.insertAdjacentHTML('beforeend', seo.generateMetaTags());
  document.head.insertAdjacentHTML('beforeend', seo.generateSchemaOrg());
</script>
```

---

## Partial 模板

### 通用 SEO 生成器 (`layouts/partials/seo/generate.html`)

```html
{{- if .IsHome -}}
  {{ partial "seo/home.html" . }}
{{- else if eq .Type "products" -}}
  {{ partial "seo/product.html" . }}
{{- else if eq .Type "posts" -}}
  {{ partial "seo/article.html" . }}
{{- else -}}
  {{ partial "seo/page.html" . }}
{{- end -}}
```

### 面包屑导航 (`layouts/partials/seo/breadcrumb.html`)

```html
{{- $breadcrumbs := slice -}}
{{- $breadcrumbs = $breadcrumbs | append (dict "name" "首页" "url" .Site.BaseURL) -}}

{{- range .Ancestors.Reverse -}}
  {{- $breadcrumbs = $breadcrumbs | append (dict "name" .Title "url" .Permalink) -}}
{{- end -}}

{{- $breadcrumbs = $breadcrumbs | append (dict "name" .Title "url" .Permalink) -}}

{{- $breadcrumbSchema := dict
  "@type" "BreadcrumbList"
  "itemListElement" (slice)
-}}

{{- range $index, $item := $breadcrumbs -}}
  {{- $breadcrumbSchema = merge $breadcrumbSchema (dict
    "itemListElement" ($breadcrumbSchema.itemListElement | append (dict
      "@type" "ListItem"
      "position" (add $index 1)
      "name" $item.name
      "item" $item.url
    ))
  ) -}}
{{- end -}}

<script type="module">
  import { SEOManager } from '/js/core.js';
  
  const seo = new SEOManager();
  seo.addSchemaOrg({{ $breadcrumbSchema | jsonify | safeJS }});
  
  document.head.insertAdjacentHTML('beforeend', seo.generateSchemaOrg());
</script>
```

---

## 最佳实践

### 1. 图片优化

```yaml
# ✅ 好的做法
image: "/images/article-og.jpg"  # 1200x630，< 1MB

# ❌ 不好的做法
image: "/images/small-icon.png"  # 尺寸太小
```

### 2. 标题长度

```yaml
# ✅ 好的做法（50-60 字符）
title: "Hugo SEO 优化指南 - 提升搜索排名"

# ❌ 不好的做法（太短）
title: "SEO"
```

### 3. 描述长度

```yaml
# ✅ 好的做法（150-160 字符）
description: "详细介绍如何在 Hugo 中实现 SEO 优化，包括 Meta 标签、Open Graph、Schema.org 等，提升搜索引擎排名和社交媒体分享效果。"

# ❌ 不好的做法（太短）
description: "SEO 教程"
```

### 4. 关键词选择

```yaml
# ✅ 好的做法
keywords: ["Hugo", "SEO 优化", "静态网站", "搜索引擎"]

# ❌ 不好的做法
keywords: ["网站"]  # 太宽泛
```

### 5. 规范链接

```yaml
# ✅ 好的做法
seo:
  canonical: "https://example.com/blog/post-1"  # 绝对路径

# ❌ 不好的做法
seo:
  canonical: "/blog/post-1"  # 相对路径（无效）
```

### 6. Schema.org 完整性

```yaml
# ✅ 好的做法
seo:
  schema_type: "BlogPosting"
  schema_extra:
    wordCount: 2500
    timeRequired: "PT15M"
    inLanguage: "zh-CN"

# ❌ 不好的做法
seo:
  schema_type: "BlogPosting"
  # 缺少额外信息
```

### 7. 多语言支持

```yaml
# config.yaml
languages:
  zh:
    languageName: "中文"
    weight: 1
  en:
    languageName: "English"
    weight: 2

# Front Matter
---
title: "文章标题"
translationKey: "my-article"
---
```

在 Partial 中自动生成 hreflang：

```html
{{- if .IsTranslated -}}
  {{- $translations := .Translations -}}
  {{- $hreflang := slice -}}
  
  {{- range $translations -}}
    {{- $hreflang = $hreflang | append (dict "lang" .Language.Lang "url" .Permalink) -}}
  {{- end -}}
  
  {{- $hreflang = $hreflang | append (dict "lang" .Language.Lang "url" .Permalink) -}}
  
  <script type="module">
    import { SEOManager } from '/js/core.js';
    
    const seo = new SEOManager();
    seo.setHreflang({{ $hreflang | jsonify | safeJS }});
    
    document.head.insertAdjacentHTML('beforeend', seo.generateMetaTags());
  </script>
{{- end -}}
```

---

## 验证工具

生成 SEO 标签后，使用以下工具验证：

1. **Google Rich Results Test**  
   https://search.google.com/test/rich-results  
   验证 Schema.org 结构化数据

2. **Facebook Sharing Debugger**  
   https://developers.facebook.com/tools/debug/  
   验证 Open Graph 标签

3. **Twitter Card Validator**  
   https://cards-dev.twitter.com/validator  
   验证 Twitter Card 标签

4. **Hugo 本地测试**
   ```bash
   hugo server
   # 访问 http://localhost:1313
   # 查看页面源代码，检查生成的标签
   ```

---

## 故障排查

### 问题：图片不显示

**原因**：使用了相对路径

**解决**：
```html
{{- $imageUrl := .Params.image | absURL -}}
```

### 问题：Schema.org 验证失败

**原因**：缺少必需字段

**解决**：确保包含所有必需字段
```yaml
seo:
  schema_type: "BlogPosting"
  schema_extra:
    author:
      "@type": "Person"
      name: "作者名称"
    publisher:
      "@type": "Organization"
      name: "网站名称"
```

### 问题：标题重复

**原因**：同时设置了 `<title>` 和 SEOManager

**解决**：只使用 SEOManager 生成标题
```html
{{/* 移除手动的 <title> 标签 */}}
{{/* <title>{{ .Title }}</title> */}}

{{/* 使用 SEOManager */}}
{{ partial "seo.html" . }}
```

---

## 相关文档

- [SEOManager API 文档](../../../docs/api/SEOManager.md)
- [Hugo 模板文档](https://gohugo.io/templates/)
- [Schema.org 文档](https://schema.org/)
- [Open Graph 协议](https://ogp.me/)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
