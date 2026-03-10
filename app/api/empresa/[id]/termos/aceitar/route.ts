import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/[tenant]/auth/middleware";
import { getDatabaseClient } from "@/app/shared/core/database/database";
import {
  registrarAceite,
  invalidarCacheAceite,
} from "@/app/shared/core/services/termos/termos.service";
import { invalidateAuthSessionCache } from "@/app/shared/core/auth";

/**
 * POST /api/empresa/[id]/termos/aceitar
 *
 * Registra o aceite dos 3 documentos legais vigentes por um admin do tenant.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: empresaId } = await params;
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar que o usuário é admin do tenant
    const adminClient = getDatabaseClient();
    const { data: vinculo } = await adminClient
      .from("usuarios_empresas")
      .select("is_admin, is_owner")
      .eq("usuario_id", user.id)
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .maybeSingle();

    if (!vinculo?.is_admin && !vinculo?.is_owner) {
      return NextResponse.json(
        { error: "Apenas administradores podem aceitar os termos." },
        { status: 403 },
      );
    }

    // Capturar IP e user-agent
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;
    const userAgent = request.headers.get("user-agent") ?? null;

    await registrarAceite({
      usuarioId: user.id,
      empresaId,
      ipAddress,
      userAgent,
    });

    // Invalidar caches para forçar refresh do status
    await invalidarCacheAceite(user.id, empresaId);
    await invalidateAuthSessionCache(user.id);

    return NextResponse.json(
      { message: "Termos aceitos com sucesso." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error accepting terms:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao aceitar termos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
