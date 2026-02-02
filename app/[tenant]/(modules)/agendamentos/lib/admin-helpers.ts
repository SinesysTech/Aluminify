"use server";

import { getAuthenticatedUser } from "@/app/shared/core/auth";
import { isAdminRoleTipo, isTeachingRoleTipo } from "@/app/shared/core/roles";
import { getDatabaseClient } from "@/app/shared/core/database/database";

/**
 * Verifica se o usuário logado pode gerenciar a agenda de um professor.
 * Retorna true se:
 * - O usuário É o professor (self)
 * - Ou o usuário é admin da mesma empresa do professor
 *
 * Lança erro se não autenticado.
 */
export async function canManageProfessorSchedule(
  professorId: string,
): Promise<boolean> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  // Self - always allowed
  if (user.id === professorId) return true;

  // Check if user is admin
  if (!user.roleType || !isAdminRoleTipo(user.roleType)) return false;
  if (!user.empresaId) return false;

  // Verify target professor is in the same empresa
  const adminClient = getDatabaseClient();
  const { data: targetUser } = await adminClient
    .from("usuarios")
    .select("empresa_id")
    .eq("id", professorId)
    .eq("ativo", true)
    .is("deleted_at", null)
    .single();

  if (!targetUser || targetUser.empresa_id !== user.empresaId) return false;

  return true;
}

/**
 * Verifica se o usuário logado é admin e retorna seus dados.
 * Retorna null se não for admin.
 */
export async function getAdminContext() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const isAdmin = user.roleType ? isAdminRoleTipo(user.roleType) : false;
  const isTeacher = user.roleType ? isTeachingRoleTipo(user.roleType) : false;

  return {
    userId: user.id,
    empresaId: user.empresaId,
    isAdmin,
    isTeacher,
    roleType: user.roleType,
  };
}

interface ProfessorOption {
  id: string;
  fullName: string;
}

/**
 * Retorna a lista de professores (com papel de ensino) da empresa.
 * Para uso no seletor de admin.
 */
export async function getTeachersForAdminSelector(
  empresaId: string,
): Promise<ProfessorOption[]> {
  const adminClient = getDatabaseClient();

  const { data, error } = await adminClient
    .from("usuarios")
    .select("id, nome_completo, papel_id, papeis!inner(tipo)")
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .is("deleted_at", null)
    .in("papeis.tipo", ["professor", "professor_admin", "monitor"])
    .order("nome_completo", { ascending: true });

  if (error) {
    console.error("Error fetching teachers for admin selector:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    fullName: row.nome_completo || row.id,
  }));
}
