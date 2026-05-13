import type { LayoutConfig } from '@ouraihub/core/preset';

/**
 * 文档页面布局配置
 */
export const docsLayout: LayoutConfig = {
  type: 'flex',
  maxWidth: '80rem',
  containerPadding: 'var(--ui-space-6)',
  gap: 'var(--ui-space-6)',
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  
  areas: {
    sidebar: {
      width: '16rem',
      minWidth: '12rem',
      maxWidth: '20rem',
      display: {
        default: 'block',
        mobile: 'none',
      },
    },
    
    content: {
      flex: 1,
      minWidth: 0,
      maxWidth: '48rem',
      padding: 'var(--ui-space-6)',
    },
    
    toc: {
      width: '14rem',
      minWidth: '12rem',
      display: {
        default: 'block',
        tablet: 'none',
      },
    },
  },
};

/**
 * API 参考页布局配置
 */
export const apiReferenceLayout: LayoutConfig = {
  type: 'flex',
  maxWidth: '80rem',
  containerPadding: 'var(--ui-space-6)',
  gap: 'var(--ui-space-8)',
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  
  areas: {
    sidebar: {
      width: '16rem',
      display: {
        default: 'block',
        mobile: 'none',
      },
    },
    
    content: {
      flex: 1,
      minWidth: 0,
      maxWidth: '60rem',
      padding: 'var(--ui-space-6)',
    },
  },
};

/**
 * 搜索页布局配置
 */
export const searchLayout: LayoutConfig = {
  type: 'stack',
  maxWidth: '48rem',
  containerPadding: 'var(--ui-space-6)',
  gap: 'var(--ui-space-4)',
  
  breakpoints: {
    sm: '640px',
    md: '768px',
  },
  
  areas: {
    searchBar: {
      width: '100%',
      padding: 'var(--ui-space-4)',
    },
    
    results: {
      width: '100%',
      padding: 'var(--ui-space-4)',
    },
  },
};

/**
 * 全宽布局配置（用于首页等）
 */
export const fullWidthLayout: LayoutConfig = {
  type: 'stack',
  maxWidth: '100%',
  containerPadding: 0,
  gap: 0,
  
  areas: {
    hero: {
      width: '100%',
      padding: 'var(--ui-space-16) var(--ui-space-6)',
    },
    
    content: {
      width: '100%',
      maxWidth: '80rem',
      margin: '0 auto',
      padding: 'var(--ui-space-12) var(--ui-space-6)',
    },
  },
};
