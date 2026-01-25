/**
 * Aluminify Design System - Tailwind Theme Tokens
 *
 * Import this in tailwind.config.ts to extend the theme
 * with Aluminify's design tokens.
 *
 * Usage:
 * ```ts
 * import { aluminifyTheme } from './design-system/tailwind.tokens'
 *
 * export default {
 *   theme: {
 *     extend: aluminifyTheme
 *   }
 * }
 * ```
 */

export const colors = {
  // Landing Page Colors
  'background-light': '#F9FAFB',
  'background-dark': '#0F172A',
  'surface-light': '#FFFFFF',
  'surface-dark': '#1E293B',
  'border-light': '#E5E7EB',
  'border-dark': '#334155',
  'text-main-light': '#111827',
  'text-main-dark': '#F8FAFC',
  'text-muted-light': '#6B7280',
  'text-muted-dark': '#94A3B8',
  'primary-hover': '#374151',

  // Status Colors
  status: {
    success: '#22C55E',
    info: '#3B82F6',
    warning: '#FACC15',
    error: '#F87171',
    accent: '#A855F7',
  },
} as const

export const fontFamily = {
  sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  display: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
} as const

export const fontSize = {
  // Extended type scale for landing pages
  '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
  '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
  '5xl': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.025em' }],
  '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
  '3xl': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
} as const

export const spacing = {
  // Section spacing
  'section-sm': '5rem',    // 80px - py-20
  'section-lg': '6rem',    // 96px - py-24
  'hero-pt-sm': '6rem',    // 96px - pt-24
  'hero-pt-lg': '8rem',    // 128px - lg:pt-32
  'hero-pb-sm': '5rem',    // 80px - pb-20
  'hero-pb-lg': '6rem',    // 96px - lg:pb-24
} as const

export const borderRadius = {
  // Extended border radius
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  '4xl': '2rem',      // 32px
} as const

export const boxShadow = {
  // Custom shadows for landing page
  'button': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'card-hover': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'mockup': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const

export const zIndex = {
  // Design system z-index scale
  'background': '0',
  'content': '10',
  'sticky': '40',
  'nav': '50',
  'modal': '100',
  'tooltip': '110',
} as const

export const animation = {
  'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
} as const

export const keyframes = {
  'fade-in-up': {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
} as const

// Combined theme extension
export const aluminifyTheme = {
  colors,
  fontFamily,
  fontSize,
  spacing,
  borderRadius,
  boxShadow,
  zIndex,
  animation,
  keyframes,
} as const

// Type exports for TypeScript support
export type AluminifyColors = typeof colors
export type AluminifyFontFamily = typeof fontFamily
export type AluminifyFontSize = typeof fontSize
export type AluminifySpacing = typeof spacing
export type AluminifyBorderRadius = typeof borderRadius
export type AluminifyBoxShadow = typeof boxShadow
export type AluminifyZIndex = typeof zIndex
export type AluminifyTheme = typeof aluminifyTheme
