-- Migration: Fix alunos numero_matricula unique constraint per empresa
-- Description: Remove constraint única global de numero_matricula e cria constraint única composta (empresa_id, numero_matricula)
-- Author: Auto-generated
-- Date: 2026-01-29

-- 1. Remover a constraint única global de numero_matricula (se existir)
-- Verificar se a constraint existe antes de tentar removê-la
DO $$
BEGIN
    -- Tentar remover constraint se existir
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'alunos_numero_matricula_key'
    ) THEN
        ALTER TABLE public.alunos DROP CONSTRAINT alunos_numero_matricula_key;
    END IF;
END $$;

-- 2. Criar constraint única composta (empresa_id, numero_matricula)
-- Isso permite que diferentes empresas tenham alunos com o mesmo número de matrícula
-- Mas garante que dentro de cada empresa, o número de matrícula seja único
-- A constraint só se aplica quando numero_matricula não é NULL e deleted_at é NULL
-- Se empresa_id for NULL, ainda permite múltiplos alunos com o mesmo numero_matricula (NULL)
CREATE UNIQUE INDEX IF NOT EXISTS alunos_empresa_matricula_unique 
ON public.alunos (empresa_id, numero_matricula) 
WHERE numero_matricula IS NOT NULL AND deleted_at IS NULL;

-- 3. Comentário para documentação
COMMENT ON INDEX alunos_empresa_matricula_unique IS 
'Garante que o número de matrícula seja único dentro de cada empresa. Permite que diferentes empresas tenham alunos com o mesmo número de matrícula.';
