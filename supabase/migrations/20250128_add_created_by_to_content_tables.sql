-- Migration: Add created_by field to content tables (frentes, modulos, aulas)
-- Description: Adds created_by column and triggers to automatically track which professor created each content item
-- Author: Auto-generated
-- Date: 2025-01-28

-- 1. Add created_by column to frentes
ALTER TABLE public.frentes
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_frentes_created_by ON public.frentes(created_by);

COMMENT ON COLUMN public.frentes.created_by IS 'ID do professor que criou esta frente';

-- 2. Add created_by column to modulos
ALTER TABLE public.modulos
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_modulos_created_by ON public.modulos(created_by);

COMMENT ON COLUMN public.modulos.created_by IS 'ID do professor que criou este módulo';

-- 3. Add created_by column to aulas
ALTER TABLE public.aulas
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_aulas_created_by ON public.aulas(created_by);

COMMENT ON COLUMN public.aulas.created_by IS 'ID do professor que criou esta aula';

-- 4. Add triggers to automatically fill created_by when content is created
-- (The handle_created_by() function should already exist from previous migrations)
-- If it doesn't exist, we'll create it here

CREATE OR REPLACE FUNCTION public.handle_created_by()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não foi enviado manualmente, usa o ID do usuário autenticado
    IF NEW.created_by IS NULL THEN
        NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers for the new tables
CREATE TRIGGER set_created_by_frentes 
    BEFORE INSERT ON public.frentes 
    FOR EACH ROW 
    EXECUTE PROCEDURE public.handle_created_by();

CREATE TRIGGER set_created_by_modulos 
    BEFORE INSERT ON public.modulos 
    FOR EACH ROW 
    EXECUTE PROCEDURE public.handle_created_by();

CREATE TRIGGER set_created_by_aulas 
    BEFORE INSERT ON public.aulas 
    FOR EACH ROW 
    EXECUTE PROCEDURE public.handle_created_by();

-- 6. Enable RLS on the content tables if not already enabled
ALTER TABLE public.frentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist (to avoid conflicts) and create new ones
-- Note: These policies allow professors to manage content they created OR content in courses they own

-- Drop existing policies for frentes
DROP POLICY IF EXISTS "Professores criam frentes" ON public.frentes;
DROP POLICY IF EXISTS "Professores editam suas frentes" ON public.frentes;
DROP POLICY IF EXISTS "Professores deletam suas frentes" ON public.frentes;

-- Drop existing policies for modulos
DROP POLICY IF EXISTS "Professores criam modulos" ON public.modulos;
DROP POLICY IF EXISTS "Professores editam seus modulos" ON public.modulos;
DROP POLICY IF EXISTS "Professores deletam seus modulos" ON public.modulos;

-- Drop existing policies for aulas
DROP POLICY IF EXISTS "Professores criam aulas" ON public.aulas;
DROP POLICY IF EXISTS "Professores editam suas aulas" ON public.aulas;
DROP POLICY IF EXISTS "Professores deletam suas aulas" ON public.aulas;

-- 8. Add RLS policies for professors to manage their own content
-- Frentes: Professors can manage frentes they created or that belong to their courses
CREATE POLICY "Professores criam frentes" ON public.frentes 
    FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.professores WHERE id = auth.uid()));

CREATE POLICY "Professores editam suas frentes" ON public.frentes 
    FOR UPDATE 
    USING (
        created_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.cursos 
            WHERE cursos.id = frentes.curso_id 
            AND cursos.created_by = auth.uid()
        )
    );

CREATE POLICY "Professores deletam suas frentes" ON public.frentes 
    FOR DELETE 
    USING (
        created_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.cursos 
            WHERE cursos.id = frentes.curso_id 
            AND cursos.created_by = auth.uid()
        )
    );

-- Modulos: Professors can manage modulos they created or that belong to frentes in their courses
CREATE POLICY "Professores criam modulos" ON public.modulos 
    FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.professores WHERE id = auth.uid()));

CREATE POLICY "Professores editam seus modulos" ON public.modulos 
    FOR UPDATE 
    USING (
        created_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.frentes 
            JOIN public.cursos ON cursos.id = frentes.curso_id
            WHERE frentes.id = modulos.frente_id 
            AND cursos.created_by = auth.uid()
        )
    );

CREATE POLICY "Professores deletam seus modulos" ON public.modulos 
    FOR DELETE 
    USING (
        created_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.frentes 
            JOIN public.cursos ON cursos.id = frentes.curso_id
            WHERE frentes.id = modulos.frente_id 
            AND cursos.created_by = auth.uid()
        )
    );

-- Aulas: Professors can manage aulas they created or that belong to modulos in their courses
CREATE POLICY "Professores criam aulas" ON public.aulas 
    FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.professores WHERE id = auth.uid()));

CREATE POLICY "Professores editam suas aulas" ON public.aulas 
    FOR UPDATE 
    USING (
        created_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.modulos 
            JOIN public.frentes ON frentes.id = modulos.frente_id
            JOIN public.cursos ON cursos.id = frentes.curso_id
            WHERE modulos.id = aulas.modulo_id 
            AND cursos.created_by = auth.uid()
        )
    );

CREATE POLICY "Professores deletam suas aulas" ON public.aulas 
    FOR DELETE 
    USING (
        created_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.modulos 
            JOIN public.frentes ON frentes.id = modulos.frente_id
            JOIN public.cursos ON cursos.id = frentes.curso_id
            WHERE modulos.id = aulas.modulo_id 
            AND cursos.created_by = auth.uid()
        )
    );

