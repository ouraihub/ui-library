/**
 * 博客预设的组件配置
 * 
 * 定义博客场景中常用组件的默认配置和样式。
 */

import type { ComponentConfig } from '@ouraihub/core/preset';

/**
 * 博客预设的组件配置列表
 * 
 * 包含：
 * - 文章卡片（ArticleCard）
 * - 标签（Tag）
 * - 分页（Pagination）
 * - 评论区（Comments）
 * - 目录（TableOfContents）
 * - 作者信息（AuthorBio）
 * - 相关文章（RelatedPosts）
 */
export const blogComponents: ComponentConfig[] = [
  {
    name: 'ArticleCard',
    enabled: true,
    defaults: {
      showExcerpt: true,
      showThumbnail: true,
      showMeta: true,
      showTags: true,
      excerptLength: 150,
    },
    styles: {
      container: {
        padding: 'var(--ui-space-6)',
        borderRadius: 'var(--ui-radius-lg)',
        boxShadow: 'var(--ui-shadow-sm)',
        transition: 'var(--ui-transition-base)',
      },
      title: {
        fontSize: 'var(--ui-text-xl)',
        fontWeight: 'var(--ui-font-weight-bold)',
        lineHeight: 'var(--ui-line-height-tight)',
        marginBottom: 'var(--ui-space-3)',
      },
      excerpt: {
        fontSize: 'var(--ui-text-base)',
        lineHeight: 'var(--ui-line-height-relaxed)',
        color: 'var(--ui-text-secondary)',
      },
    },
    variants: {
      featured: {
        showThumbnail: true,
        thumbnailSize: 'large',
        styles: {
          container: {
            background: 'var(--ui-primary-light)',
            border: '2px solid var(--ui-primary)',
          },
        },
      },
      compact: {
        showExcerpt: false,
        showThumbnail: false,
        styles: {
          container: {
            padding: 'var(--ui-space-4)',
          },
        },
      },
    },
  },
  
  {
    name: 'Tag',
    enabled: true,
    defaults: {
      variant: 'default',
      size: 'sm',
      clickable: true,
    },
    styles: {
      container: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: 'var(--ui-space-1) var(--ui-space-3)',
        borderRadius: 'var(--ui-radius-sm)',
        fontSize: 'var(--ui-text-sm)',
        fontWeight: 'var(--ui-font-weight-medium)',
        transition: 'var(--ui-transition-fast)',
      },
    },
    variants: {
      default: {
        styles: {
          container: {
            background: 'var(--ui-surface)',
            color: 'var(--ui-text)',
            border: '1px solid var(--ui-border)',
          },
        },
      },
      primary: {
        styles: {
          container: {
            background: 'var(--ui-primary)',
            color: 'white',
          },
        },
      },
      outlined: {
        styles: {
          container: {
            background: 'transparent',
            color: 'var(--ui-text)',
            border: '1px solid var(--ui-border)',
          },
        },
      },
    },
  },
  
  {
    name: 'Pagination',
    enabled: true,
    defaults: {
      showFirstLast: true,
      showPrevNext: true,
      maxPages: 7,
      variant: 'default',
    },
    styles: {
      container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--ui-space-2)',
        marginTop: 'var(--ui-space-8)',
      },
      button: {
        padding: 'var(--ui-space-2) var(--ui-space-4)',
        borderRadius: 'var(--ui-radius-md)',
        fontSize: 'var(--ui-text-base)',
        fontWeight: 'var(--ui-font-weight-medium)',
        transition: 'var(--ui-transition-fast)',
        border: '1px solid var(--ui-border)',
      },
      active: {
        background: 'var(--ui-primary)',
        color: 'white',
        borderColor: 'var(--ui-primary)',
      },
    },
  },
  
  {
    name: 'Comments',
    enabled: true,
    defaults: {
      provider: 'native',
      showAvatar: true,
      showReplyButton: true,
      maxDepth: 3,
      sortBy: 'newest',
    },
    styles: {
      container: {
        marginTop: 'var(--ui-space-12)',
        paddingTop: 'var(--ui-space-8)',
        borderTop: '1px solid var(--ui-border)',
      },
      comment: {
        padding: 'var(--ui-space-4)',
        marginBottom: 'var(--ui-space-4)',
        borderRadius: 'var(--ui-radius-md)',
        background: 'var(--ui-surface)',
      },
    },
  },
  
  {
    name: 'TableOfContents',
    enabled: true,
    defaults: {
      maxDepth: 3,
      showNumbers: false,
      sticky: true,
      highlightActive: true,
    },
    styles: {
      container: {
        padding: 'var(--ui-space-6)',
        borderRadius: 'var(--ui-radius-lg)',
        background: 'var(--ui-surface)',
        border: '1px solid var(--ui-border)',
      },
      link: {
        display: 'block',
        padding: 'var(--ui-space-2) var(--ui-space-3)',
        fontSize: 'var(--ui-text-sm)',
        color: 'var(--ui-text-secondary)',
        transition: 'var(--ui-transition-fast)',
      },
      active: {
        color: 'var(--ui-primary)',
        fontWeight: 'var(--ui-font-weight-semibold)',
      },
    },
  },
  
  {
    name: 'AuthorBio',
    enabled: true,
    defaults: {
      showAvatar: true,
      showSocial: true,
      showBio: true,
      avatarSize: 'md',
    },
    styles: {
      container: {
        display: 'flex',
        gap: 'var(--ui-space-4)',
        padding: 'var(--ui-space-6)',
        borderRadius: 'var(--ui-radius-lg)',
        background: 'var(--ui-surface)',
        marginTop: 'var(--ui-space-8)',
      },
      name: {
        fontSize: 'var(--ui-text-lg)',
        fontWeight: 'var(--ui-font-weight-bold)',
        marginBottom: 'var(--ui-space-2)',
      },
      bio: {
        fontSize: 'var(--ui-text-base)',
        lineHeight: 'var(--ui-line-height-relaxed)',
        color: 'var(--ui-text-secondary)',
      },
    },
  },
  
  {
    name: 'RelatedPosts',
    enabled: true,
    defaults: {
      count: 3,
      algorithm: 'tags',
      showThumbnail: true,
      layout: 'grid',
    },
    styles: {
      container: {
        marginTop: 'var(--ui-space-12)',
        paddingTop: 'var(--ui-space-8)',
        borderTop: '1px solid var(--ui-border)',
      },
      grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--ui-space-6)',
      },
    },
  },
];
