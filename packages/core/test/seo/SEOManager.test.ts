import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SEOManager } from '../../src/seo/SEOManager';
import type { SEOOptions, SchemaOrgData } from '../../src/seo/types';

describe('SEOManager', () => {
  let seoManager: SEOManager;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with empty options', () => {
      seoManager = new SEOManager();
      expect(seoManager.getMeta()).toEqual({});
      expect(seoManager.getOpenGraph()).toEqual({});
      expect(seoManager.getTwitterCard()).toEqual({});
      expect(seoManager.getCanonical()).toBeNull();
      expect(seoManager.getSchemaOrg()).toEqual([]);
      expect(seoManager.getHreflang()).toEqual([]);
    });

    it('should initialize with meta tags', () => {
      seoManager = new SEOManager({
        meta: {
          title: 'Test Title',
          description: 'Test Description',
          keywords: 'test, keywords'
        }
      });
      expect(seoManager.getMeta()).toEqual({
        title: 'Test Title',
        description: 'Test Description',
        keywords: 'test, keywords'
      });
    });

    it('should initialize with Open Graph tags', () => {
      seoManager = new SEOManager({
        openGraph: {
          title: 'OG Title',
          description: 'OG Description',
          image: 'https://example.com/image.jpg'
        }
      });
      expect(seoManager.getOpenGraph()).toEqual({
        title: 'OG Title',
        description: 'OG Description',
        image: 'https://example.com/image.jpg'
      });
    });

    it('should initialize with Twitter Card tags', () => {
      seoManager = new SEOManager({
        twitter: {
          card: 'summary_large_image',
          title: 'Twitter Title',
          site: '@example'
        }
      });
      expect(seoManager.getTwitterCard()).toEqual({
        card: 'summary_large_image',
        title: 'Twitter Title',
        site: '@example'
      });
    });

    it('should initialize with canonical URL', () => {
      seoManager = new SEOManager({
        canonical: 'https://example.com/page'
      });
      expect(seoManager.getCanonical()).toBe('https://example.com/page');
    });

    it('should initialize with single schema', () => {
      const schema: SchemaOrgData = {
        '@type': 'Article',
        headline: 'Test Article'
      };
      seoManager = new SEOManager({ schema });
      expect(seoManager.getSchemaOrg()).toEqual([schema]);
    });

    it('should initialize with multiple schemas', () => {
      const schemas: SchemaOrgData[] = [
        { '@type': 'Article', headline: 'Test Article' },
        { '@type': 'Organization', name: 'Test Org' }
      ];
      seoManager = new SEOManager({ schema: schemas });
      expect(seoManager.getSchemaOrg()).toEqual(schemas);
    });

    it('should initialize with hreflang links', () => {
      const hreflang = [
        { lang: 'en', url: 'https://example.com/en' },
        { lang: 'zh', url: 'https://example.com/zh' }
      ];
      seoManager = new SEOManager({ hreflang });
      expect(seoManager.getHreflang()).toEqual(hreflang);
    });
  });

  describe('setTitle()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should set meta title', () => {
      seoManager.setTitle('New Title');
      expect(seoManager.getMeta().title).toBe('New Title');
    });

    it('should auto-set Open Graph title if not set', () => {
      seoManager.setTitle('New Title');
      expect(seoManager.getOpenGraph().title).toBe('New Title');
    });

    it('should auto-set Twitter title if not set', () => {
      seoManager.setTitle('New Title');
      expect(seoManager.getTwitterCard().title).toBe('New Title');
    });

    it('should not override existing Open Graph title', () => {
      seoManager.setOpenGraph({ title: 'OG Title' });
      seoManager.setTitle('New Title');
      expect(seoManager.getOpenGraph().title).toBe('OG Title');
    });

    it('should not override existing Twitter title', () => {
      seoManager.setTwitterCard({ title: 'Twitter Title' });
      seoManager.setTitle('New Title');
      expect(seoManager.getTwitterCard().title).toBe('Twitter Title');
    });
  });

  describe('setDescription()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should set meta description', () => {
      seoManager.setDescription('New Description');
      expect(seoManager.getMeta().description).toBe('New Description');
    });

    it('should auto-set Open Graph description if not set', () => {
      seoManager.setDescription('New Description');
      expect(seoManager.getOpenGraph().description).toBe('New Description');
    });

    it('should auto-set Twitter description if not set', () => {
      seoManager.setDescription('New Description');
      expect(seoManager.getTwitterCard().description).toBe('New Description');
    });

    it('should not override existing Open Graph description', () => {
      seoManager.setOpenGraph({ description: 'OG Description' });
      seoManager.setDescription('New Description');
      expect(seoManager.getOpenGraph().description).toBe('OG Description');
    });

    it('should not override existing Twitter description', () => {
      seoManager.setTwitterCard({ description: 'Twitter Description' });
      seoManager.setDescription('New Description');
      expect(seoManager.getTwitterCard().description).toBe('Twitter Description');
    });
  });

  describe('setImage()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should set Open Graph image', () => {
      seoManager.setImage('https://example.com/image.jpg');
      expect(seoManager.getOpenGraph().image).toBe('https://example.com/image.jpg');
    });

    it('should set image with dimensions', () => {
      seoManager.setImage('https://example.com/image.jpg', 1200, 630);
      expect(seoManager.getOpenGraph().image).toBe('https://example.com/image.jpg');
      expect(seoManager.getOpenGraph().imageWidth).toBe(1200);
      expect(seoManager.getOpenGraph().imageHeight).toBe(630);
    });

    it('should auto-set Twitter image if not set', () => {
      seoManager.setImage('https://example.com/image.jpg');
      expect(seoManager.getTwitterCard().image).toBe('https://example.com/image.jpg');
    });

    it('should not override existing Twitter image', () => {
      seoManager.setTwitterCard({ image: 'https://example.com/twitter.jpg' });
      seoManager.setImage('https://example.com/image.jpg');
      expect(seoManager.getTwitterCard().image).toBe('https://example.com/twitter.jpg');
    });
  });

  describe('setCanonical()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should set canonical URL', () => {
      seoManager.setCanonical('https://example.com/page');
      expect(seoManager.getCanonical()).toBe('https://example.com/page');
    });

    it('should auto-set Open Graph URL if not set', () => {
      seoManager.setCanonical('https://example.com/page');
      expect(seoManager.getOpenGraph().url).toBe('https://example.com/page');
    });

    it('should not override existing Open Graph URL', () => {
      seoManager.setOpenGraph({ url: 'https://example.com/og-url' });
      seoManager.setCanonical('https://example.com/page');
      expect(seoManager.getOpenGraph().url).toBe('https://example.com/og-url');
    });
  });

  describe('setOpenGraph()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should set Open Graph tags', () => {
      seoManager.setOpenGraph({
        title: 'OG Title',
        description: 'OG Description',
        type: 'article'
      });
      expect(seoManager.getOpenGraph()).toEqual({
        title: 'OG Title',
        description: 'OG Description',
        type: 'article'
      });
    });

    it('should merge with existing Open Graph tags', () => {
      seoManager.setOpenGraph({ title: 'OG Title' });
      seoManager.setOpenGraph({ description: 'OG Description' });
      expect(seoManager.getOpenGraph()).toEqual({
        title: 'OG Title',
        description: 'OG Description'
      });
    });
  });

  describe('setTwitterCard()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should set Twitter Card tags', () => {
      seoManager.setTwitterCard({
        card: 'summary_large_image',
        title: 'Twitter Title',
        site: '@example'
      });
      expect(seoManager.getTwitterCard()).toEqual({
        card: 'summary_large_image',
        title: 'Twitter Title',
        site: '@example'
      });
    });

    it('should merge with existing Twitter Card tags', () => {
      seoManager.setTwitterCard({ card: 'summary' });
      seoManager.setTwitterCard({ title: 'Twitter Title' });
      expect(seoManager.getTwitterCard()).toEqual({
        card: 'summary',
        title: 'Twitter Title'
      });
    });
  });

  describe('setSchemaOrg()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should set single schema', () => {
      const schema: SchemaOrgData = {
        '@type': 'Article',
        headline: 'Test Article'
      };
      seoManager.setSchemaOrg(schema);
      expect(seoManager.getSchemaOrg()).toEqual([schema]);
    });

    it('should set multiple schemas', () => {
      const schemas: SchemaOrgData[] = [
        { '@type': 'Article', headline: 'Test Article' },
        { '@type': 'Organization', name: 'Test Org' }
      ];
      seoManager.setSchemaOrg(schemas);
      expect(seoManager.getSchemaOrg()).toEqual(schemas);
    });

    it('should replace existing schemas', () => {
      seoManager.setSchemaOrg({ '@type': 'Article', headline: 'First' });
      seoManager.setSchemaOrg({ '@type': 'WebPage', name: 'Second' });
      expect(seoManager.getSchemaOrg()).toEqual([{ '@type': 'WebPage', name: 'Second' }]);
    });
  });

  describe('addSchemaOrg()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should add schema to empty list', () => {
      const schema: SchemaOrgData = {
        '@type': 'Article',
        headline: 'Test Article'
      };
      seoManager.addSchemaOrg(schema);
      expect(seoManager.getSchemaOrg()).toEqual([schema]);
    });

    it('should append schema to existing list', () => {
      seoManager.setSchemaOrg({ '@type': 'Article', headline: 'First' });
      seoManager.addSchemaOrg({ '@type': 'Organization', name: 'Second' });
      expect(seoManager.getSchemaOrg()).toEqual([
        { '@type': 'Article', headline: 'First' },
        { '@type': 'Organization', name: 'Second' }
      ]);
    });
  });

  describe('setHreflang()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should set hreflang links', () => {
      const links = [
        { lang: 'en', url: 'https://example.com/en' },
        { lang: 'zh', url: 'https://example.com/zh' }
      ];
      seoManager.setHreflang(links);
      expect(seoManager.getHreflang()).toEqual(links);
    });

    it('should replace existing hreflang links', () => {
      seoManager.setHreflang([{ lang: 'en', url: 'https://example.com/en' }]);
      seoManager.setHreflang([{ lang: 'zh', url: 'https://example.com/zh' }]);
      expect(seoManager.getHreflang()).toEqual([{ lang: 'zh', url: 'https://example.com/zh' }]);
    });
  });

  describe('generateMetaTags()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should generate basic meta tags', () => {
      seoManager = new SEOManager({
        meta: {
          title: 'Test Title',
          description: 'Test Description',
          keywords: 'test, keywords'
        }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('<title>Test Title</title>');
      expect(html).toContain('<meta name="description" content="Test Description">');
      expect(html).toContain('<meta name="keywords" content="test, keywords">');
    });

    it('should generate charset meta tag', () => {
      seoManager = new SEOManager({
        meta: { charset: 'UTF-8' }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('<meta charset="UTF-8">');
    });

    it('should generate viewport meta tag', () => {
      seoManager = new SEOManager({
        meta: { viewport: 'width=device-width, initial-scale=1.0' }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    });

    it('should generate author meta tag', () => {
      seoManager = new SEOManager({
        meta: { author: 'John Doe' }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('<meta name="author" content="John Doe">');
    });

    it('should generate robots meta tag', () => {
      seoManager = new SEOManager({
        meta: { robots: 'index, follow' }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('<meta name="robots" content="index, follow">');
    });

    it('should generate canonical link', () => {
      seoManager = new SEOManager({
        canonical: 'https://example.com/page'
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('<link rel="canonical" href="https://example.com/page">');
    });

    it('should generate Open Graph tags', () => {
      seoManager = new SEOManager({
        openGraph: {
          title: 'OG Title',
          description: 'OG Description',
          image: 'https://example.com/image.jpg',
          imageWidth: 1200,
          imageHeight: 630,
          url: 'https://example.com/page',
          type: 'article',
          siteName: 'Example Site',
          locale: 'en_US'
        }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('<meta property="og:title" content="OG Title">');
      expect(html).toContain('<meta property="og:description" content="OG Description">');
      expect(html).toContain('<meta property="og:image" content="https://example.com/image.jpg">');
      expect(html).toContain('<meta property="og:image:width" content="1200">');
      expect(html).toContain('<meta property="og:image:height" content="630">');
      expect(html).toContain('<meta property="og:url" content="https://example.com/page">');
      expect(html).toContain('<meta property="og:type" content="article">');
      expect(html).toContain('<meta property="og:site_name" content="Example Site">');
      expect(html).toContain('<meta property="og:locale" content="en_US">');
    });

    it('should generate Twitter Card tags', () => {
      seoManager = new SEOManager({
        twitter: {
          card: 'summary_large_image',
          title: 'Twitter Title',
          description: 'Twitter Description',
          image: 'https://example.com/twitter.jpg',
          site: '@example',
          creator: '@author'
        }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
      expect(html).toContain('<meta name="twitter:title" content="Twitter Title">');
      expect(html).toContain('<meta name="twitter:description" content="Twitter Description">');
      expect(html).toContain('<meta name="twitter:image" content="https://example.com/twitter.jpg">');
      expect(html).toContain('<meta name="twitter:site" content="@example">');
      expect(html).toContain('<meta name="twitter:creator" content="@author">');
    });

    it('should generate hreflang links', () => {
      seoManager = new SEOManager({
        hreflang: [
          { lang: 'en', url: 'https://example.com/en' },
          { lang: 'zh', url: 'https://example.com/zh' }
        ]
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('<link rel="alternate" hreflang="en" href="https://example.com/en">');
      expect(html).toContain('<link rel="alternate" hreflang="zh" href="https://example.com/zh">');
    });

    it('should escape HTML special characters', () => {
      seoManager = new SEOManager({
        meta: {
          title: 'Title with <script>alert("XSS")</script>',
          description: 'Description with & < > " \''
        }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&amp;');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
      expect(html).toContain('&quot;');
      expect(html).toContain('&#39;');
      expect(html).not.toContain('<script>');
    });

    it('should return empty string for empty options', () => {
      seoManager = new SEOManager();
      const html = seoManager.generateMetaTags();
      expect(html).toBe('');
    });
  });

  describe('generateSchemaOrg()', () => {
    beforeEach(() => {
      seoManager = new SEOManager();
    });

    it('should generate Schema.org JSON-LD script', () => {
      const schema: SchemaOrgData = {
        '@type': 'Article',
        headline: 'Test Article',
        author: 'John Doe'
      };
      seoManager.setSchemaOrg(schema);
      const html = seoManager.generateSchemaOrg();
      expect(html).toContain('<script type="application/ld+json">');
      expect(html).toContain('"@context": "https://schema.org"');
      expect(html).toContain('"@type": "Article"');
      expect(html).toContain('"headline": "Test Article"');
      expect(html).toContain('"author": "John Doe"');
      expect(html).toContain('</script>');
    });

    it('should use custom @context if provided', () => {
      const schema: SchemaOrgData = {
        '@context': 'https://custom.schema.org',
        '@type': 'Article',
        headline: 'Test Article'
      };
      seoManager.setSchemaOrg(schema);
      const html = seoManager.generateSchemaOrg();
      expect(html).toContain('"@context": "https://custom.schema.org"');
    });

    it('should generate multiple schemas', () => {
      const schemas: SchemaOrgData[] = [
        { '@type': 'Article', headline: 'Test Article' },
        { '@type': 'Organization', name: 'Test Org' }
      ];
      seoManager.setSchemaOrg(schemas);
      const html = seoManager.generateSchemaOrg();
      expect(html).toContain('"@type": "Article"');
      expect(html).toContain('"@type": "Organization"');
      expect(html.match(/<script type="application\/ld\+json">/g)).toHaveLength(2);
    });

    it('should skip schema without @type', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const schema = {
        headline: 'Test Article'
      } as SchemaOrgData;
      seoManager.setSchemaOrg(schema);
      const html = seoManager.generateSchemaOrg();
      expect(html).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('[SEOManager] Schema.org data missing @type field');
      consoleSpy.mockRestore();
    });

    it('should return empty string for empty schema list', () => {
      seoManager = new SEOManager();
      const html = seoManager.generateSchemaOrg();
      expect(html).toBe('');
    });

    it('should handle JSON serialization errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const circularRef: any = { '@type': 'Article' };
      circularRef.self = circularRef;
      seoManager.setSchemaOrg(circularRef);
      const html = seoManager.generateSchemaOrg();
      expect(html).toBe('');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      seoManager = new SEOManager({
        meta: {
          title: '',
          description: '',
          keywords: ''
        }
      });
      const html = seoManager.generateMetaTags();
      // Empty strings are falsy, so they won't generate tags
      expect(html).toBe('');
    });

    it('should handle null values gracefully', () => {
      seoManager = new SEOManager();
      seoManager.setTitle('');
      seoManager.setDescription('');
      expect(seoManager.getMeta().title).toBe('');
      expect(seoManager.getMeta().description).toBe('');
    });

    it('should handle special characters in URLs', () => {
      seoManager = new SEOManager({
        canonical: 'https://example.com/page?param=value&other=test'
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('&amp;');
    });

    it('should handle Unicode characters', () => {
      seoManager = new SEOManager({
        meta: {
          title: '测试标题 🚀',
          description: 'Тест описание'
        }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain('测试标题 🚀');
      expect(html).toContain('Тест описание');
    });

    it('should handle very long content', () => {
      const longText = 'a'.repeat(10000);
      seoManager = new SEOManager({
        meta: { description: longText }
      });
      const html = seoManager.generateMetaTags();
      expect(html).toContain(longText);
    });
  });

  describe('Integration scenarios', () => {
    it('should support complete SEO setup', () => {
      seoManager = new SEOManager({
        meta: {
          title: 'Complete SEO Test',
          description: 'Full SEO setup test',
          keywords: 'seo, test, complete',
          viewport: 'width=device-width, initial-scale=1.0',
          robots: 'index, follow',
          author: 'John Doe',
          charset: 'UTF-8'
        },
        openGraph: {
          title: 'OG Title',
          description: 'OG Description',
          image: 'https://example.com/og-image.jpg',
          imageWidth: 1200,
          imageHeight: 630,
          url: 'https://example.com/page',
          type: 'article',
          siteName: 'Example Site',
          locale: 'en_US'
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Twitter Title',
          description: 'Twitter Description',
          image: 'https://example.com/twitter-image.jpg',
          site: '@example',
          creator: '@author'
        },
        canonical: 'https://example.com/page',
        schema: {
          '@type': 'Article',
          headline: 'Test Article',
          author: 'John Doe',
          datePublished: '2026-05-13'
        },
        hreflang: [
          { lang: 'en', url: 'https://example.com/en' },
          { lang: 'zh', url: 'https://example.com/zh' }
        ]
      });

      const metaTags = seoManager.generateMetaTags();
      const schemaOrg = seoManager.generateSchemaOrg();

      expect(metaTags).toContain('<title>Complete SEO Test</title>');
      expect(metaTags).toContain('<meta property="og:title" content="OG Title">');
      expect(metaTags).toContain('<meta name="twitter:card" content="summary_large_image">');
      expect(metaTags).toContain('<link rel="canonical" href="https://example.com/page">');
      expect(metaTags).toContain('<link rel="alternate" hreflang="en"');
      expect(schemaOrg).toContain('"@type": "Article"');
    });

    it('should support chaining setters', () => {
      seoManager = new SEOManager();
      seoManager.setTitle('Test Title');
      seoManager.setDescription('Test Description');
      seoManager.setImage('https://example.com/image.jpg', 1200, 630);
      seoManager.setCanonical('https://example.com/page');

      expect(seoManager.getMeta().title).toBe('Test Title');
      expect(seoManager.getMeta().description).toBe('Test Description');
      expect(seoManager.getOpenGraph().image).toBe('https://example.com/image.jpg');
      expect(seoManager.getCanonical()).toBe('https://example.com/page');
    });

    it('should support dynamic updates', () => {
      seoManager = new SEOManager({
        meta: { title: 'Initial Title' }
      });

      expect(seoManager.generateMetaTags()).toContain('Initial Title');

      seoManager.setTitle('Updated Title');
      expect(seoManager.generateMetaTags()).toContain('Updated Title');
      expect(seoManager.generateMetaTags()).not.toContain('Initial Title');
    });

    it('should maintain immutability of returned data', () => {
      seoManager = new SEOManager({
        meta: { title: 'Original Title' }
      });

      const meta = seoManager.getMeta();
      meta.title = 'Modified Title';

      expect(seoManager.getMeta().title).toBe('Original Title');
    });
  });
});
