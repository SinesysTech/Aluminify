-- Migration: Add missing fields required by application code
-- Created: 2026-01-15
-- Purpose: Add fields that exist in code but are missing from database schema

-- ============================================================================
-- 1. CRONOGRAMAS - Add velocidade_reproducao
-- ============================================================================
-- Used in: cronograma.service.ts, cronograma.types.ts, export/xlsx/route.ts
-- Purpose: Store video playback speed (1.0x, 1.25x, 1.5x, 2.0x) to calculate adjusted study time

ALTER TABLE cronogramas 
ADD COLUMN IF NOT EXISTS velocidade_reproducao DECIMAL(3,2) DEFAULT 1.00 NOT NULL;

COMMENT ON COLUMN cronogramas.velocidade_reproducao IS 'Video playback speed multiplier (1.00 = normal, 1.25 = 25% faster, etc.)';

-- ============================================================================
-- 2. SESSOES_ESTUDO - Add modulo_id
-- ============================================================================
-- Used in: types/shared/entities/activity.ts, dashboard-analytics.service.ts
-- Purpose: Track which module the study session is related to

ALTER TABLE sessoes_estudo 
ADD COLUMN IF NOT EXISTS modulo_id UUID REFERENCES modulos(id) ON DELETE SET NULL;

COMMENT ON COLUMN sessoes_estudo.modulo_id IS 'Reference to the module being studied in this session';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_sessoes_estudo_modulo_id ON sessoes_estudo(modulo_id);

-- ============================================================================
-- 3. PROGRESSO_FLASHCARDS - Add ultima_revisao
-- ============================================================================
-- Used in: flashcards.query-types.ts, dashboard-analytics.service.ts
-- Purpose: Track when the flashcard was last reviewed by the student

ALTER TABLE progresso_flashcards 
ADD COLUMN IF NOT EXISTS ultima_revisao TIMESTAMPTZ;

COMMENT ON COLUMN progresso_flashcards.ultima_revisao IS 'Timestamp of the last time this flashcard was reviewed';

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_progresso_flashcards_ultima_revisao ON progresso_flashcards(aluno_id, ultima_revisao);

-- ============================================================================
-- 4. PROGRESSO_FLASHCARDS - Add ultimo_feedback
-- ============================================================================
-- Used in: dashboard-analytics.service.ts
-- Purpose: Store the last feedback given by student (facil, medio, dificil, etc.)

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_feedback_flashcard') THEN
    CREATE TYPE enum_feedback_flashcard AS ENUM ('facil', 'medio', 'dificil', 'esqueci');
  END IF;
END $$;

ALTER TABLE progresso_flashcards 
ADD COLUMN IF NOT EXISTS ultimo_feedback enum_feedback_flashcard;

COMMENT ON COLUMN progresso_flashcards.ultimo_feedback IS 'Last feedback given by student when reviewing this flashcard';

-- ============================================================================
-- 5. Update existing records with default values
-- ============================================================================

-- Set default velocidade_reproducao for existing cronogramas
UPDATE cronogramas 
SET velocidade_reproducao = 1.00 
WHERE velocidade_reproducao IS NULL;

-- Note: modulo_id, ultima_revisao, and ultimo_feedback will remain NULL for existing records
-- They will be populated as new sessions/reviews are created

-- ============================================================================
-- 6. Add helpful comments
-- ============================================================================

COMMENT ON TABLE cronogramas IS 'Study schedules generated for students with all configuration parameters';
COMMENT ON TABLE sessoes_estudo IS 'Study sessions tracking time spent, focus level, and related content';
COMMENT ON TABLE progresso_flashcards IS 'Flashcard review progress using spaced repetition algorithm';
