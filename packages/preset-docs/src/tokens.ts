import type { DesignTokens } from '@ouraihub/core/preset';

/**
 * 文档站点专用设计令牌
 * 
 * 针对文档场景优化，强调：
 * - 可读性：更大的字体、更宽松的行高
 * - 层次感：清晰的标题层级
 * - 代码展示：优化的代码块样式
 * - 导航体验：侧边栏和目录的视觉设计
 */
export const docsTokens: DesignTokens = {
  colors: {
    // 文档主色调 - 专业、可信赖
    primary: {
      base: 'hsl(212, 100%, 48%)',
      light: 'hsl(212, 100%, 96%)',
      dark: 'hsl(212, 100%, 35%)',
    },
    
    // 代码高亮色
    code: {
      background: 'hsl(220, 13%, 18%)',
      text: 'hsl(220, 14%, 96%)',
      comment: 'hsl(220, 10%, 50%)',
      keyword: 'hsl(207, 82%, 66%)',
      string: 'hsl(95, 38%, 62%)',
      function: 'hsl(286, 60%, 67%)',
      variable: 'hsl(29, 54%, 61%)',
    },
    
    // 语义化颜色 - 警告框
    note: {
      background: 'hsl(212, 100%, 96%)',
      border: 'hsl(212, 100%, 48%)',
      text: 'hsl(212, 100%, 35%)',
    },
    tip: {
      background: 'hsl(142, 76%, 96%)',
      border: 'hsl(142, 76%, 36%)',
      text: 'hsl(142, 76%, 25%)',
    },
    warning: {
      background: 'hsl(38, 92%, 96%)',
      border: 'hsl(38, 92%, 50%)',
      text: 'hsl(38, 92%, 30%)',
    },
    danger: {
      background: 'hsl(0, 84%, 96%)',
      border: 'hsl(0, 84%, 60%)',
      text: 'hsl(0, 84%, 40%)',
    },
    
    // 侧边栏和导航
    sidebar: {
      background: 'hsl(0, 0%, 98%)',
      border: 'hsl(0, 0%, 90%)',
      active: 'hsl(212, 100%, 48%)',
      hover: 'hsl(212, 100%, 96%)',
    },
  },
  
  spacing: {
    // 文档内容间距 - 更宽松
    'content-xs': '0.5rem',    // 8px
    'content-sm': '1rem',      // 16px
    'content-md': '1.5rem',    // 24px
    'content-lg': '2rem',      // 32px
    'content-xl': '3rem',      // 48px
    'content-2xl': '4rem',     // 64px
    
    // 侧边栏宽度
    'sidebar-width': '16rem',  // 256px
    'sidebar-collapsed': '4rem', // 64px
    
    // 目录宽度
    'toc-width': '14rem',      // 224px
    
    // 内容最大宽度
    'content-max-width': '48rem', // 768px
    'full-max-width': '80rem',    // 1280px
  },
  
  typography: {
    fontFamily: {
      // 文档正文字体 - 优化可读性
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      // 代码字体
      code: '"Fira Code", "Cascadia Code", "JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
      // 标题字体
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    
    fontSize: {
      // 正文字体 - 更大以提升可读性
      'body-sm': '0.875rem',   // 14px
      'body-base': '1rem',     // 16px
      'body-lg': '1.125rem',   // 18px
      
      // 标题层级 - 清晰的视觉层次
      'h1': '2.5rem',          // 40px
      'h2': '2rem',            // 32px
      'h3': '1.5rem',          // 24px
      'h4': '1.25rem',         // 20px
      'h5': '1.125rem',        // 18px
      'h6': '1rem',            // 16px
      
      // 代码字体
      'code-sm': '0.875rem',   // 14px
      'code-base': '0.9375rem', // 15px
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      // 更宽松的行高提升可读性
      tight: 1.25,
      normal: 1.6,
      relaxed: 1.75,
      loose: 2,
      
      // 标题行高
      heading: 1.3,
      
      // 代码行高
      code: 1.7,
    },
    
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.01em',
    },
  },
  
  shadows: {
    // 卡片和浮层阴影
    'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
  },
  
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
