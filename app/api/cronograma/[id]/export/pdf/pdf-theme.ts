/**
 * Tema visual do PDF: cores semanticas, paleta de disciplinas,
 * escala tipografica e registro de fontes (Inter + Plus Jakarta Sans).
 */

import { Font } from "@react-pdf/renderer";

// ---------------------------------------------------------------------------
// Registro de fontes - Inter (body) e Plus Jakarta Sans (headings)
// Usando fontes do Google Fonts via CDN
// ---------------------------------------------------------------------------

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "PlusJakartaSans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-600-normal.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-700-normal.ttf",
      fontWeight: 700,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-800-normal.ttf",
      fontWeight: 800,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ---------------------------------------------------------------------------
// Cores semanticas do design system (MASTER.md)
// ---------------------------------------------------------------------------

export const PDF_COLORS = {
  // Text
  primary: "#111827",
  textMain: "#111827",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",

  // Backgrounds
  background: "#F9FAFB",
  surface: "#FFFFFF",
  surfaceAlt: "#F3F4F6",

  // Borders
  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  // Status
  success: "#22C55E",
  successLight: "#DCFCE7",
  successDark: "#16A34A",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
  warning: "#FACC15",
  warningLight: "#FEF9C3",
  error: "#F87171",
  errorLight: "#FEE2E2",
  accent: "#A855F7",
} as const;

// ---------------------------------------------------------------------------
// Paleta de 12 cores para disciplinas (bg / text / accent)
// ---------------------------------------------------------------------------

export const DISCIPLINE_PALETTE = [
  { bg: "#EFF6FF", text: "#1E40AF", accent: "#3B82F6" }, // Blue
  { bg: "#F0FDF4", text: "#166534", accent: "#22C55E" }, // Green
  { bg: "#FEF3C7", text: "#92400E", accent: "#F59E0B" }, // Amber
  { bg: "#FDF2F8", text: "#9D174D", accent: "#EC4899" }, // Pink
  { bg: "#F5F3FF", text: "#5B21B6", accent: "#8B5CF6" }, // Violet
  { bg: "#FFF7ED", text: "#9A3412", accent: "#F97316" }, // Orange
  { bg: "#ECFDF5", text: "#065F46", accent: "#10B981" }, // Emerald
  { bg: "#EEF2FF", text: "#3730A3", accent: "#6366F1" }, // Indigo
  { bg: "#FEF2F2", text: "#991B1B", accent: "#EF4444" }, // Red
  { bg: "#F0FDFA", text: "#115E59", accent: "#14B8A6" }, // Teal
  { bg: "#FFFBEB", text: "#78350F", accent: "#EAB308" }, // Yellow
  { bg: "#FAF5FF", text: "#6B21A8", accent: "#A855F7" }, // Purple
  { bg: "#F3F4F6", text: "#374151", accent: "#6B7280" }, // Gray (Fallback)
] as const;

export type DisciplineColor = (typeof DISCIPLINE_PALETTE)[number];

export function getDisciplineColor(index: number): DisciplineColor {
  return DISCIPLINE_PALETTE[index % DISCIPLINE_PALETTE.length];
}

/**
 * Cria um mapa de disciplinaId -> cor, garantindo cores consistentes.
 */
export function buildDisciplineColorMap(
  disciplinaIds: string[],
): Map<string, DisciplineColor> {
  const map = new Map<string, DisciplineColor>();
  const uniqueIds = [...new Set(disciplinaIds)];
  uniqueIds.forEach((id, index) => {
    map.set(id, getDisciplineColor(index));
  });
  return map;
}

// ---------------------------------------------------------------------------
// Escala tipografica para o PDF
// ---------------------------------------------------------------------------

export const PDF_FONTS = {
  display: "PlusJakartaSans",
  body: "Inter",

  // Tamanhos
  titleSize: 22,
  weekTitleSize: 16,
  sectionTitleSize: 13,
  disciplineSize: 11,
  frenteSize: 10,
  moduleSize: 9,
  tableHeaderSize: 8,
  bodySize: 9,
  timeSize: 8,
  labelSize: 8,
  footerSize: 7,
  progressSize: 9,
  motivationalSize: 12,
  pillSize: 7,
} as const;

// ---------------------------------------------------------------------------
// Espacamento e dimensoes comuns
// ---------------------------------------------------------------------------

export const PDF_SPACING = {
  pagePaddingTop: 24,
  pagePaddingBottom: 28,
  pagePaddingHorizontal: 24,
  sectionGap: 12,
  cardPadding: 10,
  cardRadius: 8,
  smallRadius: 4,
  checkboxSize: 16,
  progressBarHeight: 8,
  progressBarHeightLarge: 12,
  borderWidth: 1,
  accentBorderWidth: 4,
} as const;
