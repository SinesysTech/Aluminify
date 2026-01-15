BEGIN;

CREATE OR REPLACE FUNCTION public.sync_aulas_tempo_estimado()
RETURNS TRIGGER AS $$
DECLARE
  minutes_from_interval integer;
BEGIN
  -- If interval provided, it wins; compute minutes from it (ARREDONDA PRA CIMA)
  IF NEW.tempo_estimado_interval IS NOT NULL THEN
    minutes_from_interval := GREATEST(1, CEIL(EXTRACT(EPOCH FROM NEW.tempo_estimado_interval) / 60.0)::int);
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

COMMIT;
;
