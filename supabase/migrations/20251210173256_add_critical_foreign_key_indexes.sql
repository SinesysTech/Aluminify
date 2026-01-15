-- Adicionar índices para os foreign keys mais utilizados
-- Isso melhorará significativamente a performance de JOINs

-- Tabela: agendamento_disponibilidade
CREATE INDEX IF NOT EXISTS idx_agendamento_disponibilidade_professor_id 
  ON agendamento_disponibilidade(professor_id);

-- Tabela: agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_cancelado_por 
  ON agendamentos(cancelado_por);

-- Tabela: api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by 
  ON api_keys(created_by);

-- Tabela: atividades
CREATE INDEX IF NOT EXISTS idx_atividades_created_by 
  ON atividades(created_by);

-- Tabela: aulas_concluidas
CREATE INDEX IF NOT EXISTS idx_aulas_concluidas_aula_id 
  ON aulas_concluidas(aula_id);

-- Tabela: cronogramas
CREATE INDEX IF NOT EXISTS idx_cronogramas_curso_alvo_id 
  ON cronogramas(curso_alvo_id);

-- Tabela: cursos (múltiplos FKs)
CREATE INDEX IF NOT EXISTS idx_cursos_created_by 
  ON cursos(created_by);
CREATE INDEX IF NOT EXISTS idx_cursos_disciplina_id 
  ON cursos(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_cursos_segmento_id 
  ON cursos(segmento_id);

-- Tabela: disciplinas
CREATE INDEX IF NOT EXISTS idx_disciplinas_created_by 
  ON disciplinas(created_by);

-- Tabela: frentes
CREATE INDEX IF NOT EXISTS idx_frentes_created_by 
  ON frentes(created_by);

-- Tabela: materiais_curso
CREATE INDEX IF NOT EXISTS idx_materiais_curso_created_by 
  ON materiais_curso(created_by);
CREATE INDEX IF NOT EXISTS idx_materiais_curso_curso_id 
  ON materiais_curso(curso_id);

-- Tabela: matriculas
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno_id 
  ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_curso_id 
  ON matriculas(curso_id);

-- Tabela: progresso_atividades
CREATE INDEX IF NOT EXISTS idx_progresso_atividades_atividade_id 
  ON progresso_atividades(atividade_id);

-- Tabela: segmentos
CREATE INDEX IF NOT EXISTS idx_segmentos_created_by 
  ON segmentos(created_by);

-- Tabela: sessoes_estudo
CREATE INDEX IF NOT EXISTS idx_sessoes_estudo_atividade_relacionada_id 
  ON sessoes_estudo(atividade_relacionada_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_estudo_frente_id 
  ON sessoes_estudo(frente_id);
;
