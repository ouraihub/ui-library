import type { Preset } from '@ouraihub/core/preset';
import { blogTokens } from './tokens';
import { blogComponents } from './components';
import { blogLayout } from './layouts';

export const blogPreset: Preset = {
  options: {
    name: 'blog',
    version: '0.1.0',
    description: '博客场景的预设配置，提供优化的阅读体验和常用组件配置',
    author: '@ouraihub',
    tags: ['blog', 'content', 'reading'],
    isDefault: false,
  },
  
  tokens: blogTokens,
  components: blogComponents,
  layout: blogLayout,
};

export { blogTokens } from './tokens';
export { blogComponents } from './components';
export { blogLayout } from './layouts';
export type * from '@ouraihub/core/preset';
