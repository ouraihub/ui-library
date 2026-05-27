import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { IconName } from '@ouraihub/icons';

export interface Props {
  name: IconName;
  size?: number;
  class?: string;
}

declare const Icon: AstroComponentFactory;
export default Icon;
