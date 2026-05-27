import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TerminalPlayer } from '../../src/terminal-player';
import { createLogger } from '../../src/logger';
import { TOCHighlighter } from '../../src/toc';
import { copyLink } from '../../src/share';

describe('TerminalPlayer', () => {
  it('constructs with options', () => {
    const player = new TerminalPlayer({ src: '/test.cast' });
    expect(player).toBeDefined();
  });

  it('mount loads assets and handles missing AsciinemaPlayer', async () => {
    const player = new TerminalPlayer({ src: '/test.cast', cdnBase: '/fake' });
    const el = document.createElement('div');

    // Mock script loading to resolve immediately
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'script') {
        setTimeout(() => el.onload?.(new Event('load')), 0);
      }
      return el;
    });

    await player.mount(el);
    // AsciinemaPlayer not on window, so player stays null
    expect(el.children.length).toBe(0);
    vi.restoreAllMocks();
  });

  it('destroy is safe when no player', () => {
    const player = new TerminalPlayer({ src: '/test.cast' });
    expect(() => player.destroy()).not.toThrow();
  });

  it('destroy calls dispose on player', async () => {
    const dispose = vi.fn();
    const player = new TerminalPlayer({ src: '/test.cast' });
    // @ts-expect-error - accessing private for test
    player.player = { dispose };
    player.destroy();
    expect(dispose).toHaveBeenCalled();
  });
});

describe('createLogger', () => {
  it('creates logger with default options', () => {
    const logger = createLogger();
    expect(logger.debug).toBeInstanceOf(Function);
    expect(logger.info).toBeInstanceOf(Function);
    expect(logger.warn).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
  });

  it('logs at correct levels', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger({ level: 'info', enableConsole: true });
    logger.info('test message');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('respects log level filtering', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = createLogger({ level: 'warn', enableConsole: true });
    logger.debug('should not appear');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('supports context', () => {
    const logger = createLogger({ context: { service: 'test' } });
    expect(logger.getContext()).toEqual({ service: 'test' });
  });

  it('setContext merges context', () => {
    const logger = createLogger({ context: { a: 1 } });
    logger.setContext({ b: 2 });
    expect(logger.getContext()).toEqual({ a: 1, b: 2 });
  });

  it('clearContext resets', () => {
    const logger = createLogger({ context: { a: 1 } });
    logger.clearContext();
    expect(logger.getContext()).toEqual({});
  });

  it('child creates new logger with merged context', () => {
    const parent = createLogger({ context: { service: 'app' } });
    const child = parent.child({ component: 'btn' });
    expect(child.getContext()).toEqual({ service: 'app', component: 'btn' });
  });

  it('masks sensitive fields', () => {
    const output = vi.fn();
    const logger = createLogger({ output, enableConsole: false });
    logger.info('login', { password: 'secret123', user: 'admin' });
    expect(output).toHaveBeenCalledWith(expect.objectContaining({ password: '***', user: 'admin' }));
  });

  it('supports json format', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger({ format: 'json', enableConsole: true });
    logger.info('test');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('"msg":"test"'));
    spy.mockRestore();
  });

  it('error level logs correctly', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = createLogger({ enableConsole: true });
    logger.error('fail', { code: 500 });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('warn level logs correctly', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = createLogger({ enableConsole: true });
    logger.warn('caution');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('TOCHighlighter', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <article>
        <h2 id="intro">Intro</h2>
        <p>Content</p>
        <h3 id="details">Details</h3>
        <p>More content</p>
      </article>
      <nav class="toc">
        <a href="#intro">Intro</a>
        <a href="#details">Details</a>
      </nav>
    `;
  });

  afterEach(() => { document.body.innerHTML = ''; });

  it('initializes and observes headings', () => {
    const toc = new TOCHighlighter({ contentSelector: 'article', tocSelector: '.toc' });
    toc.init();
    // Observer should be set up (no error)
    toc.destroy();
  });

  it('does nothing without content element', () => {
    document.body.innerHTML = '<nav class="toc"></nav>';
    const toc = new TOCHighlighter({ contentSelector: 'article', tocSelector: '.toc' });
    toc.init(); // should not throw
    toc.destroy();
  });

  it('does nothing without headings', () => {
    document.body.innerHTML = '<article><p>No headings</p></article><nav class="toc"></nav>';
    const toc = new TOCHighlighter({ contentSelector: 'article', tocSelector: '.toc' });
    toc.init();
    toc.destroy();
  });

  it('destroy is safe when not initialized', () => {
    const toc = new TOCHighlighter();
    expect(() => toc.destroy()).not.toThrow();
  });
});

describe('copyLink', () => {
  it('returns false when clipboard unavailable', async () => {
    const result = await copyLink('https://example.com');
    // jsdom doesn't have clipboard
    expect(result).toBe(false);
  });
});
