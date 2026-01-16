-- Migration: Fix Nullable Constraints
-- Description: Add NOT NULL constraints to fields that should be mandatory
-- Date: 2025-01-16

-- ============================================
-- STEP 1: Data Cleanup - Fix existing NULL values
-- ============================================

-- 1.1 Fix atividades table
UPDATE public.atividades
SET obrigatorio = TRUE
WHERE obrigatorio IS NULL;

UPDATE public.atividades
SET ordem_exibicao = 0
WHERE ordem_exibicao IS NULL;

UPDATE public.atividades
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE public.atividades
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- 1.2 Fix flashcards table
UPDATE public.flashcards
SET created_at = NOW()
WHERE created_at IS NULL;

-- 1.3 Fix cronogramas table
UPDATE public.cronogramas
SET nome = 'Meu Cronograma'
WHERE nome IS NULL;

-- ============================================
-- STEP 2: Handle orphaned records (records without modulo_id)
-- ============================================

-- 2.1 Log orphaned atividades (for audit)
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM public.atividades
    WHERE modulo_id IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Found % orphaned atividades without modulo_id', orphaned_count;
    END IF;
END $$;

-- 2.2 Delete orphaned atividades (they are invalid per business rules)
-- Note: This will cascade delete related progresso_atividades records
DELETE FROM public.atividades
WHERE modulo_id IS NULL;

-- 2.3 Log orphaned flashcards (for audit)
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM public.flashcards
    WHERE modulo_id IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Found % orphaned flashcards without modulo_id', orphaned_count;
    END IF;
END $$;

-- 2.4 Delete orphaned flashcards (they are invalid per business rules)
-- Note: This will cascade delete related progresso_flashcards records
DELETE FROM public.flashcards
WHERE modulo_id IS NULL;

-- ============================================
-- STEP 3: Add NOT NULL constraints
-- ============================================

-- 3.1 Atividades table
ALTER TABLE public.atividades
ALTER COLUMN modulo_id SET NOT NULL;

ALTER TABLE public.atividades
ALTER COLUMN obrigatorio SET NOT NULL;

ALTER TABLE public.atividades
ALTER COLUMN ordem_exibicao SET NOT NULL;

ALTER TABLE public.atividades
ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.atividades
ALTER COLUMN updated_at SET NOT NULL;

-- 3.2 Flashcards table
ALTER TABLE public.flashcards
ALTER COLUMN modulo_id SET NOT NULL;

ALTER TABLE public.flashcards
ALTER COLUMN created_at SET NOT NULL;

-- 3.3 Cronogramas table
ALTER TABLE public.cronogramas
ALTER COLUMN nome SET NOT NULL;

-- ============================================
-- STEP 4: Verify constraints
-- ============================================

-- Verify atividades
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM public.atividades WHERE modulo_id IS NULL) = 0,
        'atividades.modulo_id should not have NULL values';
    ASSERT (SELECT COUNT(*) FROM public.atividades WHERE obrigatorio IS NULL) = 0,
        'atividades.obrigatorio should not have NULL values';
    ASSERT (SELECT COUNT(*) FROM public.atividades WHERE ordem_exibicao IS NULL) = 0,
        'atividades.ordem_exibicao should not have NULL values';
    ASSERT (SELECT COUNT(*) FROM public.atividades WHERE created_at IS NULL) = 0,
        'atividades.created_at should not have NULL values';
    ASSERT (SELECT COUNT(*) FROM public.atividades WHERE updated_at IS NULL) = 0,
        'atividades.updated_at should not have NULL values';
    
    RAISE NOTICE 'All atividades constraints verified successfully';
END $$;

-- Verify flashcards
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM public.flashcards WHERE modulo_id IS NULL) = 0,
        'flashcards.modulo_id should not have NULL values';
    ASSERT (SELECT COUNT(*) FROM public.flashcards WHERE created_at IS NULL) = 0,
        'flashcards.created_at should not have NULL values';
    
    RAISE NOTICE 'All flashcards constraints verified successfully';
END $$;

-- Verify cronogramas
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM public.cronogramas WHERE nome IS NULL) = 0,
        'cronogramas.nome should not have NULL values';
    
    RAISE NOTICE 'All cronogramas constraints verified successfully';
END $$;

-- ============================================
-- STEP 5: Update comments for documentation
-- ============================================

COMMENT ON COLUMN public.atividades.modulo_id IS 'Módulo ao qual a atividade pertence (obrigatório)';
COMMENT ON COLUMN public.atividades.obrigatorio IS 'Indica se a atividade é obrigatória (obrigatório, default: TRUE)';
COMMENT ON COLUMN public.atividades.ordem_exibicao IS 'Ordem de exibição da atividade no módulo (obrigatório, default: 0)';
COMMENT ON COLUMN public.atividades.created_at IS 'Data de criação do registro (obrigatório)';
COMMENT ON COLUMN public.atividades.updated_at IS 'Data da última atualização do registro (obrigatório)';

COMMENT ON COLUMN public.flashcards.modulo_id IS 'Módulo ao qual o flashcard pertence (obrigatório)';
COMMENT ON COLUMN public.flashcards.created_at IS 'Data de criação do registro (obrigatório)';

COMMENT ON COLUMN public.cronogramas.nome IS 'Nome do cronograma (obrigatório)';

-- Migration completed successfully
