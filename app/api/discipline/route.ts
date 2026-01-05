import { NextResponse } from 'next/server';
import {
  disciplineService,
  DisciplineConflictError,
  DisciplineValidationError,
} from '@/backend/services/discipline';
import { requireAuth, AuthenticatedRequest } from '@/backend/auth/middleware';

const serializeDiscipline = (discipline: Awaited<ReturnType<typeof disciplineService.getById>>) => ({
  id: discipline.id,
  name: discipline.name,
  createdAt: discipline.createdAt.toISOString(),
  updatedAt: discipline.updatedAt.toISOString(),
});

function handleError(error: unknown) {
  if (error instanceof DisciplineValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof DisciplineConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  // Log detalhado do erro
  console.error('Discipline API Error:', error);
  
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
    const startTime = Date.now();
    const result = await disciplineService.list();
    const endTime = Date.now();
    
    const disciplines = Array.isArray(result) ? result : result.data;
    
    // Log de performance em desenvolvimento
    const duration = endTime - startTime;
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.warn(`[Discipline API] GET lento: ${duration}ms`);
    }
    
    const response = NextResponse.json({ data: disciplines.map(serializeDiscipline) });
    
    // Adicionar headers de cache HTTP (5 minutos)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    return handleError(error);
  }
}

// POST requer autenticação de professor (JWT ou API Key)
async function postHandler(request: AuthenticatedRequest) {
  // API Keys têm acesso total (request.apiKey existe)
  // Se for JWT, verificar se é professor ou superadmin
  console.log('[Discipline POST] Auth check:', {
    hasUser: !!request.user,
    hasApiKey: !!request.apiKey,
    userRole: request.user?.role,
    userIsSuperAdmin: request.user?.isSuperAdmin,
  });

  if (request.user && request.user.role !== 'professor' && request.user.role !== 'superadmin') {
    console.log('[Discipline POST] Forbidden - user role:', request.user.role);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    console.log('[Discipline POST] Request body:', body);
    
    if (!body?.name) {
      return NextResponse.json({ 
        error: 'Campo obrigatório: name é necessário' 
      }, { status: 400 });
    }
    
    const discipline = await disciplineService.create({ name: body.name });
    console.log('[Discipline POST] Discipline created:', discipline.id);
    return NextResponse.json({ data: serializeDiscipline(discipline) }, { status: 201 });
  } catch (error) {
    console.error('[Discipline POST] Error creating discipline:', error);
    return handleError(error);
  }
}

export const POST = requireAuth(postHandler);


