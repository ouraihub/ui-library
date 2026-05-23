import type { HeadingLinksOptions } from './types';

const DEFAULTS: Required<Omit<HeadingLinksOptions, 'container'>> = {
  selector: 'h2, h3, h4, h5, h6',
  symbol: '#',
  linkClass: 'heading-anchor',
};

export function initHeadingLinks(options?: HeadingLinksOptions): () => void {
  if (typeof window === 'undefined') return () => {};

  const opts = { ...DEFAULTS, ...options };
  const root = options?.container || document;
  const headings = root.querySelectorAll<HTMLElement>(opts.selector);
  const links: HTMLAnchorElement[] = [];

  headings.forEach((heading) => {
    if (!heading.id) return;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = opts.symbol;
    link.className = opts.linkClass;
    link.setAttribute('aria-hidden', 'true');
    heading.appendChild(link);
    links.push(link);
  });

  // Return cleanup function
  return () => { links.forEach((link) => link.remove()); };
}
