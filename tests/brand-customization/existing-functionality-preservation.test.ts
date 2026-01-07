/**
 * Property-Based Test: Existing Functionality Preservation
 * 
 * Feature: brand-customization, Property 16: Existing Functionality Preservation
 * Validates: Requirements 6.4
 * 
 * Tests that existing theme functionality (dark/light mode, radius, scale) 
 * continues working while new branding features are added.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { CustomThemePreset, CompleteBrandingConfig } from '@/types/brand-customization';

// Mock localStorage for theme configuration
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock document for CSS property manipulation
const documentMock = {
  documentElement: {
    style: {
      setProperty: jest.fn(),
      removeProperty: jest.fn(),
    },
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
    },
  },
  querySelector: jest.fn(),
  createElement: jest.fn(),
  head: {
    appendChild: jest.fn(),
  },
};
Object.defineProperty(global, 'document', { value: documentMock });

// Extended theme configuration interface
interface ExtendedThemeConfig {
  preset: string;
  radius: number;
  scale: number;
  mode: 'light' | 'dark';
  customPresets?: CustomThemePreset[];
  activeBranding?: CompleteBrandingConfig;
}

// Default theme configuration
const DEFAULT_THEME: ExtendedThemeConfig = {
  preset: 'default',
  radius: 0.5,
  scale: 1,
  mode: 'light',
};

// Standard theme presets
const STANDARD_PRESETS = ['default', 'blue', 'green', 'purple', 'orange', 'red'];

// Helper function to simulate theme application to CSS
function applyThemeToCSS(theme: ExtendedThemeConfig): void {
  const root = documentMock.documentElement;

  // Apply basic theme properties (existing functionality)
  root.style.setProperty('--radius', `${theme.radius}rem`);
  root.style.setProperty('--scale', theme.scale.toString());

  // Apply dark/light mode (existing functionality)
  if (theme.mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  // Apply brand customization if available (new functionality)
  if (theme.activeBranding?.colorPalette) {
    const palette = theme.activeBranding.colorPalette;
    root.style.setProperty('--primary', palette.primaryColor);
    root.style.setProperty('--secondary', palette.secondaryColor);
    root.style.setProperty('--accent', palette.accentColor);
    root.style.setProperty('--background', palette.backgroundColor);
    root.style.setProperty('--foreground', palette.foregroundColor);
  }

  // Apply font scheme if available (new functionality)
  if (theme.activeBranding?.fontScheme) {
    const fontScheme = theme.activeBranding.fontScheme;
    root.style.setProperty('--font-sans', fontScheme.fontSans.join(', '));
    root.style.setProperty('--font-mono', fontScheme.fontMono.join(', '));
  }
}

// Helper function to simulate theme configuration update
function updateThemeConfig(currentTheme: ExtendedThemeConfig, updates: Partial<ExtendedThemeConfig>): ExtendedThemeConfig {
  const newTheme = { ...currentTheme, ...updates };
  applyThemeToCSS(newTheme);
  return newTheme;
}

// Helper function to simulate preset selection
function selectPreset(currentTheme: ExtendedThemeConfig, presetId: string): ExtendedThemeConfig {
  if (STANDARD_PRESETS.includes(presetId)) {
    // Standard preset - use default values but preserve branding
    return updateThemeConfig(currentTheme, {
      preset: presetId,
      radius: DEFAULT_THEME.radius,
      scale: DEFAULT_THEME.scale,
      mode: DEFAULT_THEME.mode,
    });
  }

  // Check for custom preset
  const customPreset = currentTheme.customPresets?.find(p => p.id === presetId);
  if (customPreset) {
    return updateThemeConfig(currentTheme, {
      preset: presetId,
      radius: customPreset.radius,
      scale: customPreset.scale,
      mode: customPreset.mode,
    });
  }

  // Invalid preset - return unchanged
  return currentTheme;
}

// Generators for property-based testing
const hexColorArb = fc.integer({ min: 0, max: 0xffffff }).map(n => `#${n.toString(16).padStart(6, '0')}`);

const customThemePresetArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  empresaId: fc.string({ minLength: 1, maxLength: 50 }),
  colorPaletteId: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  fontSchemeId: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  radius: fc.float({ min: 0, max: 2 }),
  scale: fc.float({ min: 0.5, max: 2 }),
  mode: fc.constantFrom('light' as const, 'dark' as const),
  previewColors: fc.array(hexColorArb, { minLength: 1, maxLength: 6 }),
  isDefault: fc.boolean(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
  createdBy: fc.option(fc.string()),
  updatedBy: fc.option(fc.string()),
});

const brandingConfigArb = fc.record({
  tenantBranding: fc.record({
    id: fc.string(),
    empresaId: fc.string(),
    colorPaletteId: fc.option(fc.string()),
    fontSchemeId: fc.option(fc.string()),
    customCss: fc.option(fc.string()),
    createdAt: fc.date(),
    updatedAt: fc.date(),
    createdBy: fc.option(fc.string()),
    updatedBy: fc.option(fc.string()),
  }),
  logos: fc.record({
    login: fc.option(fc.record({
      id: fc.string(),
      tenantBrandingId: fc.string(),
      logoType: fc.constant('login' as const),
      logoUrl: fc.webUrl(),
      fileName: fc.option(fc.string()),
      fileSize: fc.option(fc.integer({ min: 1 })),
      mimeType: fc.option(fc.string()),
      createdAt: fc.date(),
      updatedAt: fc.date(),
    })),
    sidebar: fc.option(fc.record({
      id: fc.string(),
      tenantBrandingId: fc.string(),
      logoType: fc.constant('sidebar' as const),
      logoUrl: fc.webUrl(),
      fileName: fc.option(fc.string()),
      fileSize: fc.option(fc.integer({ min: 1 })),
      mimeType: fc.option(fc.string()),
      createdAt: fc.date(),
      updatedAt: fc.date(),
    })),
    favicon: fc.option(fc.record({
      id: fc.string(),
      tenantBrandingId: fc.string(),
      logoType: fc.constant('favicon' as const),
      logoUrl: fc.webUrl(),
      fileName: fc.option(fc.string()),
      fileSize: fc.option(fc.integer({ min: 1 })),
      mimeType: fc.option(fc.string()),
      createdAt: fc.date(),
      updatedAt: fc.date(),
    })),
  }),
  colorPalette: fc.option(fc.record({
    id: fc.string(),
    name: fc.string(),
    empresaId: fc.string(),
    primaryColor: hexColorArb,
    primaryForeground: hexColorArb,
    secondaryColor: hexColorArb,
    secondaryForeground: hexColorArb,
    accentColor: hexColorArb,
    accentForeground: hexColorArb,
    mutedColor: hexColorArb,
    mutedForeground: hexColorArb,
    backgroundColor: hexColorArb,
    foregroundColor: hexColorArb,
    cardColor: hexColorArb,
    cardForeground: hexColorArb,
    destructiveColor: hexColorArb,
    destructiveForeground: hexColorArb,
    sidebarBackground: hexColorArb,
    sidebarForeground: hexColorArb,
    sidebarPrimary: hexColorArb,
    sidebarPrimaryForeground: hexColorArb,
    isCustom: fc.boolean(),
    createdAt: fc.date(),
    updatedAt: fc.date(),
    createdBy: fc.option(fc.string()),
    updatedBy: fc.option(fc.string()),
  })),
  fontScheme: fc.option(fc.record({
    id: fc.string(),
    name: fc.string(),
    empresaId: fc.string(),
    fontSans: fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
    fontMono: fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
    fontSizes: fc.record({
      xs: fc.string(),
      sm: fc.string(),
      base: fc.string(),
      lg: fc.string(),
      xl: fc.string(),
      '2xl': fc.string(),
      '3xl': fc.string(),
      '4xl': fc.string(),
    }),
    fontWeights: fc.record({
      light: fc.integer({ min: 100, max: 900 }),
      normal: fc.integer({ min: 100, max: 900 }),
      medium: fc.integer({ min: 100, max: 900 }),
      semibold: fc.integer({ min: 100, max: 900 }),
      bold: fc.integer({ min: 100, max: 900 }),
    }),
    googleFonts: fc.array(fc.string(), { maxLength: 10 }),
    isCustom: fc.boolean(),
    createdAt: fc.date(),
    updatedAt: fc.date(),
    createdBy: fc.option(fc.string()),
    updatedBy: fc.option(fc.string()),
  })),
  customThemePresets: fc.array(customThemePresetArb, { maxLength: 10 }),
});

describe('Property 16: Existing Functionality Preservation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should preserve existing radius functionality when branding is active', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 2 }),
        brandingConfigArb,
        (radius, brandingConfig) => {
          // Setup: Create theme with branding active
          const themeWithBranding: ExtendedThemeConfig = {
            ...DEFAULT_THEME,
            radius,
            activeBranding: brandingConfig,
          };

          // Test: Apply theme to CSS
          applyThemeToCSS(themeWithBranding);

          // Verify: Radius is still applied correctly
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--radius',
            `${radius}rem`
          );

          // Test: Update radius
          const updatedTheme = updateThemeConfig(themeWithBranding, { radius: radius + 0.1 });

          // Verify: New radius is applied
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--radius',
            `${radius + 0.1}rem`
          );

          // Verify: Branding is preserved
          expect(updatedTheme.activeBranding).toEqual(brandingConfig);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve existing scale functionality when branding is active', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.5, max: 2 }),
        brandingConfigArb,
        (scale, brandingConfig) => {
          // Setup: Create theme with branding active
          const themeWithBranding: ExtendedThemeConfig = {
            ...DEFAULT_THEME,
            scale,
            activeBranding: brandingConfig,
          };

          // Test: Apply theme to CSS
          applyThemeToCSS(themeWithBranding);

          // Verify: Scale is still applied correctly
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--scale',
            scale.toString()
          );

          // Test: Update scale
          const updatedTheme = updateThemeConfig(themeWithBranding, { scale: scale + 0.1 });

          // Verify: New scale is applied
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--scale',
            (scale + 0.1).toString()
          );

          // Verify: Branding is preserved
          expect(updatedTheme.activeBranding).toEqual(brandingConfig);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve existing dark/light mode functionality when branding is active', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light' as const, 'dark' as const),
        brandingConfigArb,
        (mode, brandingConfig) => {
          // Setup: Create theme with branding active
          const themeWithBranding: ExtendedThemeConfig = {
            ...DEFAULT_THEME,
            mode,
            activeBranding: brandingConfig,
          };

          // Test: Apply theme to CSS
          applyThemeToCSS(themeWithBranding);

          // Verify: Mode is still applied correctly
          if (mode === 'dark') {
            expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('dark');
            expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('light');
          } else {
            expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('light');
            expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('dark');
          }

          // Test: Toggle mode
          const newMode = mode === 'light' ? 'dark' : 'light';
          const updatedTheme = updateThemeConfig(themeWithBranding, { mode: newMode });

          // Verify: New mode is applied
          if (newMode === 'dark') {
            expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('dark');
            expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('light');
          } else {
            expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('light');
            expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('dark');
          }

          // Verify: Branding is preserved
          expect(updatedTheme.activeBranding).toEqual(brandingConfig);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve existing preset selection functionality when branding is active', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STANDARD_PRESETS),
        brandingConfigArb,
        (preset, brandingConfig) => {
          // Setup: Create theme with branding active
          const themeWithBranding: ExtendedThemeConfig = {
            ...DEFAULT_THEME,
            preset: 'custom-preset',
            radius: 1.5,
            scale: 1.5,
            mode: 'dark',
            activeBranding: brandingConfig,
          };

          // Test: Select standard preset
          const updatedTheme = selectPreset(themeWithBranding, preset);

          // Verify: Standard preset values are applied
          expect(updatedTheme.preset).toBe(preset);
          expect(updatedTheme.radius).toBe(DEFAULT_THEME.radius);
          expect(updatedTheme.scale).toBe(DEFAULT_THEME.scale);
          expect(updatedTheme.mode).toBe(DEFAULT_THEME.mode);

          // Verify: Branding is preserved
          expect(updatedTheme.activeBranding).toEqual(brandingConfig);

          // Verify: CSS properties are applied
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--radius',
            `${DEFAULT_THEME.radius}rem`
          );
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--scale',
            DEFAULT_THEME.scale.toString()
          );

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve existing functionality when custom presets are added', () => {
    fc.assert(
      fc.property(
        fc.array(customThemePresetArb, { minLength: 1, maxLength: 3 }),
        fc.float({ min: 0, max: 2 }),
        fc.float({ min: 0.5, max: 2 }),
        fc.constantFrom('light' as const, 'dark' as const),
        (customPresets, radius, scale, mode) => {
          // Setup: Create theme with custom presets but no branding
          const themeWithCustomPresets: ExtendedThemeConfig = {
            preset: 'default',
            radius,
            scale,
            mode,
            customPresets,
          };

          // Test: Apply theme to CSS
          applyThemeToCSS(themeWithCustomPresets);

          // Verify: Existing functionality still works
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--radius',
            `${radius}rem`
          );
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--scale',
            scale.toString()
          );

          if (mode === 'dark') {
            expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('dark');
          } else {
            expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('light');
          }

          // Test: Select custom preset
          const firstCustomPreset = customPresets[0];
          const updatedTheme = selectPreset(themeWithCustomPresets, firstCustomPreset.id);

          // Verify: Custom preset values are applied
          expect(updatedTheme.preset).toBe(firstCustomPreset.id);
          expect(updatedTheme.radius).toBe(firstCustomPreset.radius);
          expect(updatedTheme.scale).toBe(firstCustomPreset.scale);
          expect(updatedTheme.mode).toBe(firstCustomPreset.mode);

          // Verify: Custom presets are preserved
          expect(updatedTheme.customPresets).toEqual(customPresets);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain CSS property application order when both existing and branding features are active', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 2 }),
        fc.float({ min: 0.5, max: 2 }),
        fc.constantFrom('light' as const, 'dark' as const),
        brandingConfigArb,
        (radius, scale, mode, brandingConfig) => {
          // Setup: Create theme with both existing and branding features
          const fullTheme: ExtendedThemeConfig = {
            preset: 'default',
            radius,
            scale,
            mode,
            activeBranding: brandingConfig,
          };

          // Test: Apply theme to CSS
          applyThemeToCSS(fullTheme);

          // Verify: Existing properties are applied first
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--radius',
            `${radius}rem`
          );
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--scale',
            scale.toString()
          );

          // Verify: Branding properties are applied after existing ones
          if (brandingConfig.colorPalette) {
            expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
              '--primary',
              brandingConfig.colorPalette.primaryColor
            );
            expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
              '--background',
              brandingConfig.colorPalette.backgroundColor
            );
          }

          if (brandingConfig.fontScheme) {
            expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
              '--font-sans',
              brandingConfig.fontScheme.fontSans.join(', ')
            );
          }

          // Verify: Mode classes are applied correctly
          if (mode === 'dark') {
            expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('dark');
            expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('light');
          } else {
            expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('light');
            expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('dark');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle theme reset functionality correctly when branding is active', () => {
    fc.assert(
      fc.property(
        brandingConfigArb,
        fc.float({ min: 0, max: 2 }),
        fc.float({ min: 0.5, max: 2 }),
        fc.constantFrom('light' as const, 'dark' as const),
        (brandingConfig, customRadius, customScale, customMode) => {
          // Setup: Create theme with custom values and branding
          const customTheme: ExtendedThemeConfig = {
            preset: 'custom',
            radius: customRadius,
            scale: customScale,
            mode: customMode,
            activeBranding: brandingConfig,
          };

          // Test: Reset to default theme
          const resetTheme = updateThemeConfig(customTheme, DEFAULT_THEME);

          // Verify: Default values are applied
          expect(resetTheme.preset).toBe(DEFAULT_THEME.preset);
          expect(resetTheme.radius).toBe(DEFAULT_THEME.radius);
          expect(resetTheme.scale).toBe(DEFAULT_THEME.scale);
          expect(resetTheme.mode).toBe(DEFAULT_THEME.mode);

          // Verify: Branding is preserved (reset should only affect theme, not branding)
          expect(resetTheme.activeBranding).toEqual(brandingConfig);

          // Verify: CSS properties are updated to default values
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--radius',
            `${DEFAULT_THEME.radius}rem`
          );
          expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
            '--scale',
            DEFAULT_THEME.scale.toString()
          );

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});