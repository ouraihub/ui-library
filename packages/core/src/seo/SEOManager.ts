import type { 
  SEOOptions, 
  MetaTags, 
  OpenGraphTags, 
  TwitterCardTags, 
  SchemaOrgData 
} from './types';

/**
 * SEOManager - 管理网页的 SEO 元数据
 * 
 * 提供完整的 SEO 元数据管理功能，包括：
 * - Meta 标签（title、description、keywords 等）
 * - Open Graph 标签（社交媒体分享）
 * - Twitter Card 标签
 * - Schema.org 结构化数据（JSON-LD）
 * - Canonical URL
 * - 多语言支持（hreflang）
 * 
 * @example
 * ```typescript
 * const seo = new SEOManager({
 *   meta: {
 *     title: '我的网站',
 *     description: '网站描述'
 *   }
 * });
 * 
 * // 生成 meta 标签
 * const metaTags = seo.generateMetaTags();
 * 
 * // 生成 Schema.org 数据
 * const schema = seo.generateSchemaOrg();
 * ```
 */
export class SEOManager {
  private meta: MetaTags = {};
  private openGraph: OpenGraphTags = {};
  private twitter: TwitterCardTags = {};
  private canonical: string | null = null;
  private schema: SchemaOrgData[] = [];
  private hreflang: Array<{ lang: string; url: string }> = [];

  constructor(options: SEOOptions = {}) {
    if (options.meta) {
      this.meta = { ...options.meta };
    }
    if (options.openGraph) {
      this.openGraph = { ...options.openGraph };
    }
    if (options.twitter) {
      this.twitter = { ...options.twitter };
    }
    if (options.canonical) {
      this.canonical = options.canonical;
    }
    if (options.schema) {
      this.schema = Array.isArray(options.schema) ? [...options.schema] : [options.schema];
    }
    if (options.hreflang) {
      this.hreflang = [...options.hreflang];
    }
  }

  /**
   * 设置页面标题
   * @param title - 页面标题
   */
  public setTitle(title: string): void {
    this.meta.title = title;
    if (!this.openGraph.title) {
      this.openGraph.title = title;
    }
    if (!this.twitter.title) {
      this.twitter.title = title;
    }
  }

  /**
   * 设置页面描述
   * @param description - 页面描述
   */
  public setDescription(description: string): void {
    this.meta.description = description;
    if (!this.openGraph.description) {
      this.openGraph.description = description;
    }
    if (!this.twitter.description) {
      this.twitter.description = description;
    }
  }

  /**
   * 设置页面图片
   * @param url - 图片 URL
   * @param width - 图片宽度（可选）
   * @param height - 图片高度（可选）
   */
  public setImage(url: string, width?: number, height?: number): void {
    this.openGraph.image = url;
    if (width !== undefined) {
      this.openGraph.imageWidth = width;
    }
    if (height !== undefined) {
      this.openGraph.imageHeight = height;
    }
    if (!this.twitter.image) {
      this.twitter.image = url;
    }
  }

  /**
   * 设置规范链接
   * @param url - 规范 URL
   */
  public setCanonical(url: string): void {
    this.canonical = url;
    if (!this.openGraph.url) {
      this.openGraph.url = url;
    }
  }

  /**
   * 设置 Open Graph 标签
   * @param data - Open Graph 数据
   */
  public setOpenGraph(data: OpenGraphTags): void {
    this.openGraph = { ...this.openGraph, ...data };
  }

  /**
   * 设置 Twitter Card 标签
   * @param data - Twitter Card 数据
   */
  public setTwitterCard(data: TwitterCardTags): void {
    this.twitter = { ...this.twitter, ...data };
  }

  /**
   * 设置 Schema.org 结构化数据
   * @param data - Schema.org 数据（单个或数组）
   */
  public setSchemaOrg(data: SchemaOrgData | SchemaOrgData[]): void {
    this.schema = Array.isArray(data) ? [...data] : [data];
  }

  /**
   * 添加 Schema.org 结构化数据
   * @param data - Schema.org 数据
   */
  public addSchemaOrg(data: SchemaOrgData): void {
    this.schema.push(data);
  }

  /**
   * 设置多语言链接
   * @param links - 语言链接数组
   */
  public setHreflang(links: Array<{ lang: string; url: string }>): void {
    this.hreflang = [...links];
  }

  /**
   * HTML 转义，防止 XSS 攻击
   * @param text - 需要转义的文本
   * @returns 转义后的文本
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * 生成 meta 标签 HTML
   * @returns HTML 字符串
   */
  public generateMetaTags(): string {
    const tags: string[] = [];

    // 基础 meta 标签
    if (this.meta.charset) {
      tags.push(`<meta charset="${this.escapeHtml(this.meta.charset)}">`);
    }

    if (this.meta.viewport) {
      tags.push(`<meta name="viewport" content="${this.escapeHtml(this.meta.viewport)}">`);
    }

    if (this.meta.title) {
      tags.push(`<title>${this.escapeHtml(this.meta.title)}</title>`);
    }

    if (this.meta.description) {
      tags.push(`<meta name="description" content="${this.escapeHtml(this.meta.description)}">`);
    }

    if (this.meta.keywords) {
      tags.push(`<meta name="keywords" content="${this.escapeHtml(this.meta.keywords)}">`);
    }

    if (this.meta.author) {
      tags.push(`<meta name="author" content="${this.escapeHtml(this.meta.author)}">`);
    }

    if (this.meta.robots) {
      tags.push(`<meta name="robots" content="${this.escapeHtml(this.meta.robots)}">`);
    }

    // Canonical URL
    if (this.canonical) {
      tags.push(`<link rel="canonical" href="${this.escapeHtml(this.canonical)}">`);
    }

    // Open Graph 标签
    if (this.openGraph.title) {
      tags.push(`<meta property="og:title" content="${this.escapeHtml(this.openGraph.title)}">`);
    }

    if (this.openGraph.description) {
      tags.push(`<meta property="og:description" content="${this.escapeHtml(this.openGraph.description)}">`);
    }

    if (this.openGraph.image) {
      tags.push(`<meta property="og:image" content="${this.escapeHtml(this.openGraph.image)}">`);
      
      if (this.openGraph.imageWidth !== undefined) {
        tags.push(`<meta property="og:image:width" content="${this.openGraph.imageWidth}">`);
      }
      
      if (this.openGraph.imageHeight !== undefined) {
        tags.push(`<meta property="og:image:height" content="${this.openGraph.imageHeight}">`);
      }
    }

    if (this.openGraph.url) {
      tags.push(`<meta property="og:url" content="${this.escapeHtml(this.openGraph.url)}">`);
    }

    if (this.openGraph.type) {
      tags.push(`<meta property="og:type" content="${this.escapeHtml(this.openGraph.type)}">`);
    }

    if (this.openGraph.siteName) {
      tags.push(`<meta property="og:site_name" content="${this.escapeHtml(this.openGraph.siteName)}">`);
    }

    if (this.openGraph.locale) {
      tags.push(`<meta property="og:locale" content="${this.escapeHtml(this.openGraph.locale)}">`);
    }

    // Twitter Card 标签
    if (this.twitter.card) {
      tags.push(`<meta name="twitter:card" content="${this.escapeHtml(this.twitter.card)}">`);
    }

    if (this.twitter.title) {
      tags.push(`<meta name="twitter:title" content="${this.escapeHtml(this.twitter.title)}">`);
    }

    if (this.twitter.description) {
      tags.push(`<meta name="twitter:description" content="${this.escapeHtml(this.twitter.description)}">`);
    }

    if (this.twitter.image) {
      tags.push(`<meta name="twitter:image" content="${this.escapeHtml(this.twitter.image)}">`);
    }

    if (this.twitter.site) {
      tags.push(`<meta name="twitter:site" content="${this.escapeHtml(this.twitter.site)}">`);
    }

    if (this.twitter.creator) {
      tags.push(`<meta name="twitter:creator" content="${this.escapeHtml(this.twitter.creator)}">`);
    }

    // Hreflang 标签
    for (const link of this.hreflang) {
      tags.push(`<link rel="alternate" hreflang="${this.escapeHtml(link.lang)}" href="${this.escapeHtml(link.url)}">`);
    }

    return tags.join('\n');
  }

  /**
   * 生成 Schema.org JSON-LD 脚本
   * @returns HTML script 标签字符串
   */
  public generateSchemaOrg(): string {
    if (this.schema.length === 0) {
      return '';
    }

    const scripts: string[] = [];

    for (const data of this.schema) {
      const schemaData = {
        '@context': data['@context'] || 'https://schema.org',
        ...data
      };

      // 验证必需的 @type 字段
      if (!schemaData['@type']) {
        console.warn('[SEOManager] Schema.org data missing @type field');
        continue;
      }

      try {
        const json = JSON.stringify(schemaData, null, 2);
        scripts.push(`<script type="application/ld+json">\n${json}\n</script>`);
      } catch (error) {
        console.error('[SEOManager] Failed to serialize Schema.org data:', error);
      }
    }

    return scripts.join('\n');
  }

  /**
   * 获取当前的 meta 标签配置
   * @returns Meta 标签对象
   */
  public getMeta(): MetaTags {
    return { ...this.meta };
  }

  /**
   * 获取当前的 Open Graph 配置
   * @returns Open Graph 对象
   */
  public getOpenGraph(): OpenGraphTags {
    return { ...this.openGraph };
  }

  /**
   * 获取当前的 Twitter Card 配置
   * @returns Twitter Card 对象
   */
  public getTwitterCard(): TwitterCardTags {
    return { ...this.twitter };
  }

  /**
   * 获取当前的 Schema.org 配置
   * @returns Schema.org 数据数组
   */
  public getSchemaOrg(): SchemaOrgData[] {
    return [...this.schema];
  }

  /**
   * 获取当前的 Canonical URL
   * @returns Canonical URL 或 null
   */
  public getCanonical(): string | null {
    return this.canonical;
  }

  /**
   * 获取当前的 Hreflang 配置
   * @returns Hreflang 链接数组
   */
  public getHreflang(): Array<{ lang: string; url: string }> {
    return [...this.hreflang];
  }
}
