export type Flashcard = {
  id: string;
  pergunta: string;
  resposta: string;
  perguntaImagemUrl?: string | null;
  respostaImagemUrl?: string | null;
  importancia?: string | null;
};

export type Curso = {
  id: string;
  nome: string;
};

export type Disciplina = {
  id: string;
  nome: string;
};

export type Frente = {
  id: string;
  nome: string;
  disciplina_id: string;
};

export type Modulo = {
  id: string;
  nome: string;
  numero_modulo: number | null;
  frente_id: string;
};

export type ModoConfig = {
  id: string;
  title: string;
  desc: string;
  tooltip: string[];
  icon: "flame" | "book-open" | "brain" | "heart-pulse" | "target";
  gradient: string;
  iconBg: string;
  accent: string;
};

export const MODOS: ModoConfig[] = [
  {
    id: "mais_errados",
    title: "UTI dos Erros",
    desc: "Foco nas dificuldades — transforme erros em acertos",
    tooltip: [
      "Prioriza flashcards onde você teve mais dificuldade.",
      "Ideal para corrigir fraquezas e evoluir mais rápido.",
    ],
    icon: "heart-pulse",
    gradient: "from-rose-500/10 via-red-500/5 to-transparent",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    accent: "border-rose-500/30 hover:border-rose-500/50",
  },
  {
    id: "mais_cobrados",
    title: "Mais Cobrados",
    desc: "O que mais cai nas provas — estude com estratégia",
    tooltip: [
      "Flashcards dos tópicos com maior recorrência em provas.",
      "Ideal para priorizar estudo com maior retorno.",
    ],
    icon: "flame",
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accent: "border-amber-500/30 hover:border-amber-500/50",
  },
  {
    id: "conteudos_basicos",
    title: "Conteúdos Básicos",
    desc: "Fundamentos sólidos — domine o essencial",
    tooltip: [
      'Flashcards de módulos marcados como "Base".',
      "Ideal para revisar fundamentos e pontos recorrentes.",
    ],
    icon: "book-open",
    gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    accent: "border-blue-500/30 hover:border-blue-500/50",
  },
  {
    id: "revisao_geral",
    title: "Revisão Geral",
    desc: "Conteúdo misto — mantenha tudo em dia",
    tooltip: [
      "Flashcards variados para uma revisão ampla.",
      "Bom para reforçar memória de longo prazo.",
    ],
    icon: "brain",
    gradient: "from-emerald-500/10 via-green-500/5 to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accent: "border-emerald-500/30 hover:border-emerald-500/50",
  },
  {
    id: "personalizado",
    title: "Personalizado",
    desc: "Você no controle — escolha curso, frente e módulo",
    tooltip: [
      "Escolha exatamente o recorte que deseja estudar.",
      "Revise flashcards específicos de um conteúdo.",
    ],
    icon: "target",
    gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    accent: "border-violet-500/30 hover:border-violet-500/50",
  },
];
