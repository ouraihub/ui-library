# Hugo SEO Partials 使用指南

## 概述

本项目提供了两个 SEO 相关的 Hugo partial 文件：
- `seo-meta.html` - 基本 meta 标签、Open Graph、Twitter Card、Canonical URL
- `seo-schema.html` - Schema.org JSON-LD 结构化数据

## 快速开始

### 1. 在 baseof.html 中引入

在你的 `layouts/_default/baseof.html` 文件的 `<head>` 部分添加：

```html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}">
<head>
  {{- /* SEO Meta 标签 */ -}}
  {{- partial "seo-meta.html" . -}}
  
  {{- /* Schema.org 结构化数据 */ -}}
  {{- partial "seo-schema.html" . -}}
  
  <title>{{ .Title }} | {{ .Site.Title }}</title>
  
  {{- /* 其他 head 内容 */ -}}
</head>
<body>
  {{- block "main" . }}{{- end }}
</body>
</html>
```

### 2. 在 config.toml 中配置站点级别的 SEO 参数

```toml
[params]
  description = "你的网站描述"
  author = "作者名称"
  defaultImage = "/images/default-og-image.jpg"
  logo = "/images/logo.png"
  keywords = ["关键词1", "关键词2", "关键词3"]
  
  # Twitter 配置
  twitterSite = "@your_twitter_handle"
  twitterCreator = "@your_twitter_handle"
  
  # Organization Schema 配置（可选）
  organizationDescription = "组织描述"
  socialLinks = [
    "https://twitter.com/yourhandle",
    "https://github.com/yourhandle",
    "https://linkedin.com/in/yourhandle"
  ]
```

### 3. 在页面 Front Matter 中自定义 SEO 数据

#### 基本页面示例

```yaml
---
title: "页面标题"
description: "页面描述，用于 meta description 和 Open Graph"
date: 2026-05-13
author: "作者名称"
image: "/images/page-image.jpg"
imageAlt: "图片描述"
keywords: ["关键词1", "关键词2"]
---

页面内容...
```

#### 文章页面示例（使用 Article Schema）

```yaml
---
title: "文章标题"
description: "文章摘要"
date: 2026-05-13
lastmod: 2026-05-13
author: "作者名称"
image: "/images/article-cover.jpg"
imageAlt: "封面图描述"
tags: ["标签1", "标签2", "标签3"]
schemaType: "Article"  # 使用 Article 类型的 Schema
---

文章内容...
```

#### 首页示例（使用 Organization Schema）

```yaml
---
title: "网站首页"
description: "网站描述"
schemaType: "Organization"  # 使用 Organization 类型的 Schema
---

首页内容...
```

## 配置参数说明

### seo-meta.html 支持的参数

#### 页面级别参数（Front Matter）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | string | `.Site.Title` | 页面标题 |
| `description` | string | `.Summary` 或 `.Site.Params.description` | 页面描述 |
| `author` | string | `.Site.Params.author` | 作者名称 |
| `image` | string | `.Site.Params.defaultImage` | Open Graph 和 Twitter Card 图片 |
| `imageAlt` | string | `title` | 图片替代文本 |
| `keywords` | array | `.Site.Params.keywords` | 关键词列表 |
| `robots` | string | `"index, follow"` | 搜索引擎爬虫指令 |
| `canonical` | string | `.Permalink` | Canonical URL（自定义） |
| `twitterCard` | string | `"summary_large_image"` | Twitter Card 类型 |
| `twitterCreator` | string | `.Site.Params.twitterCreator` | Twitter 创作者账号 |
| `tags` | array | - | 文章标签（用于 Open Graph） |

#### 站点级别参数（config.toml）

| 参数 | 类型 | 说明 |
|------|------|------|
| `.Site.Title` | string | 网站标题 |
| `.Site.Params.description` | string | 网站默认描述 |
| `.Site.Params.author` | string | 默认作者 |
| `.Site.Params.defaultImage` | string | 默认 Open Graph 图片 |
| `.Site.Params.keywords` | array | 默认关键词 |
| `.Site.Params.twitterSite` | string | Twitter 网站账号 |
| `.Site.Params.twitterCreator` | string | Twitter 创作者账号 |
| `.Site.Language.Lang` | string | 语言代码（如 "zh-CN"） |

### seo-schema.html 支持的参数

#### 页面级别参数（Front Matter）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `schemaType` | string | `"WebPage"` | Schema 类型：`"Article"`, `"WebPage"`, `"Organization"` |
| `title` | string | `.Site.Title` | 标题 |
| `description` | string | `.Summary` 或 `.Site.Params.description` | 描述 |
| `author` | string | `.Site.Params.author` | 作者（Article 类型） |
| `image` | string | `.Site.Params.defaultImage` | 图片 URL |
| `tags` | array | - | 关键词（Article 类型） |

#### 站点级别参数（config.toml）

| 参数 | 类型 | 说明 |
|------|------|------|
| `.Site.Title` | string | 网站/组织名称 |
| `.Site.BaseURL` | string | 网站 URL |
| `.Site.Params.logo` | string | 组织 Logo |
| `.Site.Params.organizationDescription` | string | 组织描述（Organization 类型） |
| `.Site.Params.socialLinks` | array | 社交媒体链接（Organization 类型） |

## Schema 类型说明

### WebPage（默认）

适用于普通页面，包含基本的页面信息。

```yaml
---
title: "关于我们"
description: "公司介绍"
schemaType: "WebPage"  # 可省略，这是默认值
---
```

### Article

适用于博客文章、新闻等内容页面，包含发布时间、作者、标签等信息。

```yaml
---
title: "如何使用 Hugo 构建网站"
description: "详细教程"
date: 2026-05-13
author: "张三"
tags: ["Hugo", "教程", "静态网站"]
schemaType: "Article"
---
```

### Organization

适用于首页或关于页面，展示组织信息和社交媒体链接。

```yaml
---
title: "公司首页"
description: "我们是一家..."
schemaType: "Organization"
---
```

需要在 `config.toml` 中配置：

```toml
[params]
  organizationDescription = "组织描述"
  socialLinks = [
    "https://twitter.com/yourhandle",
    "https://github.com/yourhandle"
  ]
```

## 高级用法

### 自定义 Canonical URL

如果你的内容在多个地方发布，可以指定原始 URL：

```yaml
---
title: "文章标题"
canonical: "https://original-site.com/article"
---
```

### 禁止搜索引擎索引

```yaml
---
title: "草稿页面"
robots: "noindex, nofollow"
---
```

### 使用外部图片

图片 URL 支持相对路径和绝对路径：

```yaml
---
# 相对路径（会自动转换为绝对 URL）
image: "/images/cover.jpg"

# 或使用完整 URL
image: "https://cdn.example.com/images/cover.jpg"
---
```

## 验证 SEO 配置

### 1. 验证 Open Graph

使用 [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

### 2. 验证 Twitter Card

使用 [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### 3. 验证 Schema.org

使用 [Google Rich Results Test](https://search.google.com/test/rich-results)

## 最佳实践

1. **图片尺寸**
   - Open Graph: 1200x630px（推荐）
   - Twitter Card: 1200x675px（推荐）

2. **描述长度**
   - Meta description: 150-160 字符
   - Open Graph description: 200 字符以内

3. **标题长度**
   - 页面标题: 60 字符以内
   - Open Graph 标题: 60-90 字符

4. **必需字段**
   - 每个页面都应该有 `title` 和 `description`
   - 文章页面应该有 `date` 和 `author`
   - 尽量为每个页面提供 `image`

5. **HTML 转义**
   - 所有用户输入的内容都会自动进行 HTML 转义
   - 使用 `plainify` 移除 HTML 标签
   - 使用 `jsonify` 确保 JSON-LD 格式正确

## 故障排查

### 问题：Open Graph 图片不显示

**解决方案**：
1. 确保图片 URL 是绝对路径
2. 检查图片是否可以公开访问
3. 图片大小应小于 8MB
4. 使用 Facebook Debugger 清除缓存

### 问题：Schema.org 验证失败

**解决方案**：
1. 使用 Google Rich Results Test 查看具体错误
2. 确保必需字段都已填写
3. 检查日期格式是否正确（ISO 8601）
4. 确保 JSON 格式正确（无多余逗号）

### 问题：搜索引擎不索引页面

**解决方案**：
1. 检查 `robots` meta 标签
2. 确认 `robots.txt` 没有禁止爬取
3. 检查 Canonical URL 是否正确
4. 使用 Google Search Console 提交站点地图

## 示例项目

完整的示例项目结构：

```
my-hugo-site/
├── config.toml
├── content/
│   ├── _index.md          # 首页（Organization Schema）
│   ├── about.md           # 关于页面（WebPage Schema）
│   └── posts/
│       └── my-post.md     # 文章（Article Schema）
└── layouts/
    ├── _default/
    │   └── baseof.html    # 引入 SEO partials
    └── partials/
        ├── seo-meta.html
        └── seo-schema.html
```

## 相关资源

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
