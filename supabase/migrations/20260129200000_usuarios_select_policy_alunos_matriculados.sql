-- Migration: Allow viewing usuarios who are enrolled in courses of the current user's empresa
-- Description: The "Alunos" list is filtered by course; users whose empresa_id is another company
--              were not visible to the current empresa even when enrolled in its courses.
--              This change extends the SELECT policy on usuarios so that the current user can
--              also see usuarios enrolled in any course of their empresa (via alunos_cursos + cursos).
--              INSERT/UPDATE/DELETE on usuarios remain restricted to empresa_id = current user's empresa.
-- Date: 2026-01-29

DROP POLICY IF EXISTS "Users can view empresa colleagues" ON public.usuarios;

CREATE POLICY "Users can view empresa colleagues"
    ON public.usuarios
    FOR SELECT
    TO authenticated
    USING (
        empresa_id = get_user_empresa_id()
        OR EXISTS (
            SELECT 1
            FROM public.alunos_cursos ac
            INNER JOIN public.cursos c ON c.id = ac.curso_id
            WHERE ac.usuario_id = usuarios.id
            AND c.empresa_id = get_user_empresa_id()
        )
    );
