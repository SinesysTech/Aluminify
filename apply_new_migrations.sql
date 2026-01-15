-- Aplicar apenas as migrations novas necessárias
-- Executar: psql ou via Supabase Dashboard

-- ============================================================================
-- Migration 1: Add missing fields
-- ============================================================================

-- 1. CRONOGRAMAS - Add velocidade_reproducao
ALTER TABLE cronogramas 
ADD COLUMN IF NOT EXISTS velocidade_reproducao DECIMAL(3,2) DEFAULT 1.00 NOT NULL;

COMMENT ON COLUMN cronogramas.velocidade_reproducao IS 'Video playback speed multiplier (1.00 = normal, 1.25 = 25% faster, etc.)';

-- 2. SESSOES_ESTUDO - Add modulo_id
ALTER TABLE sessoes_estudo 
ADD COLUMN IF NOT EXISTS modulo_id UUID REFERENCES modulos(id) ON DELETE SET NULL;

COMMENT ON COLUMN sessoes_estudo.modulo_id IS 'Reference to the module being studied in this session';

CREATE INDEX IF NOT EXISTS idx_sessoes_estudo_modulo_id ON sessoes_estudo(modulo_id);

-- 3. PROGRESSO_FLASHCARDS - Add ultima_revisao
ALTER TABLE progresso_flashcards 
ADD COLUMN IF NOT EXISTS ultima_revisao TIMESTAMPTZ;

COMMENT ON COLUMN progresso_flashcards.ultima_revisao IS 'Timestamp of the last time this flashcard was reviewed';

CREATE INDEX IF NOT EXISTS idx_progresso_flashcards_ultima_revisao ON progresso_flashcards(aluno_id, ultima_revisao);

-- 4. PROGRESSO_FLASHCARDS - Add ultimo_feedback
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_feedback_flashcard') THEN
    CREATE TYPE enum_feedback_flashcard AS ENUM ('facil', 'medio', 'dificil', 'esqueci');
  END IF;
END $$;

ALTER TABLE progresso_flashcards 
ADD COLUMN IF NOT EXISTS ultimo_feedback enum_feedback_flashcard;

COMMENT ON COLUMN progresso_flashcards.ultimo_feedback IS 'Last feedback given by student when reviewing this flashcard';

-- Update existing records
UPDATE cronogramas 
SET velocidade_reproducao = 1.00 
WHERE velocidade_reproducao IS NULL;

-- Add comments
COMMENT ON TABLE cronogramas IS 'Study schedules generated for students with all configuration parameters';
COMMENT ON TABLE sessoes_estudo IS 'Study sessions tracking time spent, focus level, and related content';
COMMENT ON TABLE progresso_flashcards IS 'Flashcard review progress using spaced repetition algorithm';

-- ============================================================================
-- Migration 2: Normalize nullable fields (OPTIONAL - requires validation first)
-- ============================================================================
-- UNCOMMENT ONLY AFTER VALIDATING DATA

-- -- SESSOES_ESTUDO
-- UPDATE sessoes_estudo SET aluno_id = '00000000-0000-0000-0000-000000000000' WHERE aluno_id IS NULL;
-- UPDATE sessoes_estudo SET inicio = created_at WHERE inicio IS NULL AND created_at IS NOT NULL;
-- UPDATE sessoes_estudo SET status = 'em_andamento' WHERE status IS NULL;
-- UPDATE sessoes_estudo SET created_at = NOW() WHERE created_at IS NULL;

-- ALTER TABLE sessoes_estudo ALTER COLUMN aluno_id SET NOT NULL;
-- ALTER TABLE sessoes_estudo ALTER COLUMN inicio SET NOT NULL;
-- ALTER TABLE sessoes_estudo ALTER COLUMN status SET NOT NULL;
-- ALTER TABLE sessoes_estudo ALTER COLUMN created_at SET NOT NULL;

-- -- PROGRESSO_ATIVIDADES
-- UPDATE progresso_atividades SET aluno_id = '00000000-0000-0000-0000-000000000000' WHERE aluno_id IS NULL;
-- UPDATE progresso_atividades SET atividade_id = '00000000-0000-0000-0000-000000000000' WHERE atividade_id IS NULL;
-- UPDATE progresso_atividades SET status = 'Pendente' WHERE status IS NULL;
-- UPDATE progresso_atividades SET questoes_totais = 0 WHERE questoes_totais IS NULL;
-- UPDATE progresso_atividades SET questoes_acertos = 0 WHERE questoes_acertos IS NULL;
-- UPDATE progresso_atividades SET created_at = NOW() WHERE created_at IS NULL;
-- UPDATE progresso_atividades SET updated_at = NOW() WHERE updated_at IS NULL;

-- ALTER TABLE progresso_atividades ALTER COLUMN aluno_id SET NOT NULL;
-- ALTER TABLE progresso_atividades ALTER COLUMN atividade_id SET NOT NULL;
-- ALTER TABLE progresso_atividades ALTER COLUMN status SET NOT NULL;
-- ALTER TABLE progresso_atividades ALTER COLUMN questoes_totais SET NOT NULL;
-- ALTER TABLE progresso_atividades ALTER COLUMN questoes_acertos SET NOT NULL;
-- ALTER TABLE progresso_atividades ALTER COLUMN created_at SET NOT NULL;
-- ALTER TABLE progresso_atividades ALTER COLUMN updated_at SET NOT NULL;

-- -- MATRICULAS
-- UPDATE matriculas SET aluno_id = '00000000-0000-0000-0000-000000000000' WHERE aluno_id IS NULL;
-- UPDATE matriculas SET curso_id = '00000000-0000-0000-0000-000000000000' WHERE curso_id IS NULL;

-- ALTER TABLE matriculas ALTER COLUMN aluno_id SET NOT NULL;
-- ALTER TABLE matriculas ALTER COLUMN curso_id SET NOT NULL;

-- -- PROFESSORES
-- UPDATE professores SET empresa_id = (SELECT id FROM empresas LIMIT 1) WHERE empresa_id IS NULL;
-- ALTER TABLE professores ALTER COLUMN empresa_id SET NOT NULL;

-- -- CRONOGRAMAS
-- UPDATE cronogramas SET nome = 'Cronograma ' || id WHERE nome IS NULL;
-- UPDATE cronogramas SET created_at = NOW() WHERE created_at IS NULL;
-- UPDATE cronogramas SET updated_at = NOW() WHERE updated_at IS NULL;

-- ALTER TABLE cronogramas ALTER COLUMN nome SET NOT NULL;
-- ALTER TABLE cronogramas ALTER COLUMN created_at SET NOT NULL;
-- ALTER TABLE cronogramas ALTER COLUMN updated_at SET NOT NULL;

-- -- CONSTRAINTS
-- ALTER TABLE progresso_atividades 
-- ADD CONSTRAINT check_questoes_acertos_valid 
-- CHECK (questoes_acertos <= questoes_totais);

-- ALTER TABLE cronogramas 
-- ADD CONSTRAINT check_velocidade_reproducao_valid 
-- CHECK (velocidade_reproducao >= 0.5 AND velocidade_reproducao <= 3.0);

-- ALTER TABLE sessoes_estudo 
-- ADD CONSTRAINT check_nivel_foco_valid 
-- CHECK (nivel_foco IS NULL OR (nivel_foco >= 1 AND nivel_foco <= 5));
