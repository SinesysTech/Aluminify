-- Migration: Prevent orphan rows when deleting frentes/aulas/modulos
-- Description:
-- - Enforces FK relationships for tables that reference frentes/aulas
-- - Sets appropriate ON DELETE actions to avoid orphan records
-- - Cleans up any existing orphan rows before adding constraints
-- Date: 2026-01-12

BEGIN;

-- 0) Defensive cleanup: remove already-orphan rows (should be rare)
DELETE FROM public.aulas a
WHERE a.modulo_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.modulos m WHERE m.id = a.modulo_id);

DELETE FROM public.modulos m
WHERE m.frente_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.frentes f WHERE f.id = m.frente_id);

DELETE FROM public.cronograma_itens ci
WHERE NOT EXISTS (SELECT 1 FROM public.aulas a WHERE a.id = ci.aula_id);

DELETE FROM public.cronograma_tempo_estudos cte
WHERE NOT EXISTS (SELECT 1 FROM public.frentes f WHERE f.id = cte.frente_id);

DELETE FROM public.cronograma_tempo_estudos cte
WHERE NOT EXISTS (SELECT 1 FROM public.disciplinas d WHERE d.id = cte.disciplina_id);

-- 1) Ensure aulas(modulo_id) -> modulos(id) is enforced with ON DELETE CASCADE
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    JOIN unnest(con.conkey) AS k(attnum) ON TRUE
    JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = k.attnum
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'aulas'
      AND att.attname = 'modulo_id'
  LOOP
    EXECUTE format('ALTER TABLE public.aulas DROP CONSTRAINT %I', r.conname);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'aulas'
      AND con.conname = 'fk_aulas_modulo_id'
  ) THEN
    ALTER TABLE public.aulas
      ADD CONSTRAINT fk_aulas_modulo_id
      FOREIGN KEY (modulo_id)
      REFERENCES public.modulos(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 2) Ensure modulos(frente_id) -> frentes(id) is enforced with ON DELETE CASCADE
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    JOIN unnest(con.conkey) AS k(attnum) ON TRUE
    JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = k.attnum
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'modulos'
      AND att.attname = 'frente_id'
  LOOP
    EXECUTE format('ALTER TABLE public.modulos DROP CONSTRAINT %I', r.conname);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'modulos'
      AND con.conname = 'fk_modulos_frente_id'
  ) THEN
    ALTER TABLE public.modulos
      ADD CONSTRAINT fk_modulos_frente_id
      FOREIGN KEY (frente_id)
      REFERENCES public.frentes(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 3) Ensure cronograma_itens(aula_id) -> aulas(id) is enforced with ON DELETE CASCADE
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    JOIN unnest(con.conkey) AS k(attnum) ON TRUE
    JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = k.attnum
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'cronograma_itens'
      AND att.attname = 'aula_id'
  LOOP
    EXECUTE format('ALTER TABLE public.cronograma_itens DROP CONSTRAINT %I', r.conname);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'cronograma_itens'
      AND con.conname = 'fk_cronograma_itens_aula_id'
  ) THEN
    ALTER TABLE public.cronograma_itens
      ADD CONSTRAINT fk_cronograma_itens_aula_id
      FOREIGN KEY (aula_id)
      REFERENCES public.aulas(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 4) Ensure cronograma_tempo_estudos(frente_id) -> frentes(id) is enforced with ON DELETE CASCADE
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    JOIN unnest(con.conkey) AS k(attnum) ON TRUE
    JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = k.attnum
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'cronograma_tempo_estudos'
      AND att.attname = 'frente_id'
  LOOP
    EXECUTE format('ALTER TABLE public.cronograma_tempo_estudos DROP CONSTRAINT %I', r.conname);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'cronograma_tempo_estudos'
      AND con.conname = 'fk_cronograma_tempo_estudos_frente_id'
  ) THEN
    ALTER TABLE public.cronograma_tempo_estudos
      ADD CONSTRAINT fk_cronograma_tempo_estudos_frente_id
      FOREIGN KEY (frente_id)
      REFERENCES public.frentes(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 5) Also enforce cronograma_tempo_estudos(disciplina_id) -> disciplinas(id) to avoid orphans
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    JOIN unnest(con.conkey) AS k(attnum) ON TRUE
    JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = k.attnum
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'cronograma_tempo_estudos'
      AND att.attname = 'disciplina_id'
  LOOP
    EXECUTE format('ALTER TABLE public.cronograma_tempo_estudos DROP CONSTRAINT %I', r.conname);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'cronograma_tempo_estudos'
      AND con.conname = 'fk_cronograma_tempo_estudos_disciplina_id'
  ) THEN
    ALTER TABLE public.cronograma_tempo_estudos
      ADD CONSTRAINT fk_cronograma_tempo_estudos_disciplina_id
      FOREIGN KEY (disciplina_id)
      REFERENCES public.disciplinas(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 6) Ensure sessoes_estudo(frente_id) does not block deletes and does not orphan: ON DELETE SET NULL
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    JOIN unnest(con.conkey) AS k(attnum) ON TRUE
    JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = k.attnum
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'sessoes_estudo'
      AND att.attname = 'frente_id'
  LOOP
    EXECUTE format('ALTER TABLE public.sessoes_estudo DROP CONSTRAINT %I', r.conname);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
      AND rel.relname = 'sessoes_estudo'
      AND con.conname = 'fk_sessoes_estudo_frente_id'
  ) THEN
    ALTER TABLE public.sessoes_estudo
      ADD CONSTRAINT fk_sessoes_estudo_frente_id
      FOREIGN KEY (frente_id)
      REFERENCES public.frentes(id)
      ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;

