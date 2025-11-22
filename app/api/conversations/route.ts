import { NextResponse } from 'next/server';
import { conversationService } from '@/backend/services/conversation';
import { requireAuth, AuthenticatedRequest } from '@/backend/auth/middleware';

/**
 * GET /api/conversations
 * Listar todas as conversas do usuário
 */
async function getHandler(request: AuthenticatedRequest) {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await conversationService.listConversations({ userId });

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error('[Conversations API] Error listing conversations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Criar nova conversa
 *
 * Body: { title?: string }
 */
async function postHandler(request: AuthenticatedRequest) {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const conversation = await conversationService.createConversation({
      userId,
      title: body.title,
    });

    return NextResponse.json({ data: conversation }, { status: 201 });
  } catch (error) {
    console.error('[Conversations API] Error creating conversation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);
