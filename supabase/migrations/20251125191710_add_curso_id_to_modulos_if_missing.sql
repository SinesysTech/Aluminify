-- Adicionar curso_id aos modulos se não existir
ALTER TABLE public.modulos
    ADD COLUMN IF NOT EXISTS curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_modulos_curso_id ON public.modulos(curso_id);

COMMENT ON COLUMN public.modulos.curso_id IS 'Curso ao qual este módulo pertence';

-- Atualizar curso_id dos modulos baseado nas frentes
UPDATE public.modulos m
SET curso_id = f.curso_id
FROM public.frentes f
WHERE m.frente_id = f.id AND f.curso_id IS NOT NULL AND m.curso_id IS NULL;;
