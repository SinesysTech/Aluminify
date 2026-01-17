-- Migration: Adicionar empresa_id na tabela alunos
-- Descrição: Adiciona coluna empresa_id para isolamento direto de dados por tenant
-- Author: Claude
-- Date: 2026-01-17

-- 1. Adicionar coluna empresa_id (nullable inicialmente para permitir backfill)
ALTER TABLE public.alunos
ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id);

-- 2. Backfill: pegar empresa_id do primeiro curso associado
UPDATE public.alunos a
SET empresa_id = (
    SELECT c.empresa_id
    FROM public.alunos_cursos ac
    INNER JOIN public.cursos c ON c.id = ac.curso_id
    WHERE ac.aluno_id = a.id
    LIMIT 1
)
WHERE a.empresa_id IS NULL;

-- 3. Criar índice para performance em queries filtradas por empresa
CREATE INDEX IF NOT EXISTS idx_alunos_empresa_id ON public.alunos(empresa_id);

-- 4. Tornar NOT NULL após backfill (apenas se todos os alunos têm empresa_id)
-- Verificar primeiro se há algum aluno sem empresa_id
DO $$
DECLARE
    orphan_count integer;
BEGIN
    SELECT COUNT(*) INTO orphan_count FROM public.alunos WHERE empresa_id IS NULL;

    IF orphan_count = 0 THEN
        -- Todos os alunos têm empresa_id, podemos tornar NOT NULL
        ALTER TABLE public.alunos ALTER COLUMN empresa_id SET NOT NULL;
        RAISE NOTICE 'Coluna empresa_id definida como NOT NULL';
    ELSE
        RAISE WARNING 'Existem % alunos sem empresa_id. Coluna permanece nullable.', orphan_count;
    END IF;
END $$;

-- 5. Trigger para sincronizar empresa_id quando aluno é matriculado em curso
CREATE OR REPLACE FUNCTION public.sync_aluno_empresa_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Ao inserir em alunos_cursos, atualiza empresa_id do aluno se não tiver
    UPDATE public.alunos
    SET empresa_id = (
        SELECT c.empresa_id
        FROM public.cursos c
        WHERE c.id = NEW.curso_id
    )
    WHERE id = NEW.aluno_id
    AND empresa_id IS NULL;

    RETURN NEW;
END;
$$;

-- Criar trigger apenas se não existir
DROP TRIGGER IF EXISTS trg_sync_aluno_empresa_id ON public.alunos_cursos;
CREATE TRIGGER trg_sync_aluno_empresa_id
AFTER INSERT ON public.alunos_cursos
FOR EACH ROW
EXECUTE FUNCTION public.sync_aluno_empresa_id();

-- Comentário na coluna
COMMENT ON COLUMN public.alunos.empresa_id IS 'ID da empresa/tenant ao qual o aluno pertence. Usado para isolamento de dados multi-tenant.';
