import type { ComponentConfig } from '@ouraihub/core/preset';

/**
 * 文档站点组件配置
 * 
 * 提供文档场景常用组件的预设配置
 */
export const docsComponents: ComponentConfig[] = [
  {
    name: 'Sidebar',
    enabled: true,
    defaults: {
      width: '16rem',
      collapsible: true,
      position: 'left',
      sticky: true,
    },
    styles: {
      background: 'var(--ui-sidebar-background)',
      border: '1px solid var(--ui-sidebar-border)',
      padding: 'var(--ui-space-4)',
    },
    variants: {
      collapsed: {
        width: '4rem',
      },
      floating: {
        position: 'fixed',
        shadow: 'var(--ui-shadow-dropdown)',
      },
    },
  },
  
  {
    name: 'TableOfContents',
    enabled: true,
    defaults: {
      width: '14rem',
      position: 'right',
      sticky: true,
      maxDepth: 3,
    },
    styles: {
      fontSize: 'var(--ui-text-sm)',
      lineHeight: 'var(--ui-line-height-relaxed)',
    },
    variants: {
      compact: {
        maxDepth: 2,
        fontSize: 'var(--ui-text-xs)',
      },
    },
  },
  
  {
    name: 'CodeBlock',
    enabled: true,
    defaults: {
      theme: 'dark',
      showLineNumbers: true,
      copyButton: true,
      highlightLines: [],
    },
    styles: {
      background: 'var(--ui-code-background)',
      color: 'var(--ui-code-text)',
      fontFamily: 'var(--ui-font-mono)',
      fontSize: 'var(--ui-code-base)',
      lineHeight: 'var(--ui-line-height-code)',
      borderRadius: 'var(--ui-radius-lg)',
      padding: 'var(--ui-space-4)',
    },
    variants: {
      inline: {
        display: 'inline',
        padding: '0.125rem 0.375rem',
        borderRadius: 'var(--ui-radius-sm)',
      },
    },
  },
  
  {
    name: 'Callout',
    enabled: true,
    defaults: {
      type: 'note',
      icon: true,
      collapsible: false,
    },
    styles: {
      borderRadius: 'var(--ui-radius-md)',
      padding: 'var(--ui-space-4)',
      borderLeft: '4px solid',
    },
    variants: {
      note: {
        background: 'var(--ui-note-background)',
        borderColor: 'var(--ui-note-border)',
        color: 'var(--ui-note-text)',
      },
      tip: {
        background: 'var(--ui-tip-background)',
        borderColor: 'var(--ui-tip-border)',
        color: 'var(--ui-tip-text)',
      },
      warning: {
        background: 'var(--ui-warning-background)',
        borderColor: 'var(--ui-warning-border)',
        color: 'var(--ui-warning-text)',
      },
      danger: {
        background: 'var(--ui-danger-background)',
        borderColor: 'var(--ui-danger-border)',
        color: 'var(--ui-danger-text)',
      },
    },
  },
  
  {
    name: 'Breadcrumb',
    enabled: true,
    defaults: {
      separator: '/',
      showHome: true,
      maxItems: 5,
    },
    styles: {
      fontSize: 'var(--ui-text-sm)',
      color: 'var(--ui-text-secondary)',
      padding: 'var(--ui-space-2) 0',
    },
    variants: {
      compact: {
        maxItems: 3,
        separator: '>',
      },
    },
  },
  
  {
    name: 'SearchModal',
    enabled: true,
    defaults: {
      placeholder: 'Search documentation...',
      hotkey: 'ctrl+k',
      maxResults: 10,
    },
    styles: {
      background: 'var(--ui-background)',
      borderRadius: 'var(--ui-radius-xl)',
      shadow: 'var(--ui-shadow-modal)',
      padding: 'var(--ui-space-6)',
    },
  },
  
  {
    name: 'ApiReference',
    enabled: true,
    defaults: {
      showTypes: true,
      showExamples: true,
      expandable: true,
    },
    styles: {
      borderRadius: 'var(--ui-radius-md)',
      border: '1px solid var(--ui-border)',
      padding: 'var(--ui-space-4)',
    },
  },
  
  {
    name: 'Pagination',
    enabled: true,
    defaults: {
      showPrevNext: true,
      showPageNumbers: false,
    },
    styles: {
      padding: 'var(--ui-space-8) 0',
      borderTop: '1px solid var(--ui-border)',
    },
  },
];
