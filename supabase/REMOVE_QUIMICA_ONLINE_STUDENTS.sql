-- ============================================================================
-- Script para remover alunos vinculados à empresa "Química Online"
-- Execute este arquivo no Supabase Dashboard > SQL Editor
-- ============================================================================
-- ATENÇÃO: Este script remove TODAS as matrículas de alunos nos cursos da empresa "Química Online"
-- Os alunos em si NÃO serão deletados (podem estar em outras empresas)
-- ============================================================================

-- 1. Verificar quantas matrículas existem antes de remover
SELECT 
    e.nome as empresa,
    COUNT(DISTINCT ac.aluno_id) as total_alunos,
    COUNT(ac.*) as total_matriculas
FROM public.empresas e
INNER JOIN public.cursos c ON c.empresa_id = e.id
INNER JOIN public.alunos_cursos ac ON ac.curso_id = c.id
WHERE e.nome ILIKE '%Química Online%' OR e.slug ILIKE '%quimica-online%'
GROUP BY e.id, e.nome;

-- 2. Remover todas as matrículas dos alunos nos cursos da empresa "Química Online"
DELETE FROM public.alunos_cursos
WHERE curso_id IN (
    SELECT c.id 
    FROM public.cursos c
    INNER JOIN public.empresas e ON e.id = c.empresa_id
    WHERE e.nome ILIKE '%Química Online%' OR e.slug ILIKE '%quimica-online%'
);

-- 3. Verificar se ainda há matrículas restantes (deve retornar 0)
SELECT 
    e.nome as empresa,
    COUNT(DISTINCT ac.aluno_id) as total_alunos_restantes,
    COUNT(ac.*) as total_matriculas_restantes
FROM public.empresas e
INNER JOIN public.cursos c ON c.empresa_id = e.id
LEFT JOIN public.alunos_cursos ac ON ac.curso_id = c.id
WHERE e.nome ILIKE '%Química Online%' OR e.slug ILIKE '%quimica-online%'
GROUP BY e.id, e.nome;
