/**
 * Tailwind CSS Preset
 * 
 * 集成所有设计令牌到 Tailwind CSS 配置中
 * 使用 CSS 变量实现主题切换（light/dark）
 * 
 * 使用方式：
 * export default {
 *   presets: [require('@ouraihub/tokens/preset')],
 *   content: ['./src/**\/*.{html,js,ts,jsx,tsx}'],
 * }
 */

export default {
  theme: {
    extend: {
      /* ====================================================================
         Colors - 使用 CSS 变量实现主题切换
         ==================================================================== */
      colors: {
        // Primary
        primary: 'var(--ui-primary)',
        'primary-light': 'var(--ui-primary-light)',
        'primary-dark': 'var(--ui-primary-dark)',

        // Secondary
        secondary: 'var(--ui-secondary)',
        'secondary-light': 'var(--ui-secondary-light)',
        'secondary-dark': 'var(--ui-secondary-dark)',

        // Accent
        accent: 'var(--ui-accent)',
        'accent-light': 'var(--ui-accent-light)',
        'accent-dark': 'var(--ui-accent-dark)',

        // Neutral
        background: 'var(--ui-background)',
        surface: 'var(--ui-surface)',
        border: 'var(--ui-border)',

        // Text
        text: 'var(--ui-text)',
        'text-secondary': 'var(--ui-text-secondary)',
        'text-muted': 'var(--ui-text-muted)',

        // Semantic
        success: 'var(--ui-success)',
        'success-light': 'var(--ui-success-light)',
        warning: 'var(--ui-warning)',
        'warning-light': 'var(--ui-warning-light)',
        error: 'var(--ui-error)',
        'error-light': 'var(--ui-error-light)',
        info: 'var(--ui-info)',
        'info-light': 'var(--ui-info-light)',
      },

      /* ====================================================================
         Spacing - 4px Grid System
         ==================================================================== */
      spacing: {
        0: 'var(--ui-space-0)',
        1: 'var(--ui-space-1)',
        2: 'var(--ui-space-2)',
        3: 'var(--ui-space-3)',
        4: 'var(--ui-space-4)',
        5: 'var(--ui-space-5)',
        6: 'var(--ui-space-6)',
        8: 'var(--ui-space-8)',
        10: 'var(--ui-space-10)',
        12: 'var(--ui-space-12)',
        16: 'var(--ui-space-16)',
        20: 'var(--ui-space-20)',
        24: 'var(--ui-space-24)',
        32: 'var(--ui-space-32)',
        40: 'var(--ui-space-40)',
        48: 'var(--ui-space-48)',
        64: 'var(--ui-space-64)',
      },

      /* ====================================================================
         Font Sizes
         ==================================================================== */
      fontSize: {
        xs: 'var(--ui-text-xs)',
        sm: 'var(--ui-text-sm)',
        base: 'var(--ui-text-base)',
        lg: 'var(--ui-text-lg)',
        xl: 'var(--ui-text-xl)',
        '2xl': 'var(--ui-text-2xl)',
        '3xl': 'var(--ui-text-3xl)',
        '4xl': 'var(--ui-text-4xl)',
        '5xl': 'var(--ui-text-5xl)',
      },

      /* ====================================================================
         Font Weights
         ==================================================================== */
      fontWeight: {
        normal: 'var(--ui-font-weight-normal)',
        medium: 'var(--ui-font-weight-medium)',
        semibold: 'var(--ui-font-weight-semibold)',
        bold: 'var(--ui-font-weight-bold)',
      },

      /* ====================================================================
         Border Radius
         ==================================================================== */
      borderRadius: {
        sm: 'var(--ui-radius-sm)',
        md: 'var(--ui-radius-md)',
        lg: 'var(--ui-radius-lg)',
        xl: 'var(--ui-radius-xl)',
        full: 'var(--ui-radius-full)',
      },

      /* ====================================================================
         Box Shadows
         ==================================================================== */
      boxShadow: {
        sm: 'var(--ui-shadow-sm)',
        md: 'var(--ui-shadow-md)',
        lg: 'var(--ui-shadow-lg)',
        xl: 'var(--ui-shadow-xl)',
      },

      /* ====================================================================
         Font Families
         ==================================================================== */
      fontFamily: {
        sans: 'var(--ui-font-sans)',
        mono: 'var(--ui-font-mono)',
      },

      /* ====================================================================
         Transition Duration
         ==================================================================== */
      transitionDuration: {
        fast: 'var(--ui-transition-fast)',
        base: 'var(--ui-transition-base)',
        slow: 'var(--ui-transition-slow)',
      },

      /* ====================================================================
         Line Height
         ==================================================================== */
      lineHeight: {
        tight: 'var(--ui-line-height-tight)',
        normal: 'var(--ui-line-height-normal)',
        relaxed: 'var(--ui-line-height-relaxed)',
      },
    },
  },

  /* ======================================================================
     Plugins - 预留位置，可在此添加自定义插件
     ====================================================================== */
  plugins: [],
};
