-- Habilitar RLS nas 3 tabelas com problemas críticos
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos_disciplinas ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas RLS para chat_conversation_history
-- Usuários podem ver e gerenciar apenas seu próprio histórico
CREATE POLICY "Usuários gerenciam seu próprio histórico de chat"
  ON chat_conversation_history
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Adicionar políticas RLS para cursos_disciplinas
-- Todos podem ver as relações curso-disciplina (catálogo público)
CREATE POLICY "Relações curso-disciplina são públicas"
  ON cursos_disciplinas
  FOR SELECT
  USING (true);

-- Apenas professores podem gerenciar relações curso-disciplina
CREATE POLICY "Professores gerenciam relações curso-disciplina"
  ON cursos_disciplinas
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM professores
      WHERE id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professores
      WHERE id = (select auth.uid())
    )
  );

-- Corrigir search_path em todas as funções vulneráveis (usando assinaturas corretas)
ALTER FUNCTION set_chat_conversation_history_updated_at() SET search_path = public;
ALTER FUNCTION gerar_atividades_personalizadas(uuid, uuid) SET search_path = public;
ALTER FUNCTION notify_agendamento_change() SET search_path = public;
ALTER FUNCTION importar_cronograma_aulas(text, text, jsonb) SET search_path = public;
ALTER FUNCTION importar_cronograma_aulas(uuid, text, text, jsonb) SET search_path = public;
ALTER FUNCTION update_updated_at_column() SET search_path = public;
ALTER FUNCTION ensure_single_active_conversation() SET search_path = public;
ALTER FUNCTION set_modulo_curso_id_from_frente() SET search_path = public;
ALTER FUNCTION handle_updated_at() SET search_path = public;
ALTER FUNCTION handle_created_by() SET search_path = public;
ALTER FUNCTION handle_new_user() SET search_path = public;
ALTER FUNCTION check_and_set_first_professor_superadmin(uuid) SET search_path = public;
;
