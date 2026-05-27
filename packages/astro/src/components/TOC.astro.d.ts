import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export interface Props {
  headings: { id: string; text: string; depth: number }[];
  class?: string;
}

declare const TOC: AstroComponentFactory;
export default TOC;
