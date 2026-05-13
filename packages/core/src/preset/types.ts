/**
 * Design Tokens 接口 - 定义设计系统的基础令牌
 * 包括颜色、间距、字体、阴影等设计元素
 */
export interface DesignTokens {
  /** 颜色令牌配置 */
  colors?: Record<string, string | Record<string, string>>;
  
  /** 间距令牌配置（padding、margin 等） */
  spacing?: Record<string, string | number>;
  
  /** 字体配置 */
  typography?: {
    fontFamily?: Record<string, string>;
    fontSize?: Record<string, string | number>;
    fontWeight?: Record<string, number>;
    lineHeight?: Record<string, number | string>;
    letterSpacing?: Record<string, string | number>;
  };
  
  /** 阴影配置 */
  shadows?: Record<string, string>;
  
  /** 圆角配置 */
  borderRadius?: Record<string, string | number>;
  
  /** 过渡/动画配置 */
  transitions?: Record<string, string>;
  
  /** 其他自定义令牌 */
  [key: string]: unknown;
}

/**
 * 组件配置接口 - 定义单个组件的预设配置
 */
export interface ComponentConfig {
  /** 组件名称 */
  name: string;
  
  /** 组件是否启用 */
  enabled?: boolean;
  
  /** 组件的默认属性 */
  defaults?: Record<string, unknown>;
  
  /** 组件的样式覆盖 */
  styles?: Record<string, string | Record<string, string>>;
  
  /** 组件的变体配置 */
  variants?: Record<string, Record<string, unknown>>;
  
  /** 其他组件特定配置 */
  [key: string]: unknown;
}

/**
 * 布局配置接口 - 定义布局系统的预设配置
 */
export interface LayoutConfig {
  /** 布局类型（grid、flex 等） */
  type?: 'grid' | 'flex' | 'stack' | string;
  
  /** 容器最大宽度 */
  maxWidth?: string | number;
  
  /** 容器内边距 */
  containerPadding?: string | number;
  
  /** 栅格列数 */
  columns?: number;
  
  /** 栅格间隙 */
  gap?: string | number;
  
  /** 响应式断点配置 */
  breakpoints?: Record<string, string | number>;
  
  /** 其他布局配置 */
  [key: string]: unknown;
}

/**
 * 预设选项接口 - 定义预设的配置选项
 */
export interface PresetOptions {
  /** 预设名称 */
  name: string;
  
  /** 预设版本 */
  version?: string;
  
  /** 预设描述 */
  description?: string;
  
  /** 预设作者 */
  author?: string;
  
  /** 预设的标签/分类 */
  tags?: string[];
  
  /** 是否为默认预设 */
  isDefault?: boolean;
  
  /** 预设的依赖预设 */
  extends?: string | string[];
  
  /** 其他预设选项 */
  [key: string]: unknown;
}

/**
 * Preset 接口 - 预设系统的主接口
 * 
 * 预设是配置、插件和工具的预定义组合，提供开箱即用的完整解决方案。
 * 遵循六层架构中的 Layer 4: Presets 设计。
 * 
 * @example
 * ```typescript
 * const blogPreset: Preset = {
 *   options: {
 *     name: 'blog',
 *     description: 'Blog preset with optimized components',
 *   },
 *   tokens: {
 *     colors: { primary: '#0066cc' },
 *   },
 *   components: [
 *     { name: 'Card', enabled: true },
 *     { name: 'Button', defaults: { size: 'md' } },
 *   ],
 *   layout: {
 *     type: 'grid',
 *     columns: 12,
 *   },
 * };
 * ```
 */
export interface Preset {
  /** 预设的基本选项和元数据 */
  options: PresetOptions;
  
  /** 设计令牌配置 */
  tokens?: DesignTokens;
  
  /** 组件配置列表 */
  components?: ComponentConfig[];
  
  /** 布局配置 */
  layout?: LayoutConfig;
  
  /** 插件配置 */
  plugins?: Record<string, unknown>;
  
  /** 工具配置 */
  tools?: Record<string, unknown>;
  
  /** 其他预设配置 */
  [key: string]: unknown;
}
