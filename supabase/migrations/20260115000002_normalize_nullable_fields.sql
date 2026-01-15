-- Migration: Normalize nullable fields to match application expectations
-- Created: 2026-01-15
-- Purpose: Make fields NOT NULL where the application code expects non-nullable values

-- ============================================================================
-- IMPORTANT: Review data before running
-- ============================================================================
-- This migration will fail if there are NULL values in fields being changed to NOT NULL
-- Run the validation queries below first to check for NULL values

-- ============================================================================
-- 1. SESSOES_ESTUDO - Make critical fields NOT NULL
-- ============================================================================
-- The application expects these fields to always have values

-- Validation query (run first):
-- SELECT COUNT(*) FROM sessoes_estudo WHERE aluno_id IS NULL OR inicio IS NULL OR status IS NULL OR created_at IS NULL;

-- Set defaults for any NULL values (adjust as needed)
UPDATE sessoes_estudo SET aluno_id = '00000000-0000-0000-0000-000000000000' WHERE aluno_id IS NULL;
UPDATE sessoes_estudo SET inicio = created_at WHERE inicio IS NULL AND created_at IS NOT NULL;
UPDATE sessoes_estudo SET status = 'em_andamento' WHERE status IS NULL;
UPDATE sessoes_estudo SET created_at = NOW() WHERE created_at IS NULL;

-- Make fields NOT NULL
ALTER TABLE sessoes_estudo ALTER COLUMN aluno_id SET NOT NULL;
ALTER TABLE sessoes_estudo ALTER COLUMN inicio SET NOT NULL;
ALTER TABLE sessoes_estudo ALTER COLUMN status SET NOT NULL;
ALTER TABLE sessoes_estudo ALTER COLUMN created_at SET NOT NULL;

-- ============================================================================
-- 2. PROGRESSO_ATIVIDADES - Make critical fields NOT NULL
-- ============================================================================

-- Validation query (run first):
-- SELECT COUNT(*) FROM progresso_atividades WHERE aluno_id IS NULL OR atividade_id IS NULL OR status IS NULL OR questoes_totais IS NULL OR questoes_acertos IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- Set defaults for any NULL values
UPDATE progresso_atividades SET aluno_id = '00000000-0000-0000-0000-000000000000' WHERE aluno_id IS NULL;
UPDATE progresso_atividades SET atividade_id = '00000000-0000-0000-0000-000000000000' WHERE atividade_id IS NULL;
UPDATE progresso_atividades SET status = 'Pendente' WHERE status IS NULL;
UPDATE progresso_atividades SET questoes_totais = 0 WHERE questoes_totais IS NULL;
UPDATE progresso_atividades SET questoes_acertos = 0 WHERE questoes_acertos IS NULL;
UPDATE progresso_atividades SET created_at = NOW() WHERE created_at IS NULL;
UPDATE progresso_atividades SET updated_at = NOW() WHERE updated_at IS NULL;

-- Make fields NOT NULL
ALTER TABLE progresso_atividades ALTER COLUMN aluno_id SET NOT NULL;
ALTER TABLE progresso_atividades ALTER COLUMN atividade_id SET NOT NULL;
ALTER TABLE progresso_atividades ALTER COLUMN status SET NOT NULL;
ALTER TABLE progresso_atividades ALTER COLUMN questoes_totais SET NOT NULL;
ALTER TABLE progresso_atividades ALTER COLUMN questoes_acertos SET NOT NULL;
ALTER TABLE progresso_atividades ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE progresso_atividades ALTER COLUMN updated_at SET NOT NULL;

-- ============================================================================
-- 3. MATRICULAS - Make critical fields NOT NULL
-- ============================================================================

-- Validation query (run first):
-- SELECT COUNT(*) FROM matriculas WHERE aluno_id IS NULL OR curso_id IS NULL;

-- Set defaults for any NULL values
UPDATE matriculas SET aluno_id = '00000000-0000-0000-0000-000000000000' WHERE aluno_id IS NULL;
UPDATE matriculas SET curso_id = '00000000-0000-0000-0000-000000000000' WHERE curso_id IS NULL;

-- Make fields NOT NULL
ALTER TABLE matriculas ALTER COLUMN aluno_id SET NOT NULL;
ALTER TABLE matriculas ALTER COLUMN curso_id SET NOT NULL;

-- ============================================================================
-- 4. PROFESSORES - Make empresa_id NOT NULL
-- ============================================================================

-- Validation query (run first):
-- SELECT COUNT(*) FROM professores WHERE empresa_id IS NULL;

-- Set default for any NULL values (you may want to set a real empresa_id)
UPDATE professores SET empresa_id = (SELECT id FROM empresas LIMIT 1) WHERE empresa_id IS NULL;

-- Make field NOT NULL
ALTER TABLE professores ALTER COLUMN empresa_id SET NOT NULL;

-- ============================================================================
-- 5. CRONOGRAMAS - Make nome and timestamps NOT NULL
-- ============================================================================

-- Validation query (run first):
-- SELECT COUNT(*) FROM cronogramas WHERE nome IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- Set defaults for any NULL values
UPDATE cronogramas SET nome = 'Cronograma ' || id WHERE nome IS NULL;
UPDATE cronogramas SET created_at = NOW() WHERE created_at IS NULL;
UPDATE cronogramas SET updated_at = NOW() WHERE updated_at IS NULL;

-- Make fields NOT NULL
ALTER TABLE cronogramas ALTER COLUMN nome SET NOT NULL;
ALTER TABLE cronogramas ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE cronogramas ALTER COLUMN updated_at SET NOT NULL;

-- ============================================================================
-- 6. FLASHCARDS - Make modulo_id NOT NULL
-- ============================================================================

-- Validation query (run first):
-- SELECT COUNT(*) FROM flashcards WHERE modulo_id IS NULL;

-- Delete orphaned flashcards without modulo_id (or set a default)
-- DELETE FROM flashcards WHERE modulo_id IS NULL;
-- OR
-- UPDATE flashcards SET modulo_id = (SELECT id FROM modulos LIMIT 1) WHERE modulo_id IS NULL;

-- Make field NOT NULL (uncomment after fixing NULL values)
-- ALTER TABLE flashcards ALTER COLUMN modulo_id SET NOT NULL;

-- ============================================================================
-- 7. Add constraints for data integrity
-- ============================================================================

-- Ensure questoes_acertos <= questoes_totais
ALTER TABLE progresso_atividades 
ADD CONSTRAINT check_questoes_acertos_valid 
CHECK (questoes_acertos <= questoes_totais);

-- Ensure velocidade_reproducao is within reasonable range
ALTER TABLE cronogramas 
ADD CONSTRAINT check_velocidade_reproducao_valid 
CHECK (velocidade_reproducao >= 0.5 AND velocidade_reproducao <= 3.0);

-- Ensure nivel_foco is between 1 and 5
ALTER TABLE sessoes_estudo 
ADD CONSTRAINT check_nivel_foco_valid 
CHECK (nivel_foco IS NULL OR (nivel_foco >= 1 AND nivel_foco <= 5));

-- ============================================================================
-- 8. Update RLS policies if needed
-- ============================================================================

-- Note: Review and update RLS policies to ensure they work with NOT NULL constraints
-- Example: If a policy checks "WHERE aluno_id = auth.uid()", it will now always work
-- since aluno_id can never be NULL
