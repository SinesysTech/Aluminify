-- Adicionar curso_id às aulas se não existir
ALTER TABLE public.aulas
    ADD COLUMN IF NOT EXISTS curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_aulas_curso_id ON public.aulas(curso_id);

COMMENT ON COLUMN public.aulas.curso_id IS 'Curso ao qual esta aula pertence';

-- Atualizar curso_id das aulas baseado nos módulos > frentes
UPDATE public.aulas a
SET curso_id = f.curso_id
FROM public.modulos m
JOIN public.frentes f ON m.frente_id = f.id
WHERE a.modulo_id = m.id AND f.curso_id IS NOT NULL AND a.curso_id IS NULL;;
