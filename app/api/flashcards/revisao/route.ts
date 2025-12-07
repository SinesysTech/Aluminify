import { NextResponse } from 'next/server';
import { requireUserAuth, AuthenticatedRequest } from '@/backend/auth/middleware';
import { flashcardsService } from '@/backend/services/flashcards/flashcards.service';

async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modo = searchParams.get('modo') ?? 'revisao_geral';

    const data = await flashcardsService.listForReview(request.user!.id, modo);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[flashcards/revisao]', error);
    const message = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const GET = requireUserAuth(handler);
