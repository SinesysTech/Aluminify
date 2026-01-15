-- Migration: Create cronograma_semanas_dias table
-- Description: Armazena a distribuição global de dias da semana para cada cronograma
-- Author: Claude Code
-- Date: 2025-01-28

-- 1. Tabela para armazenar distribuição de dias da semana (global para todo o cronograma)
CREATE TABLE IF NOT EXISTS public.cronograma_semanas_dias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cronograma_id UUID NOT NULL REFERENCES public.cronogramas(id) ON DELETE CASCADE,
    
    -- Array de inteiros representando os dias da semana (0=domingo, 1=segunda, ..., 6=sábado)
    -- Exemplo: [1, 2, 3, 4, 5] = segunda a sexta
    dias_semana INTEGER[] NOT NULL DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que cada cronograma tenha apenas um registro de distribuição
    CONSTRAINT unique_cronograma_dias UNIQUE (cronograma_id)
);

-- 2. Adicionar campo data_prevista na tabela cronograma_itens
-- Este campo armazenará a data calculada baseada na distribuição de dias
ALTER TABLE public.cronograma_itens
ADD COLUMN IF NOT EXISTS data_prevista DATE;

-- Comentários
COMMENT ON TABLE public.cronograma_semanas_dias IS 'Armazena a distribuição global de dias da semana para cada cronograma. A distribuição é aplicada a todas as semanas do cronograma.';
COMMENT ON COLUMN public.cronograma_semanas_dias.dias_semana IS 'Array de inteiros representando os dias da semana: 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado';
COMMENT ON COLUMN public.cronograma_itens.data_prevista IS 'Data prevista para a aula, calculada baseada na semana_numero, ordem_na_semana e distribuição de dias da semana';

-- 3. Índices para Performance
CREATE INDEX IF NOT EXISTS idx_cronograma_semanas_dias_cronograma ON public.cronograma_semanas_dias(cronograma_id);
CREATE INDEX IF NOT EXISTS idx_cronograma_itens_data_prevista ON public.cronograma_itens(cronograma_id, data_prevista);

-- 4. Trigger de Updated_at
DROP TRIGGER IF EXISTS on_update_cronograma_semanas_dias ON public.cronograma_semanas_dias;
CREATE TRIGGER on_update_cronograma_semanas_dias 
    BEFORE UPDATE ON public.cronograma_semanas_dias 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Segurança (RLS)
ALTER TABLE public.cronograma_semanas_dias ENABLE ROW LEVEL SECURITY;

-- Política: O aluno tem controle total sobre a distribuição de dias do SEU cronograma
DROP POLICY IF EXISTS "Aluno gerencia distribuição de dias do seu cronograma" ON public.cronograma_semanas_dias;
CREATE POLICY "Aluno gerencia distribuição de dias do seu cronograma" 
    ON public.cronograma_semanas_dias
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.cronogramas c 
            WHERE c.id = cronograma_semanas_dias.cronograma_id 
            AND c.aluno_id = auth.uid()
        )
    );;
