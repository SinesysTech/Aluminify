-- Migration: Add triggers for agendamento notifications

-- =============================================
-- Function to create notification on agendamento changes
-- =============================================

CREATE OR REPLACE FUNCTION notify_agendamento_change()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT: Create notification for professor (new appointment request)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
    VALUES (NEW.id, 'criacao', NEW.professor_id);
    RETURN NEW;
  END IF;

  -- On UPDATE: Handle status changes
  IF TG_OP = 'UPDATE' THEN
    -- Status changed to confirmed
    IF OLD.status != 'confirmado' AND NEW.status = 'confirmado' THEN
      INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
      VALUES (NEW.id, 'confirmacao', NEW.aluno_id);
    END IF;

    -- Status changed to cancelled (rejection or cancellation)
    IF OLD.status != 'cancelado' AND NEW.status = 'cancelado' THEN
      -- If cancelled by professor (rejecting a pending), notify student
      IF OLD.status = 'pendente' AND NEW.cancelado_por = NEW.professor_id THEN
        INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
        VALUES (NEW.id, 'rejeicao', NEW.aluno_id);
      -- If cancelled by student, notify professor
      ELSIF NEW.cancelado_por = NEW.aluno_id THEN
        INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
        VALUES (NEW.id, 'cancelamento', NEW.professor_id);
      -- If cancelled by professor (after confirmation), notify student
      ELSIF NEW.cancelado_por = NEW.professor_id THEN
        INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
        VALUES (NEW.id, 'cancelamento', NEW.aluno_id);
      END IF;
    END IF;

    -- Link reuniao updated (notify student)
    IF OLD.link_reuniao IS DISTINCT FROM NEW.link_reuniao AND NEW.link_reuniao IS NOT NULL THEN
      IF NEW.status = 'confirmado' THEN
        INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
        VALUES (NEW.id, 'alteracao', NEW.aluno_id);
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Create triggers
-- =============================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_agendamento_change ON agendamentos;

-- Create trigger for INSERT and UPDATE
CREATE TRIGGER on_agendamento_change
  AFTER INSERT OR UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION notify_agendamento_change();

-- =============================================
-- Add index to improve notification queries
-- =============================================

CREATE INDEX IF NOT EXISTS idx_agendamento_notificacoes_pending
  ON agendamento_notificacoes(agendamento_id, tipo, destinatario_id)
  WHERE enviado = false;;
