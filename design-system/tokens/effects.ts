/**
 * Aluminify Design System - Effects Tokens
 *
 * Shadows, border-radius, animations, and visual effects.
 */

export const borderRadius = {
  sm: '0.375rem',     // 6px
  md: '0.5rem',       // 8px - rounded-lg
  lg: '0.75rem',      // 12px - rounded-xl
  xl: '1rem',         // 16px - rounded-2xl
  '2xl': '1.5rem',    // 24px
  full: '9999px',
} as const;

export const shadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

export const zIndex = {
  background: '0',
  content: '10',
  sticky: '40',
  nav: '50',
  modal: '100',
  tooltip: '110',
} as const;

export const transition = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const animation = {
  accordionDown: 'accordion-down 0.2s ease-out',
  accordionUp: 'accordion-up 0.2s ease-out',
  fadeInUp: 'fade-in-up 0.5s ease-out forwards',
} as const;

export const keyframes = {
  accordionDown: {
    from: { height: '0' },
    to: { height: 'var(--radix-accordion-content-height)' },
  },
  accordionUp: {
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: '0' },
  },
  fadeInUp: {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
} as const;
