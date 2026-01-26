import type { CustomThemePreset } from '@/empresa/personalizacao/services/empresa/personalizacao.types';

export interface ExtendedThemeConfig {
  preset: string;
  radius: string;
  scale: string;
  contentLayout: 'full' | 'centered';
  mode: 'light' | 'dark' | 'system';
  customPresets?: CustomThemePreset[];
}

export interface ThemePreset {
  name: string;
  value: string;
  colors: string[];
}
