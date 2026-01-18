/**
 * Tipos de entidades do banco de dados
 * Representam as tabelas do Supabase
 */

export interface Disciplina {
  id: string;
  nome: string;
  curso_id: string;
  created_at: string;
  updated_at: string;
}

export interface Curso {
  id: string;
  nome: string;
  empresa_id: string;
  segmento_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Modulo {
  id: string;
  nome: string;
  numero_modulo: number;
  frente_id: string;
  created_at: string;
  updated_at: string;
}

export interface Frente {
  id: string;
  nome: string;
  disciplina_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressoAtividade {
  id: string;
  aluno_id: string;
  atividade_id: string;
  status: 'pendente' | 'em_progresso' | 'concluida';
  dataInicio?: string;
  dataConclusao?: string;
  questoesTotais?: number;
  questoesAcertos?: number;
  dificuldadePercebida?: 1 | 2 | 3 | 4 | 5;
  anotacoesPessoais?: string;
  created_at: string;
  updated_at: string;
}

// Tipos com relacionamentos (joins)
export interface AtividadeComDetalhes {
  id: string;
  moduloId: string;
  tipo: string;
  titulo: string;
  arquivoUrl: string | null;
  gabaritoUrl: string | null;
  linkExterno: string | null;
  obrigatorio: boolean;
  ordemExibicao: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  frente_id?: string;
  disciplina_id?: string;
  curso_id?: string;
  frente?: Frente;
  disciplina?: Disciplina;
  curso?: Curso;
  modulo?: Modulo;
}

export interface ModuloComRelacionamentos extends Modulo {
  frente?: Frente;
  atividades?: AtividadeComDetalhes[];
}

export interface FrenteComRelacionamentos extends Frente {
  disciplina?: Disciplina;
  modulos?: ModuloComRelacionamentos[];
}

export interface DisciplinaComRelacionamentos extends Disciplina {
  curso?: Curso;
  frentes?: FrenteComRelacionamentos[];
}

// Type guards
export function isDisciplina(data: unknown): data is Disciplina {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'nome' in data &&
    'curso_id' in data
  );
}

export function isCurso(data: unknown): data is Curso {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'nome' in data &&
    'empresa_id' in data
  );
}

export function isModulo(data: unknown): data is Modulo {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'nome' in data &&
    'numero_modulo' in data &&
    'frente_id' in data
  );
}

export function isFrente(data: unknown): data is Frente {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'nome' in data &&
    'disciplina_id' in data
  );
}

export function isProgressoAtividade(data: unknown): data is ProgressoAtividade {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'aluno_id' in data &&
    'atividade_id' in data &&
    'status' in data
  );
}
