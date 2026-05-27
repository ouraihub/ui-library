export interface HeadingLinksOptions {
  selector?: string;
  symbol?: string;
  linkClass?: string;
  container?: Element | Document;
}

export function initHeadingLinks(options?: HeadingLinksOptions): () => void {
  const opts = {
    selector: 'h2, h3, h4, h5, h6',
    symbol: '#',
    linkClass: 'heading-anchor',
    ...options,
  };
  const root = opts.container || document;
  const headings = root.querySelectorAll(opts.selector);
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

  return () => { links.forEach((link) => link.remove()); };
}
