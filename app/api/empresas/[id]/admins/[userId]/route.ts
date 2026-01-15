import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { getAuthUser } from '@/backend/auth/middleware';
import { getEmpresaContext, validateEmpresaAccess } from '@/backend/middleware/empresa-context';
import type { Database } from '@/lib/database.types';

interface RouteContext {
  params: Promise<{ id: string; userId: string }>;
}

async function deleteHandler(
  request: NextRequest,
  routeContext: RouteContext
) {
  try {
    const { id, userId } = await routeContext.params;
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    const context = await getEmpresaContext(supabase, user.id, request, user);
    
    // Verificar se é owner ou superadmin
    const { data: isOwner } = await supabase
      .from('empresa_admins' as any) // Table not in generated types yet
      .select('is_owner')
      .eq('empresa_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    // Type assertion: Query result for table not yet in generated types
    const typedIsOwner = isOwner as { is_owner: boolean } | null;

    if (!context.isSuperAdmin && (!validateEmpresaAccess(context, id) || !typedIsOwner?.is_owner)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas owner ou superadmin pode remover admins.' },
        { status: 403 }
      );
    }

    // Não permitir remover a si mesmo se for o único owner
    if (userId === user.id) {
      const { data: owners } = await supabase
        .from('empresa_admins' as any) // Table not in generated types yet
        .select('user_id')
        .eq('empresa_id', id)
        .eq('is_owner', true);

      // Type assertion: Query result for table not yet in generated types
      const typedOwners = owners as { user_id: string }[] | null;

      if (typedOwners && typedOwners.length === 1 && typedOwners[0].user_id === user.id) {
        return NextResponse.json(
          { error: 'Não é possível remover o único owner da empresa' },
          { status: 400 }
        );
      }
    }

    // Remover de empresa_admins
    const { error: deleteError } = await supabase
      .from('empresa_admins' as any) // Table not in generated types yet
      .delete()
      .eq('empresa_id', id)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    // Atualizar is_admin na tabela professores
    const updateData = { is_admin: false };
    await supabase
      .from('professores')
      // @ts-ignore - Update type inference issue with generated types
      .update(updateData)
      .eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing admin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao remover admin';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/empresas/[id]/admins/[userId] - Remover admin
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return deleteHandler(request, context);
}

