import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export interface Props {
  class?: string;
}

declare const ReadingProgress: AstroComponentFactory;
export default ReadingProgress;
