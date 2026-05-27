import { CodeCopyManager, BackToTop, ReadingProgress, TOCHighlighter, CommentManager, createLogger } from '@ouraihub/core';
import type { CommentConfig } from '@ouraihub/core';
import { initComponents } from './registry';

const logger = createLogger({ context: { module: 'ouraihub-hugo' } });

// Back to top
initComponents('back-to-top', (el, config) => {
  const btt = new BackToTop({
    threshold: config.threshold ?? 0.3,
    onShow: () => el.classList.remove('hidden'),
    onHide: () => el.classList.add('hidden'),
  });
  btt.init();
  el.addEventListener('click', () => btt.scrollToTop());
  logger.debug('BackToTop initialized', { threshold: config.threshold });
});

// Reading progress
initComponents('reading-progress', (el) => {
  new ReadingProgress({
    onProgress: (p) => { el.style.width = `${p * 100}%`; },
  }).init();
  logger.debug('ReadingProgress initialized');
});

// TOC highlighting
initComponents('toc', (el) => {
  const selector = el.id ? `#${el.id}` : '[data-controller="toc"]';
  new TOCHighlighter({ tocSelector: selector }).init();
  logger.debug('TOC highlighter initialized');
});

// Code copy
initComponents('code-copy', (_el, config) => {
  new CodeCopyManager({ selector: config.selector ?? 'pre' }).init();
  logger.debug('CodeCopy initialized');
});

// Comments
initComponents('comments', (el, config) => {
  if (!config.provider) { logger.warn('Comments: no provider in config'); return; }
  try {
    new CommentManager(config as CommentConfig).mount(el);
    logger.debug('Comments mounted', { provider: config.provider });
  } catch (err) {
    logger.error('Failed to mount comments', { error: String(err) });
  }
});
