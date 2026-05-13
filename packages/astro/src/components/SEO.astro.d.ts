import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { SEOOptions } from '@ouraihub/core/seo';

export interface Props extends SEOOptions {
  class?: string;
}

declare const SEO: AstroComponentFactory;

export default SEO;
