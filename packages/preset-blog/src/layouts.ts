/**
 * 博客预设的布局配置
 * 
 * 定义博客场景中常用的页面布局配置。
 */

import type { LayoutConfig } from '@ouraihub/core/preset';

/**
 * 博客预设的布局配置
 * 
 * 提供：
 * - 响应式容器宽度
 * - 栅格系统配置
 * - 响应式断点
 * - 常见布局模式
 */
export const blogLayout: LayoutConfig = {
  type: 'grid',
  
  // 容器最大宽度 - 优化阅读体验
  maxWidth: '1200px',
  
  // 容器内边距
  containerPadding: 'var(--ui-space-4)',
  
  // 栅格列数
  columns: 12,
  
  // 栅格间隙
  gap: 'var(--ui-space-6)',
  
  // 响应式断点
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 布局模式配置
  layouts: {
    /**
     * 首页布局
     * - 全宽容器
     * - 文章列表网格
     * - 侧边栏（可选）
     */
    home: {
      type: 'grid',
      columns: 12,
      areas: {
        // 移动端：单列
        mobile: [
          'header header header header header header header header header header header header',
          'main main main main main main main main main main main main',
          'footer footer footer footer footer footer footer footer footer footer footer footer',
        ],
        // 桌面端：主内容 + 侧边栏
        desktop: [
          'header header header header header header header header header header header header',
          'main main main main main main main main main sidebar sidebar sidebar',
          'footer footer footer footer footer footer footer footer footer footer footer footer',
        ],
      },
      styles: {
        main: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--ui-space-6)',
        },
        sidebar: {
          position: 'sticky',
          top: 'var(--ui-space-8)',
          height: 'fit-content',
        },
      },
    },
    
    /**
     * 文章页布局
     * - 居中的阅读区域
     * - 目录侧边栏（可选）
     * - 优化的阅读宽度
     */
    article: {
      type: 'grid',
      columns: 12,
      areas: {
        // 移动端：单列
        mobile: [
          'header header header header header header header header header header header header',
          'article article article article article article article article article article article article',
          'footer footer footer footer footer footer footer footer footer footer footer footer',
        ],
        // 桌面端：目录 + 文章 + 侧边栏
        desktop: [
          'header header header header header header header header header header header header',
          'toc toc article article article article article article sidebar sidebar sidebar sidebar',
          'footer footer footer footer footer footer footer footer footer footer footer footer',
        ],
      },
      styles: {
        article: {
          maxWidth: '720px',
          margin: '0 auto',
          padding: 'var(--ui-space-8) var(--ui-space-4)',
        },
        toc: {
          position: 'sticky',
          top: 'var(--ui-space-8)',
          height: 'fit-content',
          display: 'none',
        },
        sidebar: {
          position: 'sticky',
          top: 'var(--ui-space-8)',
          height: 'fit-content',
        },
      },
      responsive: {
        lg: {
          toc: {
            display: 'block',
          },
        },
      },
    },
    
    /**
     * 归档页布局
     * - 时间线或列表视图
     * - 年份分组
     */
    archive: {
      type: 'flex',
      styles: {
        container: {
          maxWidth: '800px',
          margin: '0 auto',
          padding: 'var(--ui-space-8) var(--ui-space-4)',
        },
        timeline: {
          position: 'relative',
          paddingLeft: 'var(--ui-space-8)',
        },
      },
    },
    
    /**
     * 标签页布局
     * - 标签云
     * - 标签下的文章列表
     */
    tags: {
      type: 'grid',
      columns: 12,
      areas: {
        mobile: [
          'header header header header header header header header header header header header',
          'cloud cloud cloud cloud cloud cloud cloud cloud cloud cloud cloud cloud',
          'list list list list list list list list list list list list',
          'footer footer footer footer footer footer footer footer footer footer footer footer',
        ],
        desktop: [
          'header header header header header header header header header header header header',
          'cloud cloud cloud cloud cloud cloud cloud cloud cloud cloud cloud cloud',
          'list list list list list list list list list sidebar sidebar sidebar',
          'footer footer footer footer footer footer footer footer footer footer footer footer',
        ],
      },
      styles: {
        cloud: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--ui-space-3)',
          padding: 'var(--ui-space-8) var(--ui-space-4)',
          justifyContent: 'center',
        },
        list: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--ui-space-6)',
        },
      },
    },
  },
};
