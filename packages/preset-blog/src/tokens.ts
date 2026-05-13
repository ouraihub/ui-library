/**
 * 博客预设的设计令牌配置
 * 
 * 提供适合博客场景的颜色、字体、间距等设计令牌。
 * 基于 @ouraihub/tokens 的基础令牌进行扩展和定制。
 */

import type { DesignTokens } from '@ouraihub/core/preset';

/**
 * 博客预设的设计令牌
 * 
 * 特点：
 * - 优化的阅读体验（更大的字号、更宽松的行高）
 * - 适合长文本的颜色对比度
 * - 清晰的视觉层次
 */
export const blogTokens: DesignTokens = {
  colors: {
    // 品牌色 - 使用温暖的蓝色，适合博客场景
    brand: {
      primary: 'hsl(210, 100%, 50%)',
      primaryLight: 'hsl(210, 100%, 97%)',
      primaryDark: 'hsl(210, 100%, 30%)',
    },
    
    // 内容色 - 优化阅读体验
    content: {
      heading: 'hsl(0, 0%, 10%)',
      body: 'hsl(0, 0%, 20%)',
      muted: 'hsl(0, 0%, 50%)',
      link: 'hsl(210, 100%, 50%)',
      linkHover: 'hsl(210, 100%, 40%)',
    },
    
    // 语义色 - 用于标签、徽章等
    semantic: {
      featured: 'hsl(45, 100%, 51%)',
      new: 'hsl(142, 76%, 36%)',
      popular: 'hsl(0, 84%, 60%)',
      archived: 'hsl(0, 0%, 65%)',
    },
  },
  
  spacing: {
    // 文章内容间距
    articleGap: '2rem',
    sectionGap: '4rem',
    
    // 卡片间距
    cardPadding: '1.5rem',
    cardGap: '1.5rem',
    
    // 容器间距
    containerPadding: '1rem',
    containerPaddingLg: '2rem',
  },
  
  typography: {
    fontFamily: {
      // 正文字体 - 优化阅读体验
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      
      // 标题字体 - 更有个性
      heading: '"Georgia", "Times New Roman", serif',
      
      // 代码字体
      code: '"Fira Code", "Cascadia Code", "Consolas", monospace',
    },
    
    fontSize: {
      // 文章标题
      articleTitle: '2.5rem',
      
      // 文章正文 - 更大的字号提升阅读体验
      articleBody: '1.125rem',
      
      // 元信息（日期、作者等）
      meta: '0.875rem',
      
      // 标签
      tag: '0.8125rem',
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      // 标题行高 - 紧凑
      heading: 1.2,
      
      // 正文行高 - 宽松，提升阅读体验
      body: 1.75,
      
      // 代码行高
      code: 1.6,
    },
    
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
    },
  },
  
  shadows: {
    // 卡片阴影
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
    cardHover: '0 4px 16px rgba(0, 0, 0, 0.12)',
    
    // 浮动元素阴影
    floating: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  
  borderRadius: {
    card: '0.75rem',
    tag: '0.25rem',
    image: '0.5rem',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};
