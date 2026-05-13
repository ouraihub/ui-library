import type { Preset } from '@ouraihub/core/preset';
import { docsTokens } from './tokens';
import { docsComponents } from './components';
import { docsLayout } from './layouts';

/**
 * 文档站点预设配置
 * 
 * 提供开箱即用的文档站点解决方案，包含：
 * - 优化可读性的设计令牌
 * - 文档场景专用组件（侧边栏、目录、代码块、警告框等）
 * - 响应式布局配置
 * 
 * @example
 * ```typescript
 * import { docsPreset } from '@ouraihub/preset-docs';
 * 
 * const config = {
 *   presets: [docsPreset],
 * };
 * ```
 */
export const docsPreset: Preset = {
  options: {
    name: 'docs',
    version: '0.1.0',
    description: 'Documentation site preset with optimized readability and navigation',
    author: '@ouraihub',
    tags: ['documentation', 'docs', 'technical-writing', 'api-reference'],
    isDefault: false,
  },
  
  tokens: docsTokens,
  components: docsComponents,
  layout: docsLayout,
};

export { docsTokens } from './tokens';
export { docsComponents } from './components';
export { 
  docsLayout, 
  apiReferenceLayout, 
  searchLayout, 
  fullWidthLayout 
} from './layouts';

export default docsPreset;
