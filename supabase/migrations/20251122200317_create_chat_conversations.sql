-- Migration: Create chat_conversations table
-- Description: Gerenciamento de sessões de chat para o TobIAs
-- Author: Claude Code
-- Date: 2025-01-22

-- Criar tabela de conversas
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Nova Conversa',
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE
);

-- Comentários na tabela e colunas
COMMENT ON TABLE chat_conversations IS 'Gerenciamento de sessões de chat do TobIAs';
COMMENT ON COLUMN chat_conversations.session_id IS 'ID único usado para comunicação com N8N (memória do agente)';
COMMENT ON COLUMN chat_conversations.messages IS 'Histórico completo de mensagens da conversa em formato JSON';
COMMENT ON COLUMN chat_conversations.is_active IS 'Indica a conversa atualmente ativa do usuário (apenas uma por usuário)';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id
  ON chat_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id
  ON chat_conversations(session_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_active
  ON chat_conversations(user_id, is_active)
  WHERE is_active = TRUE;

-- RLS (Row Level Security)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só pode ver suas próprias conversas
DROP POLICY IF EXISTS "Users can view their own conversations" ON chat_conversations;
CREATE POLICY "Users can view their own conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuário pode inserir suas próprias conversas
DROP POLICY IF EXISTS "Users can insert their own conversations" ON chat_conversations;
CREATE POLICY "Users can insert their own conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuário pode atualizar suas próprias conversas
DROP POLICY IF EXISTS "Users can update their own conversations" ON chat_conversations;
CREATE POLICY "Users can update their own conversations"
  ON chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuário pode deletar suas próprias conversas
DROP POLICY IF EXISTS "Users can delete their own conversations" ON chat_conversations;
CREATE POLICY "Users can delete their own conversations"
  ON chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para garantir apenas uma conversa ativa por usuário
CREATE OR REPLACE FUNCTION ensure_single_active_conversation()
RETURNS TRIGGER AS $$
BEGIN
  -- Se está marcando como ativa
  IF NEW.is_active = TRUE THEN
    -- Desmarcar todas as outras conversas deste usuário
    UPDATE chat_conversations
    SET is_active = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_active_conversation_trigger ON chat_conversations;
CREATE TRIGGER ensure_single_active_conversation_trigger
  BEFORE INSERT OR UPDATE ON chat_conversations
  FOR EACH ROW
  WHEN (NEW.is_active = TRUE)
  EXECUTE FUNCTION ensure_single_active_conversation();;
