/**
 * Tipos específicos para resultados de queries do Supabase
 * Usados no serviço de flashcards para evitar uso de 'any'
 */

export interface ProgressoFlashcard {
  id: string;
  flashcard_id: string;
  usuario_id: string | null;
  empresa_id: string;
  data_proxima_revisao?: string | null;
  dias_intervalo?: number | null;
  nivel_facilidade?: number | null;
  numero_revisoes?: number | null;
  ultimo_feedback?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

export interface AlunoCursoRow {
  curso_id: string;
  aluno_id: string;
}

export interface CursoRow {
  id: string;
  nome: string;
  empresa_id?: string;
  created_by?: string | null;
}

export interface ModuloRow {
  id: string;
  nome: string;
  numero_modulo: number | null;
  frente_id: string;
  curso_id?: string | null;
  importancia?: number | null;
  frentes?: {
    id?: string;
    disciplina_id?: string;
    curso_id?: string | null;
  };
}

export interface FlashcardRow {
  id: string;
  modulo_id: string;
  pergunta: string;
  resposta: string;
  modulos?: ModuloRow | ModuloRow[];
}

export interface FrenteRow {
  id: string;
  nome: string;
  disciplina_id: string;
  curso_id?: string | null;
}

export interface ModuloComFrenteRow {
  id: string;
  nome: string;
  numero_modulo?: number | null;
  frente_id: string;
  curso_id?: string | null;
  frentes?:
    | (FrenteRow & {
        disciplina_id?: string;
        disciplinas?:
          | {
              id: string;
              nome: string;
            }
          | {
              id: string;
              nome: string;
            }[];
      })
    | (FrenteRow & {
        disciplina_id?: string;
        disciplinas?:
          | {
              id: string;
              nome: string;
            }
          | {
              id: string;
              nome: string;
            }[];
      })[];
}

/**
 * Tipo para módulo com relacionamentos aninhados para admin de flashcards
 */
export interface ModuloWithNestedRelations {
  id: string;
  nome: string;
  numero_modulo: number | null;
  frentes: {
    id: string;
    nome: string;
    disciplinas: {
      id: string;
      nome: string;
    };
  };
}
