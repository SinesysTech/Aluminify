import { SupabaseClient } from "@supabase/supabase-js";
import { AuthUser } from "@/app/[tenant]/auth/middleware";

export interface EmpresaContext {
  empresaId: string | null;
}

/**
 * Extrai o contexto de empresa do usuário logado
 * Busca empresa_id do usuario logado
 */
export async function getEmpresaContext(
  client: SupabaseClient,
  userId: string | null,
  _request?: unknown,
  authUser?: AuthUser | null,
): Promise<EmpresaContext> {
  if (!userId) {
    return { empresaId: null };
  }

  // Buscar empresa_id do usuário (tabela usuarios)
  const { data: usuario, error } = await client
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .eq("ativo", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Error fetching usuario empresa_id:", error);
    // Se não encontrar registro do usuário, tentar buscar do metadata
    // Isso pode acontecer se a trigger ainda não executou
    if (authUser) {
      const empresaIdFromMetadata =
        (
          authUser as {
            user_metadata?: { empresa_id?: string };
            empresaId?: string;
          }
        )?.user_metadata?.empresa_id ||
        (authUser as { empresaId?: string })?.empresaId;
      if (empresaIdFromMetadata) {
        return {
          empresaId: empresaIdFromMetadata,
        };
      }
    }
    return { empresaId: null };
  }

  // Se não encontrou registro do usuário mas tem empresa_id no metadata, usar metadata
  if (!usuario?.empresa_id && authUser?.empresaId) {
    return {
      empresaId: authUser.empresaId,
    };
  }

  return {
    empresaId: usuario?.empresa_id ?? null,
  };
}

/**
 * Valida se o usuário tem acesso à empresa especificada
 */
export function validateEmpresaAccess(
  context: EmpresaContext,
  empresaId: string | null,
): boolean {
  if (!empresaId) {
    return false;
  }

  // Usuário deve pertencer à empresa
  return context.empresaId === empresaId;
}
