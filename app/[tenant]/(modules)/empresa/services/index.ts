import { SupabaseClient } from "@supabase/supabase-js";
import { getDatabaseClient } from "@/app/shared/core/database/database";
import { EmpresaRepositoryImpl } from "./empresa.repository";
import { EmpresaService } from "./empresa.service";

// === EMPRESA SERVICE FACTORY ===

/**
 * Factory function para criar EmpresaService com cliente Supabase específico.
 * Use esta função quando precisar que as RLS policies sejam aplicadas.
 *
 * @param client - Cliente Supabase com contexto do usuário autenticado
 * @returns Instância de EmpresaService que respeita RLS
 */
export function createEmpresaService(client: SupabaseClient): EmpresaService {
  const repository = new EmpresaRepositoryImpl(client);
  return new EmpresaService(repository, client);
}

// === ADMIN EMPRESA SERVICE (bypassa RLS - usar apenas em contextos seguros) ===

let _adminEmpresaService: EmpresaService | null = null;

function getAdminEmpresaService(): EmpresaService {
  if (!_adminEmpresaService) {
    const databaseClient = getDatabaseClient();
    const repository = new EmpresaRepositoryImpl(databaseClient);
    _adminEmpresaService = new EmpresaService(repository, databaseClient);
  }
  return _adminEmpresaService;
}

/**
 * @deprecated Use createEmpresaService(client) com cliente do usuário para respeitar RLS.
 * Este proxy usa admin client e BYPASSA todas as RLS policies.
 */
export const empresaService = new Proxy({} as EmpresaService, {
  get(_target, prop) {
    return getAdminEmpresaService()[prop as keyof EmpresaService];
  },
});

// === RE-EXPORTS ===

// Types
export * from "./empresa.types";

// Repositories
export * from "./empresa.repository";

// Services
export * from "./empresa.service";
export * from "./tenant-resolver.service";
export * from "./tenant-resolver.types";
