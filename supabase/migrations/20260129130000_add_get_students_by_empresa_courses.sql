-- Migration: Add function to get students enrolled in empresa courses
-- Description: Função para buscar alunos matriculados em cursos de uma empresa
-- Author: Auto-generated
-- Date: 2026-01-29

-- Criar função para buscar IDs de alunos matriculados em cursos de uma empresa
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
