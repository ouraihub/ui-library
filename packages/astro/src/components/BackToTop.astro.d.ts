import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export interface Props {
  threshold?: number;
  class?: string;
}

declare const BackToTop: AstroComponentFactory;
export default BackToTop;
