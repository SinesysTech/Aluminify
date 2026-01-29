-- ============================================================================
-- Aplicar Migrations - 29/01/2026
-- Execute este arquivo no Supabase Dashboard > SQL Editor
-- ============================================================================

-- Migration 1: Add function to get students enrolled in empresa courses
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_student_ids_by_empresa_courses(empresa_id_param uuid)
RETURNS TABLE(aluno_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT alunos_cursos.aluno_id
  FROM public.alunos_cursos
  INNER JOIN public.cursos ON cursos.id = alunos_cursos.curso_id
  WHERE cursos.empresa_id = empresa_id_param;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_student_ids_by_empresa_courses(uuid) TO authenticated;

-- Comment for documentation
COMMENT ON FUNCTION public.get_student_ids_by_empresa_courses IS 'Retorna IDs de todos os alunos matriculados em cursos de uma empresa específica. Usado para listagem cross-tenant.';

-- ============================================================================
-- Migration 2: Update get_user_empresa_id to include usuarios table
-- ============================================================================
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

-- ============================================================================
-- Verificação
-- ============================================================================
-- Para verificar se as funções foram criadas corretamente:
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name IN ('get_student_ids_by_empresa_courses', 'get_user_empresa_id');
