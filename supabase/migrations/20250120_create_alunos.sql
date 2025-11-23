-- Migration: Create alunos table
-- Description: Tabela de alunos que referencia auth.users
-- Author: Claude Code
-- Date: 2025-01-20

-- Tabela de Alunos (Depende do Auth do Supabase)
CREATE TABLE IF NOT EXISTS public.alunos (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    email TEXT UNIQUE NOT NULL,
    cpf TEXT UNIQUE,
    telefone TEXT,
    data_nascimento DATE,
    endereco TEXT,
    cep TEXT,
    numero_matricula TEXT UNIQUE,
    instagram TEXT,
    twitter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at automaticamente
-- A função handle_updated_at() deve existir no banco
-- Se não existir, criar com:
-- CREATE OR REPLACE FUNCTION handle_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

CREATE TRIGGER update_alunos_updated_at
    BEFORE UPDATE ON public.alunos
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- RLS Policies para alunos
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- Alunos podem ver e editar apenas seus próprios dados
CREATE POLICY "Users can view their own aluno data"
    ON public.alunos FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own aluno data"
    ON public.alunos FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own aluno data"
    ON public.alunos FOR INSERT
    WITH CHECK (auth.uid() = id);

