-- Validation Queries - Run BEFORE applying migration 20260115000002
-- Purpose: Check for NULL values that would cause NOT NULL constraints to fail

\echo '============================================================================'
\echo 'VALIDATION REPORT - Checking for NULL values'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- 1. SESSOES_ESTUDO
-- ============================================================================
\echo '1. SESSOES_ESTUDO - Checking critical fields...'

SELECT 
  'sessoes_estudo' as tabela,
  COUNT(*) FILTER (WHERE aluno_id IS NULL) as aluno_id_nulls,
  COUNT(*) FILTER (WHERE inicio IS NULL) as inicio_nulls,
  COUNT(*) FILTER (WHERE status IS NULL) as status_nulls,
  COUNT(*) FILTER (WHERE created_at IS NULL) as created_at_nulls,
  COUNT(*) as total_registros
FROM sessoes_estudo;

\echo ''

-- ============================================================================
-- 2. PROGRESSO_ATIVIDADES
-- ============================================================================
\echo '2. PROGRESSO_ATIVIDADES - Checking critical fields...'

SELECT 
  'progresso_atividades' as tabela,
  COUNT(*) FILTER (WHERE aluno_id IS NULL) as aluno_id_nulls,
  COUNT(*) FILTER (WHERE atividade_id IS NULL) as atividade_id_nulls,
  COUNT(*) FILTER (WHERE status IS NULL) as status_nulls,
  COUNT(*) FILTER (WHERE questoes_totais IS NULL) as questoes_totais_nulls,
  COUNT(*) FILTER (WHERE questoes_acertos IS NULL) as questoes_acertos_nulls,
  COUNT(*) FILTER (WHERE created_at IS NULL) as created_at_nulls,
  COUNT(*) FILTER (WHERE updated_at IS NULL) as updated_at_nulls,
  COUNT(*) as total_registros
FROM progresso_atividades;

\echo ''

-- ============================================================================
-- 3. MATRICULAS
-- ============================================================================
\echo '3. MATRICULAS - Checking critical fields...'

SELECT 
  'matriculas' as tabela,
  COUNT(*) FILTER (WHERE aluno_id IS NULL) as aluno_id_nulls,
  COUNT(*) FILTER (WHERE curso_id IS NULL) as curso_id_nulls,
  COUNT(*) as total_registros
FROM matriculas;

\echo ''

-- ============================================================================
-- 4. PROFESSORES
-- ============================================================================
\echo '4. PROFESSORES - Checking critical fields...'

SELECT 
  'professores' as tabela,
  COUNT(*) FILTER (WHERE empresa_id IS NULL) as empresa_id_nulls,
  COUNT(*) as total_registros
FROM professores;

\echo ''

-- ============================================================================
-- 5. CRONOGRAMAS
-- ============================================================================
\echo '5. CRONOGRAMAS - Checking critical fields...'

SELECT 
  'cronogramas' as tabela,
  COUNT(*) FILTER (WHERE nome IS NULL) as nome_nulls,
  COUNT(*) FILTER (WHERE created_at IS NULL) as created_at_nulls,
  COUNT(*) FILTER (WHERE updated_at IS NULL) as updated_at_nulls,
  COUNT(*) as total_registros
FROM cronogramas;

\echo ''

-- ============================================================================
-- 6. FLASHCARDS
-- ============================================================================
\echo '6. FLASHCARDS - Checking modulo_id...'

SELECT 
  'flashcards' as tabela,
  COUNT(*) FILTER (WHERE modulo_id IS NULL) as modulo_id_nulls,
  COUNT(*) as total_registros
FROM flashcards;

\echo ''
\echo '============================================================================'
\echo 'VALIDATION COMPLETE'
\echo '============================================================================'
\echo ''
\echo 'INTERPRETATION:'
\echo '  - If all *_nulls columns show 0, you can safely run migration 20260115000002'
\echo '  - If any *_nulls column shows > 0, review and fix those records first'
\echo '  - Check the migration file for UPDATE statements to set default values'
\echo ''
\echo 'NEXT STEPS:'
\echo '  1. If validation passes: npx supabase db push'
\echo '  2. If validation fails: Fix NULL values manually or adjust migration UPDATEs'
\echo '  3. After migration: npx supabase gen types typescript --project-id wtqgfmtucqmpheghcvxo > lib/database.types.ts'
\echo '  4. Verify: npx tsc --noEmit'
\echo ''
