import { NextResponse } from 'next/server';
import { conversationService } from '@/backend/services/conversation';
import { requireAuth, AuthenticatedRequest } from '@/backend/auth/middleware';

/**
 * GET /api/conversations/[id]
 * Obter conversa por ID
 */
async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const conversation = await conversationService.getConversationById(id, userId);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ data: conversation });
  } catch (error) {
    console.error('[Conversations API] Error getting conversation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/conversations/[id]
 * Atualizar conversa
 *
 * Body: { title?: string, is_active?: boolean }
 */
async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const conversation = await conversationService.updateConversation({
      id,
      userId,
      title: body.title,
      is_active: body.is_active,
    });

    return NextResponse.json({ data: conversation });
  } catch (error) {
    console.error('[Conversations API] Error updating conversation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id]
 * Deletar conversa
 */
async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await conversationService.deleteConversation({ id, userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Conversations API] Error deleting conversation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const PUT = requireAuth(putHandler);
export const DELETE = requireAuth(deleteHandler);
