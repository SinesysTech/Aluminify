import { NextResponse } from 'next/server';
import {
  segmentService,
  SegmentConflictError,
  SegmentValidationError,
} from '@/backend/services/segment';
import { requireAuth, AuthenticatedRequest } from '@/backend/auth/middleware';

const serializeSegment = (segment: Awaited<ReturnType<typeof segmentService.getById>>) => ({
  id: segment.id,
  name: segment.name,
  slug: segment.slug,
  createdAt: segment.createdAt.toISOString(),
  updatedAt: segment.updatedAt.toISOString(),
});

function handleError(error: unknown) {
  if (error instanceof SegmentValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof SegmentConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  // Log detalhado do erro
  console.error('Segment API Error:', error);
  
  // Extrair mensagem de erro mais detalhada
  let errorMessage = 'Internal server error';
  if (error instanceof Error) {
    errorMessage = error.message || errorMessage;
    console.error('Error stack:', error.stack);
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

// GET é público (catálogo)
export async function GET() {
  try {
    const segments = await segmentService.list();
    return NextResponse.json({ data: segments.map(serializeSegment) });
  } catch (error) {
    return handleError(error);
  }
}

// POST requer autenticação de professor (JWT ou API Key)
async function postHandler(request: AuthenticatedRequest) {
  console.log('[Segment POST] Auth check:', {
    hasUser: !!request.user,
    hasApiKey: !!request.apiKey,
    userRole: request.user?.role,
    userIsSuperAdmin: request.user?.isSuperAdmin,
  });

  if (request.user && request.user.role !== 'professor' && request.user.role !== 'superadmin') {
    console.log('[Segment POST] Forbidden - user role:', request.user.role);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    console.log('[Segment POST] Request body:', body);
    
    if (!body?.name || !body?.slug) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: name e slug são necessários' 
      }, { status: 400 });
    }
    
    const segment = await segmentService.create({ name: body.name, slug: body.slug });
    console.log('[Segment POST] Segment created:', segment.id);
    return NextResponse.json({ data: serializeSegment(segment) }, { status: 201 });
  } catch (error) {
    console.error('[Segment POST] Error creating segment:', error);
    return handleError(error);
  }
}

export const POST = requireAuth(postHandler);

