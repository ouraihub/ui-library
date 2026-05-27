import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export interface Props {
  selector?: string;
  class?: string;
}

declare const CodeCopy: AstroComponentFactory;
export default CodeCopy;
