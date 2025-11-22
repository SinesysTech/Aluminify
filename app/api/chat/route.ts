import { NextResponse } from 'next/server';
import {
  chatService,
  ChatValidationError,
  ChatServiceError,
} from '@/backend/services/chat';
import { conversationService } from '@/backend/services/conversation';
import { requireAuth, AuthenticatedRequest } from '@/backend/auth/middleware';

function handleError(error: unknown) {
  if (error instanceof ChatValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof ChatServiceError) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  // Log detalhado do erro
  console.error('[Chat API] Error:', error);

  // Extrair mensagem de erro mais detalhada
  let errorMessage = 'Internal server error';
  if (error instanceof Error) {
    errorMessage = error.message || errorMessage;
    console.error('[Chat API] Error stack:', error.stack);
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }

  return NextResponse.json({
    error: errorMessage,
    details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
  }, { status: 500 });
}

/**
 * POST - Enviar mensagem para o chat (sem streaming)
 *
 * Body esperado:
 * {
 *   "message": "texto da mensagem",
 *   "sessionId": "session-id",
 *   "userId": "user-id"
 * }
 *
 * Resposta:
 * {
 *   "data": {
 *     "output": "resposta do agente"
 *   }
 * }
 */
async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    console.log('[Chat API] ========== POST REQUEST ==========');
    console.log('[Chat API] Message:', body.message?.substring(0, 100));

    if (!body?.message) {
      return NextResponse.json({
        error: 'Campo obrigatório: message é necessário'
      }, { status: 400 });
    }

    // Usar userId do usuário autenticado ou do body
    const userId = body.userId || request.user?.id;
    if (!userId) {
      return NextResponse.json({
        error: 'User ID é necessário (fornecido no body ou via autenticação)'
      }, { status: 400 });
    }

    console.log('[Chat API] UserId:', userId);

    // Obter ou criar conversa ativa para o usuário
    const conversation = await conversationService.getOrCreateActiveConversation(userId);

    console.log('[Chat API] Conversation ID:', conversation.id);
    console.log('[Chat API] SessionId:', conversation.session_id);
    console.log('[Chat API] ➡️  Enviando para N8N webhook...');

    // Enviar para o N8N e aguardar resposta
    const response = await chatService.sendMessage({
      message: body.message,
      sessionId: conversation.session_id,
      userId: userId,
    });

    console.log('[Chat API] ✅ Resposta recebida do N8N');
    console.log('[Chat API] Output length:', response.output?.length || 0);
    console.log('[Chat API] Output preview:', response.output?.substring(0, 100));

    // Salvar mensagens no histórico da conversa
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: body.message,
      timestamp: Date.now(),
    };

    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant' as const,
      content: response.output || '',
      timestamp: Date.now(),
    };

    await conversationService.addMessagesToConversation(
      conversation.id,
      userId,
      userMessage,
      assistantMessage
    );

    console.log('[Chat API] ✅ Messages saved to conversation history');
    console.log('[Chat API] ==========================================');

    return NextResponse.json({
      data: response,
      conversationId: conversation.id
    });
  } catch (error) {
    return handleError(error);
  }
}

// POST simples - apenas envia para N8N e retorna a resposta
export const POST = requireAuth(postHandler);
