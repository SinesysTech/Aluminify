-- Migration: Create handle_updated_at function
-- Description: Função para atualizar automaticamente o campo updated_at
-- Author: Claude Code
-- Date: 2025-01-19

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

