/**
 * Aluminify Design System - Spacing Tokens
 *
 * Based on 4px (0.25rem) base unit, following Tailwind defaults.
 */

export const spacing = {
  // Page spacing
  pageGap: '2rem',
  pagePaddingBottom: '2.5rem',

  // Section spacing
  sectionGap: '1rem',
  sectionPaddingY: '5rem',        // py-20
  sectionPaddingYLg: '6rem',      // lg:py-24

  // Hero section
  heroPaddingTop: '6rem',         // pt-24
  heroPaddingTopLg: '8rem',       // lg:pt-32
  heroPaddingBottom: '4rem',      // pb-16
  heroPaddingBottomLg: '6rem',    // lg:pb-24

  // Component spacing
  componentGap: '0.5rem',
  componentGapMd: '0.75rem',
  componentGapLg: '1rem',

  // Container padding (responsive)
  containerX: '1rem',             // px-4
  containerXSm: '1.5rem',         // sm:px-6
  containerXLg: '2rem',           // lg:px-8

  // Filter/table spacing
  filterGap: '0.75rem',
  tableHeaderHeight: '2.5rem',
  tableCell: '1rem',
  paginationX: '1rem',
  paginationY: '0.75rem',

  // Button spacing
  buttonGap: '0.5rem',

  // Empty state spacing
  emptyIconMarginBottom: '1.5rem',
  emptyTitleMarginBottom: '0.5rem',
  emptyTextMarginBottom: '2rem',
  emptyActionsGap: '0.75rem',
} as const;

export const maxWidth = {
  '2xl': '42rem',    // 672px
  '3xl': '48rem',    // 768px
  '4xl': '56rem',    // 896px
  '5xl': '64rem',    // 1024px
  '6xl': '72rem',    // 1152px
  '7xl': '80rem',    // 1280px
} as const;

export const touchTarget = {
  min: '44px',
} as const;
