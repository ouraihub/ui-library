import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { CommentConfig } from '@ouraihub/core';

export interface Props extends CommentConfig {
  class?: string;
}

declare const Comments: AstroComponentFactory;
export default Comments;
