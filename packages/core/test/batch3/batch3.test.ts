import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardShortcuts } from '../../src/keyboard-shortcuts';
import { TOCHighlighter } from '../../src/toc';
import { SearchAdapter } from '../../src/search-adapter';
import { CommentManager } from '../../src/comments';

describe('KeyboardShortcuts', () => {
  let ks: KeyboardShortcuts;

  beforeEach(() => { ks = new KeyboardShortcuts(); });
  afterEach(() => { ks.destroy(); });

  it('registers and triggers shortcuts', () => {
    const handler = vi.fn();
    ks.register({ key: 'ctrl+k', handler });

    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    document.dispatchEvent(event);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('ignores shortcuts when typing in input', () => {
    const handler = vi.fn();
    ks.register({ key: '/', handler });

    const input = document.createElement('input');
    document.body.appendChild(input);
    const event = new KeyboardEvent('keydown', { key: '/', bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    document.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
    input.remove();
  });

  it('unregister removes shortcut', () => {
    const handler = vi.fn();
    ks.register({ key: 'escape', handler });
    ks.unregister('escape');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('getAll returns registered shortcuts', () => {
    ks.register({ key: 'ctrl+k', handler: () => {}, description: 'Search' });
    ks.register({ key: '/', handler: () => {}, description: 'Focus' });
    expect(ks.getAll().length).toBe(2);
    expect(ks.getAll()[0].description).toBe('Search');
  });
});

describe('TOCHighlighter', () => {
  it('creates without error', () => {
    const toc = new TOCHighlighter({ contentSelector: 'article', tocSelector: '.toc' });
    expect(toc).toBeDefined();
    toc.destroy();
  });
});

describe('SearchAdapter', () => {
  it('custom provider calls searchFn', async () => {
    const searchFn = vi.fn().mockResolvedValue([{ url: '/a', title: 'A', excerpt: 'test' }]);
    const adapter = new SearchAdapter({ provider: 'custom', searchFn });
    await adapter.init();
    const results = await adapter.search('hello');
    expect(searchFn).toHaveBeenCalledWith('hello');
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('A');
  });

  it('returns empty for empty query', async () => {
    const adapter = new SearchAdapter({ provider: 'custom', searchFn: vi.fn() });
    const results = await adapter.search('');
    expect(results).toEqual([]);
  });
});

describe('CommentManager', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="comments"></div>'; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('mounts giscus script', () => {
    const cm = new CommentManager({
      provider: 'giscus',
      giscus: { repo: 'user/repo', repoId: 'R_1', category: 'General', categoryId: 'C_1' },
    });
    const el = document.getElementById('comments')!;
    cm.mount(el);
    const script = el.querySelector('script');
    expect(script).not.toBeNull();
    expect(script!.src).toContain('giscus.app');
    expect(script!.getAttribute('data-repo')).toBe('user/repo');
  });

  it('mounts utterances script', () => {
    const cm = new CommentManager({
      provider: 'utterances',
      utterances: { repo: 'user/repo' },
    });
    const el = document.getElementById('comments')!;
    cm.mount(el);
    const script = el.querySelector('script');
    expect(script!.src).toContain('utteranc.es');
  });
});
