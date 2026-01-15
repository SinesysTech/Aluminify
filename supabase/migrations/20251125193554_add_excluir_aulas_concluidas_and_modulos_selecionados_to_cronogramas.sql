-- Adicionar colunas faltantes na tabela cronogramas
ALTER TABLE public.cronogramas
    ADD COLUMN IF NOT EXISTS modulos_selecionados JSONB,
    ADD COLUMN IF NOT EXISTS excluir_aulas_concluidas BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.cronogramas.modulos_selecionados IS 'Lista de módulos escolhidos pelo aluno ao gerar o cronograma';
COMMENT ON COLUMN public.cronogramas.excluir_aulas_concluidas IS 'Indica se aulas já concluídas foram excluídas automaticamente do cronograma';;
