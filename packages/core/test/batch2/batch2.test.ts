import { describe, it, expect } from 'vitest';
import { getShareLinks, copyLink } from '../../src/share';
import { getEmbedUrl, getEmbedHtml } from '../../src/embed';
import { getLocalizedUrl, getCurrentLocale, getAlternateUrls } from '../../src/i18n';

describe('ShareManager', () => {
  it('generates default platform links', () => {
    const links = getShareLinks('https://example.com', 'Hello');
    expect(links.length).toBe(5);
    expect(links[0].name).toBe('Twitter');
    expect(links[0].href).toContain('twitter.com');
    expect(links[0].href).toContain(encodeURIComponent('https://example.com'));
  });

  it('respects custom platforms', () => {
    const links = getShareLinks('https://x.com', 'Hi', ['reddit', 'email']);
    expect(links.length).toBe(2);
    expect(links[0].name).toBe('Reddit');
    expect(links[1].name).toBe('Email');
    expect(links[1].href).toContain('mailto:');
  });
});

describe('EmbedManager', () => {
  it('generates YouTube embed URL', () => {
    expect(getEmbedUrl('youtube', { id: 'abc123' })).toBe('https://www.youtube.com/embed/abc123');
  });

  it('generates Bilibili embed URL', () => {
    expect(getEmbedUrl('bilibili', { id: 'BV1xx' })).toContain('bvid=BV1xx');
  });

  it('generates CodePen embed with user', () => {
    expect(getEmbedUrl('codepen', { id: 'xyz', user: 'john' })).toContain('/john/embed/xyz');
  });

  it('generates iframe HTML', () => {
    const html = getEmbedHtml('youtube', { id: 'abc' });
    expect(html).toContain('<iframe');
    expect(html).toContain('youtube.com/embed/abc');
    expect(html).toContain('allowfullscreen');
  });

  it('generates script tag for gist', () => {
    const html = getEmbedHtml('gist', { id: '123', user: 'bob' });
    expect(html).toContain('<script');
    expect(html).toContain('gist.github.com/bob/123.js');
  });
});

describe('i18n URL', () => {
  const opts = { strategy: 'prefix_except_default' as const, defaultLocale: 'zh', locales: ['zh', 'en', 'ja'] };

  it('getLocalizedUrl - default locale has no prefix', () => {
    expect(getLocalizedUrl('/about', 'zh', opts)).toBe('/about');
  });

  it('getLocalizedUrl - non-default locale gets prefix', () => {
    expect(getLocalizedUrl('/about', 'en', opts)).toBe('/en/about');
  });

  it('getLocalizedUrl - strips existing locale prefix', () => {
    expect(getLocalizedUrl('/en/about', 'ja', opts)).toBe('/ja/about');
  });

  it('getCurrentLocale - detects from prefix', () => {
    expect(getCurrentLocale('/en/about', opts)).toBe('en');
    expect(getCurrentLocale('/about', opts)).toBe('zh');
  });

  it('getAlternateUrls - generates all locale URLs', () => {
    const alts = getAlternateUrls('/about', opts);
    expect(alts.length).toBe(3);
    expect(alts.find(a => a.locale === 'zh')!.url).toBe('/about');
    expect(alts.find(a => a.locale === 'en')!.url).toBe('/en/about');
  });

  it('prefix strategy - all locales get prefix', () => {
    const prefixOpts = { ...opts, strategy: 'prefix' as const };
    expect(getLocalizedUrl('/about', 'zh', prefixOpts)).toBe('/zh/about');
    expect(getLocalizedUrl('/about', 'en', prefixOpts)).toBe('/en/about');
  });

  it('domain strategy', () => {
    const domainOpts = { strategy: 'domain' as const, defaultLocale: 'zh', locales: ['zh', 'en'], domains: { zh: 'zh.example.com', en: 'en.example.com' } };
    expect(getLocalizedUrl('/about', 'en', domainOpts)).toBe('https://en.example.com/about');
  });
});
