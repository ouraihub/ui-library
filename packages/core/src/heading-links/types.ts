export interface HeadingLinksOptions {
  /** Heading selector. Default: 'h2, h3, h4, h5, h6' */
  selector?: string;
  /** Link symbol. Default: '#' */
  symbol?: string;
  /** CSS class for the anchor link. Default: 'heading-anchor' */
  linkClass?: string;
  /** Container to scope the query. Default: document */
  container?: HTMLElement;
}
