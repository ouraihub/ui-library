import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { SharePlatform } from '@ouraihub/core';

export interface Props {
  url: string;
  title: string;
  platforms?: SharePlatform[];
  class?: string;
}

declare const ShareLinks: AstroComponentFactory;
export default ShareLinks;
