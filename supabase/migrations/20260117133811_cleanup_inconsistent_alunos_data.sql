-- Migration: Limpeza de dados inconsistentes na tabela alunos
-- Descrição: Remove registros de alunos que são na verdade professores e não têm cursos associados
-- Author: Claude
-- Date: 2026-01-17

-- Remover registros de alunos que são professores e não têm cursos
-- Esses usuários têm user_metadata.role = 'professor' e foram inseridos erroneamente na tabela alunos
DELETE FROM public.alunos
WHERE id IN (
    SELECT a.id
    FROM public.alunos a
    INNER JOIN public.professores p ON p.id = a.id
    WHERE NOT EXISTS (
        SELECT 1 FROM public.alunos_cursos ac WHERE ac.aluno_id = a.id
    )
);

-- Log para auditoria (comentário apenas - em produção, considerar logging table)
-- Usuários afetados esperados:
-- - brenomeira@salinhadobreno.com.br
-- - jordansouzamedeiros@gmail.com
