-- Migration: Permitir múltiplas disciplinas por curso
-- Description: Cria tabela de relacionamento muitos-para-muitos entre cursos e disciplinas

-- 1. Criar tabela de relacionamento cursos_disciplinas
CREATE TABLE IF NOT EXISTS public.cursos_disciplinas (
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (curso_id, disciplina_id)
);

CREATE INDEX IF NOT EXISTS idx_cursos_disciplinas_curso_id ON public.cursos_disciplinas(curso_id);
CREATE INDEX IF NOT EXISTS idx_cursos_disciplinas_disciplina_id ON public.cursos_disciplinas(disciplina_id);

COMMENT ON TABLE public.cursos_disciplinas IS 'Relacionamento muitos-para-muitos entre cursos e disciplinas';

-- 2. Migrar dados existentes de cursos.disciplina_id para cursos_disciplinas
INSERT INTO public.cursos_disciplinas (curso_id, disciplina_id)
SELECT id, disciplina_id
FROM public.cursos
WHERE disciplina_id IS NOT NULL
ON CONFLICT (curso_id, disciplina_id) DO NOTHING;

-- 3. Manter disciplina_id na tabela cursos por enquanto para compatibilidade
-- (será removido em migration futura se necessário);
