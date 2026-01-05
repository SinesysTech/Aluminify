import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata o tipo de atividade para exibição, substituindo underscores por espaços
 * e aplicando formatação adequada
 */
export function formatTipoAtividade(tipo: string): string {
  const tipoMap: Record<string, string> = {
    'Nivel_1': 'Nível 1',
    'Nivel_2': 'Nível 2',
    'Nivel_3': 'Nível 3',
    'Nivel_4': 'Nível 4',
    'Conceituario': 'Conceituário',
    'Lista_Mista': 'Lista Mista',
    'Simulado_Diagnostico': 'Simulado Diagnóstico',
    'Simulado_Cumulativo': 'Simulado Cumulativo',
    'Simulado_Global': 'Simulado Global',
    'Flashcards': 'Flashcards',
    'Revisao': 'Revisão',
  };

  return tipoMap[tipo] ?? tipo.replace(/_/g, ' ');
}