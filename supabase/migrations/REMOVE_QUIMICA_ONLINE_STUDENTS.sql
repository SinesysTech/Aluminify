-- ============================================================================
-- Script para remover alunos vinculados à empresa "Química Online"
-- Execute este arquivo no Supabase Dashboard > SQL Editor
-- ============================================================================
-- ATENÇÃO: Este script remove TODAS as matrículas de alunos nos cursos da empresa "Química Online"
-- Os alunos em si NÃO serão deletados (podem estar em outras empresas)
-- ============================================================================

-- 1. Encontrar o ID da empresa "Química Online"
DO $$
DECLARE
    empresa_id_var uuid;
    curso_count integer;
    matricula_count integer;
BEGIN
    -- Buscar ID da empresa
    SELECT id INTO empresa_id_var
    FROM public.empresas
    WHERE nome ILIKE '%Química Online%' OR slug ILIKE '%quimica-online%'
    LIMIT 1;

    IF empresa_id_var IS NULL THEN
        RAISE EXCEPTION 'Empresa "Química Online" não encontrada';
    END IF;

    RAISE NOTICE 'Empresa encontrada: ID = %', empresa_id_var;

    -- Contar cursos da empresa
    SELECT COUNT(*) INTO curso_count
    FROM public.cursos
    WHERE empresa_id = empresa_id_var;

    RAISE NOTICE 'Cursos encontrados: %', curso_count;

    -- Contar matrículas antes de remover
    SELECT COUNT(*) INTO matricula_count
    FROM public.alunos_cursos
    WHERE curso_id IN (
        SELECT id FROM public.cursos WHERE empresa_id = empresa_id_var
    );

    RAISE NOTICE 'Matrículas encontradas: %', matricula_count;

    -- Remover todas as matrículas dos alunos nos cursos da empresa
    DELETE FROM public.alunos_cursos
    WHERE curso_id IN (
        SELECT id FROM public.cursos WHERE empresa_id = empresa_id_var
    );

    RAISE NOTICE 'Matrículas removidas com sucesso!';
    RAISE NOTICE 'Total de matrículas removidas: %', matricula_count;

    -- Mostrar resumo
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Resumo:';
    RAISE NOTICE '- Empresa: Química Online (ID: %)', empresa_id_var;
    RAISE NOTICE '- Cursos: %', curso_count;
    RAISE NOTICE '- Matrículas removidas: %', matricula_count;
    RAISE NOTICE '========================================';
END $$;

-- 2. Verificar se ainda há matrículas restantes (deve retornar 0)
SELECT 
    COUNT(*) as matrículas_restantes
FROM public.alunos_cursos
WHERE curso_id IN (
    SELECT id 
    FROM public.cursos 
    WHERE empresa_id = (
        SELECT id 
        FROM public.empresas 
        WHERE nome ILIKE '%Química Online%' OR slug ILIKE '%quimica-online%'
        LIMIT 1
    )
);
