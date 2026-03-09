/**
 * Superadmin Authentication Service
 *
 * Handles authentication and authorization for superadmin users.
 * Uses Supabase Auth for login, with a dedicated `superadmins` table
 * to verify superadmin status — completely separate from tenant auth.
 */

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/shared/core/server";
import { getDatabaseClient } from "@/app/shared/core/database/database";

export interface SuperadminUser {
  id: string;
  authUserId: string;
  name: string;
  email: string;
}

/**
 * Verifica se o usuário autenticado atual é um superadmin ativo.
 * Usa React cache() para deduplicar chamadas no mesmo request.
 */
async function _getAuthenticatedSuperadmin(): Promise<SuperadminUser | null> {
  try {
    // 1. Verificar sessão Supabase Auth (JWT via cookies)
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // 2. Verificar na tabela superadmins (via service role — bypassa RLS)
    const db = getDatabaseClient();
    const { data: superadmin } = await db
      .from("superadmins")
      .select("id, auth_user_id, name, email")
      .eq("auth_user_id", user.id)
      .eq("active", true)
      .maybeSingle();

    if (!superadmin) {
      return null;
    }

    return {
      id: superadmin.id,
      authUserId: superadmin.auth_user_id,
      name: superadmin.name,
      email: superadmin.email,
    };
  } catch (err) {
    console.error("[Superadmin Auth] Error checking superadmin status:", err);
    return null;
  }
}

export const getAuthenticatedSuperadmin = cache(_getAuthenticatedSuperadmin);

/**
 * Exige autenticação de superadmin. Redireciona para login se não autenticado.
 * Usar em Server Components e Server Actions das páginas /superadmin/*.
 */
export async function requireSuperadmin(): Promise<SuperadminUser> {
  const superadmin = await getAuthenticatedSuperadmin();

  if (!superadmin) {
    redirect("/superadmin/login");
  }

  return superadmin;
}

/**
 * Verifica autenticação de superadmin para API routes.
 * Retorna o superadmin ou null (sem redirect).
 */
export async function requireSuperadminForAPI(): Promise<SuperadminUser | null> {
  return getAuthenticatedSuperadmin();
}

/**
 * Login de superadmin via email/password.
 * Faz login no Supabase Auth e verifica se é superadmin.
 */
export async function loginSuperadmin(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Login via Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, error: "Credenciais inválidas" };
  }

  // 2. Verificar se é superadmin
  const db = getDatabaseClient();
  const { data: superadmin } = await db
    .from("superadmins")
    .select("id, active")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (!superadmin) {
    // Fazer logout — não é superadmin
    await supabase.auth.signOut();
    return { success: false, error: "Usuário não é superadmin" };
  }

  if (!superadmin.active) {
    await supabase.auth.signOut();
    return { success: false, error: "Conta de superadmin desativada" };
  }

  return { success: true };
}

/**
 * Logout de superadmin.
 */
export async function logoutSuperadmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
