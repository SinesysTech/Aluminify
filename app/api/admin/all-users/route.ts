// @ts-nocheck - Temporary: Supabase types need to be regenerated after new migrations
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { getAuthUser } from '@/backend/auth/middleware';

/**
 * GET /api/admin/all-users
 * Lista todos os professores de todas as empresas (apenas superadmin)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user || user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas superadmin pode listar todos os usuários.' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Buscar todos os professores com informações da empresa
    const { data: professores, error } = await supabase
      .from('professores')
      .select(`
        id,
        email,
        nome_completo,
        is_admin,
        empresa_id,
        empresas!professores_empresa_id_fkey (
          id,
          nome
        ),
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(professores || []);
  } catch (error) {
    console.error('Error listing all users:', error);
    return NextResponse.json(
      { error: 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}

