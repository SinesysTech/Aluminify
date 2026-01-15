-- Criar função para buscar matrículas do aluno de forma segura
-- Esta função usa security definer para evitar problemas com RLS
CREATE OR REPLACE FUNCTION public.get_matriculas_aluno(p_aluno_id UUID)
RETURNS TABLE (
  curso_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.curso_id
  FROM public.matriculas m
  WHERE m.aluno_id = p_aluno_id
    AND m.ativo = true;
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_matriculas_aluno(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_matriculas_aluno(UUID) TO anon;
;
