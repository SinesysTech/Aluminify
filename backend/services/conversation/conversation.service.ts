import { createClient } from '@/lib/server';
import type {
  Conversation,
  CreateConversationRequest,
  UpdateConversationRequest,
  ListConversationsRequest,
  DeleteConversationRequest,
  GetActiveConversationRequest,
} from './conversation.types';

export class ConversationService {
  /**
   * Criar nova conversa
   */
  async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    const supabase = await createClient();

    // Gerar session_id único
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: request.userId,
        session_id: sessionId,
        title: request.title || 'Nova Conversa',
        is_active: true, // Nova conversa sempre começa ativa
      })
      .select()
      .single();

    if (error) {
      console.error('[Conversation Service] Error creating conversation:', error);
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    console.log('[Conversation Service] ✅ Conversation created:', data.id);
    return data;
  }

  /**
   * Listar conversas do usuário
   */
  async listConversations(request: ListConversationsRequest): Promise<Conversation[]> {
    const supabase = await createClient();

    let query = supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', request.userId)
      .order('updated_at', { ascending: false });

    if (request.limit) {
      query = query.limit(request.limit);
    }

    if (request.offset) {
      query = query.range(request.offset, request.offset + (request.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Conversation Service] Error listing conversations:', error);
      throw new Error(`Failed to list conversations: ${error.message}`);
    }

    console.log('[Conversation Service] 📋 Listed', data?.length || 0, 'conversations');
    return data || [];
  }

  /**
   * Obter conversa ativa do usuário
   */
  async getActiveConversation(request: GetActiveConversationRequest): Promise<Conversation | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', request.userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('[Conversation Service] Error getting active conversation:', error);
      throw new Error(`Failed to get active conversation: ${error.message}`);
    }

    if (data) {
      console.log('[Conversation Service] ✅ Active conversation:', data.id);
    } else {
      console.log('[Conversation Service] ℹ️  No active conversation found');
    }

    return data;
  }

  /**
   * Obter conversa por ID
   */
  async getConversationById(id: string, userId: string): Promise<Conversation | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Conversation Service] Error getting conversation:', error);
      throw new Error(`Failed to get conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualizar conversa
   */
  async updateConversation(request: UpdateConversationRequest): Promise<Conversation> {
    const supabase = await createClient();

    const updates: Partial<Conversation> = {};

    if (request.title !== undefined) {
      updates.title = request.title;
    }

    if (request.is_active !== undefined) {
      updates.is_active = request.is_active;
    }

    const { data, error } = await supabase
      .from('chat_conversations')
      .update(updates)
      .eq('id', request.id)
      .eq('user_id', request.userId)
      .select()
      .single();

    if (error) {
      console.error('[Conversation Service] Error updating conversation:', error);
      throw new Error(`Failed to update conversation: ${error.message}`);
    }

    console.log('[Conversation Service] ✅ Conversation updated:', data.id);
    return data;
  }

  /**
   * Marcar conversa como ativa (desmarca outras)
   */
  async setActiveConversation(id: string, userId: string): Promise<Conversation> {
    return this.updateConversation({
      id,
      userId,
      is_active: true,
    });
  }

  /**
   * Deletar conversa
   */
  async deleteConversation(request: DeleteConversationRequest): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', request.id)
      .eq('user_id', request.userId);

    if (error) {
      console.error('[Conversation Service] Error deleting conversation:', error);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }

    console.log('[Conversation Service] 🗑️  Conversation deleted:', request.id);
  }

  /**
   * Obter ou criar conversa ativa
   * Se não houver conversa ativa, cria uma nova
   */
  async getOrCreateActiveConversation(userId: string): Promise<Conversation> {
    // Tentar obter conversa ativa
    let active = await this.getActiveConversation({ userId });

    // Se não houver, criar nova
    if (!active) {
      console.log('[Conversation Service] No active conversation, creating new one');
      active = await this.createConversation({ userId });
    }

    return active;
  }
}

export const conversationService = new ConversationService();
