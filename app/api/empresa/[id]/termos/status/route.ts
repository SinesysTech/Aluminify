import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/[tenant]/auth/middleware";
import { getDatabaseClient } from "@/app/shared/core/database/database";
import { consultarStatusAceite } from "@/app/shared/core/services/termos/termos.service";

/**
 * GET /api/empresa/[id]/termos/status
 *
 * Retorna o status de aceite de cada documento legal para o admin autenticado.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: empresaId } = await params;
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar que o usuário pertence ao tenant
    const adminClient = getDatabaseClient();
    const { data: vinculo } = await adminClient
      .from("usuarios_empresas")
      .select("is_admin, is_owner")
      .eq("usuario_id", user.id)
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .maybeSingle();

    if (!vinculo) {
      return NextResponse.json(
        { error: "Usuário não pertence a esta empresa." },
        { status: 403 },
      );
    }

    const status = await consultarStatusAceite(user.id, empresaId);

    return NextResponse.json({ status }, { status: 200 });
  } catch (error) {
    console.error("Error fetching terms status:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao consultar status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
