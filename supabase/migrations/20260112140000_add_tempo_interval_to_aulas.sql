-- Migration: Add interval duration column to aulas and sync with minutes
-- Date: 2026-01-12

BEGIN;

-- 1) New column that accepts values like '00:09:06'
ALTER TABLE public.aulas
  ADD COLUMN IF NOT EXISTS tempo_estimado_interval INTERVAL;

-- 2) Backfill interval from existing minutes (if present)
UPDATE public.aulas
SET tempo_estimado_interval = make_interval(mins => tempo_estimado_minutos)
WHERE tempo_estimado_interval IS NULL
  AND tempo_estimado_minutos IS NOT NULL;

-- 3) Keep both columns in sync
CREATE OR REPLACE FUNCTION public.sync_aulas_tempo_estimado()
RETURNS TRIGGER AS $$
DECLARE
  minutes_from_interval integer;
BEGIN
  -- If interval provided, it wins; compute minutes from it
  IF NEW.tempo_estimado_interval IS NOT NULL THEN
    minutes_from_interval := GREATEST(1, ROUND(EXTRACT(EPOCH FROM NEW.tempo_estimado_interval) / 60.0)::int);
    NEW.tempo_estimado_minutos := minutes_from_interval;
    RETURN NEW;
  END IF;

  -- Otherwise, if minutes provided, compute interval
  IF NEW.tempo_estimado_minutos IS NOT NULL THEN
    NEW.tempo_estimado_interval := make_interval(mins => NEW.tempo_estimado_minutos);
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_aulas_tempo_estimado ON public.aulas;
CREATE TRIGGER trg_sync_aulas_tempo_estimado
BEFORE INSERT OR UPDATE ON public.aulas
FOR EACH ROW
EXECUTE FUNCTION public.sync_aulas_tempo_estimado();

COMMIT;

