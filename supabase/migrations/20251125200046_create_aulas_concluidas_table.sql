-- Criar tabela aulas_concluidas se não existir
CREATE TABLE IF NOT EXISTS public.aulas_concluidas (
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (aluno_id, aula_id)
);

CREATE INDEX IF NOT EXISTS idx_aulas_concluidas_curso_id ON public.aulas_concluidas(curso_id);

ALTER TABLE public.aulas_concluidas ENABLE ROW LEVEL SECURITY;

-- Remover política existente se houver
DROP POLICY IF EXISTS "Aluno gerencia aulas concluídas" ON public.aulas_concluidas;

CREATE POLICY "Aluno gerencia aulas concluídas" ON public.aulas_concluidas
    FOR ALL
    USING (auth.uid() = aluno_id)
    WITH CHECK (auth.uid() = aluno_id);

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS on_update_aulas_concluidas ON public.aulas_concluidas;

CREATE TRIGGER on_update_aulas_concluidas
    BEFORE UPDATE ON public.aulas_concluidas
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();;
