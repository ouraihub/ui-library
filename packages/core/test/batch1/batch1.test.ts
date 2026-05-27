import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CodeCopyManager } from '../../src/code-copy';
import { BackToTop } from '../../src/back-to-top';
import { initHeadingLinks } from '../../src/heading-links';
import { ReadingProgress } from '../../src/reading-progress';

describe('CodeCopyManager', () => {
  beforeEach(() => {
    document.body.innerHTML = '<pre><code>const x = 1;</code></pre><pre><code>hello</code></pre>';
  });

  afterEach(() => { document.body.innerHTML = ''; });

  it('attaches copy buttons to pre blocks on init', () => {
    const mgr = new CodeCopyManager();
    mgr.init();
    const buttons = document.querySelectorAll('.code-copy-btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe('Copy');
    expect(buttons[0].getAttribute('data-state')).toBe('idle');
    mgr.destroy();
  });

  it('removes buttons on destroy', () => {
    const mgr = new CodeCopyManager();
    mgr.init();
    mgr.destroy();
    expect(document.querySelectorAll('.code-copy-btn').length).toBe(0);
  });

  it('respects custom options', () => {
    const mgr = new CodeCopyManager({ buttonLabel: 'コピー', buttonClass: 'my-btn' });
    mgr.init();
    const btn = document.querySelector('.my-btn');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toBe('コピー');
    mgr.destroy();
  });
});

describe('BackToTop', () => {
  it('calls onShow/onHide based on scroll threshold', () => {
    const onShow = vi.fn();
    const onHide = vi.fn();
    const btt = new BackToTop({ threshold: 0.3, onShow, onHide });
    btt.init();

    // Simulate scroll past threshold
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, configurable: true });

    window.dispatchEvent(new Event('scroll'));

    btt.destroy();
  });

  it('getScrollPercent returns 0 when no scroll', () => {
    const btt = new BackToTop();
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 0, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 800, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, configurable: true });
    expect(btt.getScrollPercent()).toBe(0);
  });
});

describe('initHeadingLinks', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <h2 id="intro">Intro</h2>
      <h3 id="details">Details</h3>
      <h4>No ID</h4>
    `;
  });

  afterEach(() => { document.body.innerHTML = ''; });

  it('appends anchor links to headings with id', () => {
    const cleanup = initHeadingLinks();
    const links = document.querySelectorAll('.heading-anchor');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('#intro');
    expect(links[0].textContent).toBe('#');
    expect(links[0].getAttribute('aria-hidden')).toBe('true');
    cleanup();
  });

  it('cleanup removes all links', () => {
    const cleanup = initHeadingLinks();
    expect(document.querySelectorAll('.heading-anchor').length).toBe(2);
    cleanup();
    expect(document.querySelectorAll('.heading-anchor').length).toBe(0);
  });

  it('skips headings without id', () => {
    const cleanup = initHeadingLinks({ selector: 'h2, h3, h4' });
    // h4 has no id, should be skipped
    expect(document.querySelectorAll('.heading-anchor').length).toBe(2);
    cleanup();
  });

  it('respects custom symbol', () => {
    const cleanup = initHeadingLinks({ symbol: '¶' });
    expect(document.querySelector('.heading-anchor')!.textContent).toBe('¶');
    cleanup();
  });
});

describe('ReadingProgress', () => {
  it('calls onProgress with 0 when no scrollable content', () => {
    const onProgress = vi.fn();
    const rp = new ReadingProgress({ onProgress });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 0, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 800, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, configurable: true });
    rp.init();
    expect(onProgress).toHaveBeenCalledWith(0);
    rp.destroy();
  });

  it('calls onProgress with correct percent on scroll', () => {
    const onProgress = vi.fn();
    const rp = new ReadingProgress({ onProgress });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 600, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, configurable: true });
    rp.init();
    expect(onProgress).toHaveBeenCalledWith(0.5);
    rp.destroy();
  });

  it('destroy removes listener', () => {
    const onProgress = vi.fn();
    const rp = new ReadingProgress({ onProgress });
    rp.init();
    rp.destroy();
    onProgress.mockClear();
    window.dispatchEvent(new Event('scroll'));
    expect(onProgress).not.toHaveBeenCalled();
  });
});
