export interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  viewport?: string;
  robots?: string;
  author?: string;
  charset?: string;
}

export interface OpenGraphTags {
  title?: string;
  description?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

export interface TwitterCardTags {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
}

export type SchemaOrgType = 
  | 'Article'
  | 'WebPage'
  | 'Organization'
  | 'Person'
  | 'WebSite'
  | 'BlogPosting'
  | 'NewsArticle'
  | 'Product'
  | 'Event'
  | 'BreadcrumbList';

export interface SchemaOrgData {
  '@context'?: string;
  '@type': SchemaOrgType;
  [key: string]: unknown;
}

export interface SEOOptions {
  meta?: MetaTags;
  openGraph?: OpenGraphTags;
  twitter?: TwitterCardTags;
  canonical?: string;
  schema?: SchemaOrgData | SchemaOrgData[];
  hreflang?: Array<{ lang: string; url: string }>;
}
