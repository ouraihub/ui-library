import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export interface Props {
  shortcuts?: { key: string; description?: string }[];
}

declare const KeyboardShortcuts: AstroComponentFactory;
export default KeyboardShortcuts;
