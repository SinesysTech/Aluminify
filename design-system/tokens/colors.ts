/**
 * Aluminify Design System - Color Tokens
 *
 * All colors in HSL format (without hsl() wrapper) for Tailwind CSS v4 compatibility.
 * Example: '240 5.9% 10%' instead of 'hsl(240, 5.9%, 10%)'
 */

export const colors = {
  light: {
    // Core
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',

    // Primary
    primary: '240 5.9% 10%',
    primaryForeground: '0 0% 98%',

    // Secondary
    secondary: '240 4.8% 95.9%',
    secondaryForeground: '240 5.9% 10%',

    // Muted
    muted: '240 4.8% 95.9%',
    mutedForeground: '240 3.8% 46.1%',

    // Accent
    accent: '240 4.8% 95.9%',
    accentForeground: '240 5.9% 10%',

    // Destructive
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '0 0% 98%',

    // Status
    statusSuccess: '142 71% 45%',
    statusSuccessForeground: '0 0% 98%',
    statusWarning: '45 93% 47%',
    statusWarningForeground: '0 0% 98%',
    statusInfo: '217 91% 60%',
    statusInfoForeground: '0 0% 98%',

    // Card/Popover
    card: '0 0% 100%',
    cardForeground: '240 10% 3.9%',
    popover: '0 0% 100%',
    popoverForeground: '240 10% 3.9%',

    // Border/Input/Ring
    border: '240 5.9% 90%',
    input: '240 5.9% 90%',
    ring: '240 5.9% 10%',

    // Sidebar
    sidebar: '240 5% 96%',
    sidebarForeground: '240 5.3% 26.1%',
    sidebarPrimary: '240 5.9% 10%',
    sidebarPrimaryForeground: '0 0% 98%',
    sidebarAccent: '240 5% 88%',
    sidebarAccentForeground: '240 10% 3.9%',
    sidebarBorder: '240 5.9% 90%',
    sidebarRing: '240 5.9% 10%',
  },

  dark: {
    // Core
    background: '240 10% 3.9%',
    foreground: '0 0% 98%',

    // Primary
    primary: '0 0% 98%',
    primaryForeground: '240 5.9% 10%',

    // Secondary
    secondary: '240 3.7% 15.9%',
    secondaryForeground: '0 0% 98%',

    // Muted
    muted: '240 3.7% 15.9%',
    mutedForeground: '240 5% 64.9%',

    // Accent
    accent: '240 3.7% 15.9%',
    accentForeground: '0 0% 98%',

    // Destructive
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '0 0% 98%',

    // Status (same as light for consistency)
    statusSuccess: '142 71% 45%',
    statusSuccessForeground: '0 0% 98%',
    statusWarning: '45 93% 47%',
    statusWarningForeground: '0 0% 98%',
    statusInfo: '217 91% 60%',
    statusInfoForeground: '0 0% 98%',

    // Card/Popover
    card: '240 10% 3.9%',
    cardForeground: '0 0% 98%',
    popover: '240 10% 3.9%',
    popoverForeground: '0 0% 98%',

    // Border/Input/Ring
    border: '240 3.7% 15.9%',
    input: '240 3.7% 15.9%',
    ring: '240 4.9% 83.9%',

    // Sidebar
    sidebar: '240 6% 10%',
    sidebarForeground: '0 0% 98%',
    sidebarPrimary: '0 0% 98%',
    sidebarPrimaryForeground: '240 5.9% 10%',
    sidebarAccent: '240 5% 20%',
    sidebarAccentForeground: '0 0% 98%',
    sidebarBorder: '240 3.7% 15.9%',
    sidebarRing: '240 4.9% 83.9%',
  },
} as const;

export type ColorToken = keyof typeof colors.light;
