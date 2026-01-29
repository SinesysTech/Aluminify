-- Migration: Update get_user_empresa_id to include usuarios table
-- Description: Atualiza função para buscar empresa_id também na tabela usuarios
-- Author: Auto-generated
-- Date: 2026-01-29

-- Atualizar função para buscar empresa_id de professores e usuarios
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    empresa_id_result uuid;
BEGIN
    -- Primeiro tenta buscar empresa_id do professor logado
    SELECT empresa_id
    INTO empresa_id_result
    FROM public.professores
    WHERE id = (SELECT auth.uid())
    LIMIT 1;

    -- Se não encontrou, tenta buscar na tabela usuarios
    IF empresa_id_result IS NULL THEN
        SELECT empresa_id
        INTO empresa_id_result
        FROM public.usuarios
        WHERE id = (SELECT auth.uid())
        AND deleted_at IS NULL
        LIMIT 1;
    END IF;

    RETURN empresa_id_result;
END;
$$;

-- Comment for documentation
COMMENT ON FUNCTION public.get_user_empresa_id IS 'Retorna empresa_id do usuário logado. Busca primeiro em professores, depois em usuarios.';
