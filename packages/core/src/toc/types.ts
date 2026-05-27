export interface TOCOptions {
  /** Content container selector. Default: 'article' */
  contentSelector?: string;
  /** Heading selector. Default: 'h2, h3, h4' */
  headingSelector?: string;
  /** TOC container selector */
  tocSelector?: string;
  /** Active class name. Default: 'active' */
  activeClass?: string;
  /** Root margin offset. Default: '0px 0px -70% 0px' */
  rootMargin?: string;
}
