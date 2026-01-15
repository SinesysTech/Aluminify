-- Adicionar curso_id à tabela frentes se não existir
ALTER TABLE public.frentes
    ADD COLUMN IF NOT EXISTS curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_frentes_curso_id ON public.frentes(curso_id);

COMMENT ON COLUMN public.frentes.curso_id IS 'Curso ao qual esta frente pertence';;
