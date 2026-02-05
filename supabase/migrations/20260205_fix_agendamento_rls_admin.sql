-- Migration: Fix Agendamento RLS for Admins and Blocks
-- Description: Allow Admins to manage all appointments and blocks in their company
-- Date: 2026-02-05

-- =============================================
-- FIX 1: AGENDAMENTOS RLS for ADMINS
-- =============================================

CREATE POLICY "agendamentos_select_admin"
    ON agendamentos
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid()
            AND u.empresa_id = agendamentos.empresa_id
            AND EXISTS (
                 SELECT 1 FROM public.papeis p 
                 WHERE p.id = u.papel_id 
                 AND p.tipo IN ('admin', 'dono', 'gerente', 'professor_admin')
            )
        )
    );

CREATE POLICY "agendamentos_update_admin"
    ON agendamentos
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid()
            AND u.empresa_id = agendamentos.empresa_id
            AND EXISTS (
                 SELECT 1 FROM public.papeis p 
                 WHERE p.id = u.papel_id 
                 AND p.tipo IN ('admin', 'dono', 'gerente', 'professor_admin')
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid()
            AND u.empresa_id = agendamentos.empresa_id
            AND EXISTS (
                 SELECT 1 FROM public.papeis p 
                 WHERE p.id = u.papel_id 
                 AND p.tipo IN ('admin', 'dono', 'gerente', 'professor_admin')
            )
        )
    );

-- =============================================
-- FIX 2: BLOQUEIOS RLS for ADMINS
-- =============================================

DROP POLICY IF EXISTS "Admins podem criar bloqueios da empresa" ON agendamento_bloqueios;
CREATE POLICY "Admins podem gerenciar bloqueios da empresa"
    ON agendamento_bloqueios
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
             SELECT 1 FROM public.usuarios u
             WHERE u.id = auth.uid()
             AND u.empresa_id = agendamento_bloqueios.empresa_id
             AND EXISTS (
                 SELECT 1 FROM public.papeis p 
                 WHERE p.id = u.papel_id 
                 AND (p.tipo IN ('admin', 'dono', 'gerente') OR (p.tipo = 'professor_admin'))
             )
        )
    );
