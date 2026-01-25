import * as React from "react";

/**
 * Breakpoints seguindo padrão Tailwind CSS
 * Mobile-first: base é mobile, progressivamente maior
 */
export const BREAKPOINTS = {
  sm: 640,   // Mobile grande / Phablet
  md: 768,   // Tablet portrait
  lg: 1024,  // Tablet landscape / Desktop pequeno
  xl: 1280,  // Desktop
  "2xl": 1536, // Desktop grande
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export interface BreakpointState {
  /** Viewport menor que 768px (mobile e phablet) */
  isMobile: boolean;
  /** Viewport entre 768px e 1023px (tablet) */
  isTablet: boolean;
  /** Viewport 1024px ou maior (desktop) */
  isDesktop: boolean;
  /** Breakpoint atual: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' */
  breakpoint: "base" | BreakpointKey;
  /** Largura atual da viewport em pixels */
  width: number;
  /** Verifica se viewport é maior ou igual a um breakpoint */
  isAbove: (bp: BreakpointKey) => boolean;
  /** Verifica se viewport é menor que um breakpoint */
  isBelow: (bp: BreakpointKey) => boolean;
}

/**
 * Hook unificado para detecção de breakpoints responsivos.
 * Usa matchMedia para performance e evitar re-renders desnecessários.
 *
 * @example
 * const { isMobile, isDesktop, breakpoint } = useBreakpoint();
 *
 * if (isMobile) {
 *   return <MobileView />;
 * }
 */
export function useBreakpoint(): BreakpointState {
  const [state, setState] = React.useState<Omit<BreakpointState, "isAbove" | "isBelow">>(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: "lg",
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
  }));

  React.useEffect(() => {
    const getBreakpoint = (width: number): "base" | BreakpointKey => {
      if (width >= BREAKPOINTS["2xl"]) return "2xl";
      if (width >= BREAKPOINTS.xl) return "xl";
      if (width >= BREAKPOINTS.lg) return "lg";
      if (width >= BREAKPOINTS.md) return "md";
      if (width >= BREAKPOINTS.sm) return "sm";
      return "base";
    };

    const updateState = () => {
      const width = window.innerWidth;
      const breakpoint = getBreakpoint(width);

      setState({
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        breakpoint,
        width,
      });
    };

    // Inicial
    updateState();

    // Listeners para cada breakpoint
    const mediaQueries = Object.entries(BREAKPOINTS).map(([, value]) => {
      const mql = window.matchMedia(`(min-width: ${value}px)`);
      mql.addEventListener("change", updateState);
      return mql;
    });

    // Também escuta resize para width preciso
    window.addEventListener("resize", updateState);

    return () => {
      mediaQueries.forEach((mql) => mql.removeEventListener("change", updateState));
      window.removeEventListener("resize", updateState);
    };
  }, []);

  const isAbove = React.useCallback(
    (bp: BreakpointKey) => state.width >= BREAKPOINTS[bp],
    [state.width]
  );

  const isBelow = React.useCallback(
    (bp: BreakpointKey) => state.width < BREAKPOINTS[bp],
    [state.width]
  );

  return {
    ...state,
    isAbove,
    isBelow,
  };
}

/**
 * Hook simplificado que retorna apenas se é mobile.
 * Mantido para compatibilidade com código existente.
 *
 * @deprecated Prefira usar useBreakpoint() para mais controle
 */
export function useIsMobile(): boolean {
  const { isMobile } = useBreakpoint();
  return isMobile;
}

/**
 * Hook simplificado que retorna apenas se é tablet.
 * Mantido para compatibilidade com código existente.
 *
 * @deprecated Prefira usar useBreakpoint() para mais controle
 */
export function useIsTablet(): boolean {
  const { isTablet } = useBreakpoint();
  return isTablet;
}
