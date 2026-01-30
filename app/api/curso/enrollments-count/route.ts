import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/app/[tenant]/auth/middleware';
import { getDatabaseClient } from '@/app/shared/core/database/database';

async function getEnrollmentsCountHandler(request: AuthenticatedRequest) {
  try {
    const db = getDatabaseClient();
    const empresaId = request.user?.empresaId;

    if (!empresaId) {
      return NextResponse.json({ error: 'Empresa não identificada' }, { status: 400 });
    }

    // Contagem por curso: usar alunos_cursos (fonte das matrículas) com cursos da empresa.
    // A tabela matriculas não é usada para matrículas vindas de Hotmart/UI principal.
    const { data, error } = await db
      .from('alunos_cursos')
      .select('curso_id, cursos!inner(empresa_id)')
      .eq('cursos.empresa_id', empresaId);

    if (error) {
      console.error('[Enrollments Count API] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count enrollments per course
    const counts: Record<string, number> = {};
    for (const row of data || []) {
      if (row.curso_id) {
        counts[row.curso_id] = (counts[row.curso_id] || 0) + 1;
      }
    }

    return NextResponse.json({ data: counts });
  } catch (error) {
    console.error('[Enrollments Count API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return requireAuth(getEnrollmentsCountHandler)(request);
}
