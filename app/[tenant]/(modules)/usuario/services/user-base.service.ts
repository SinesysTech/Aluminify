import { getServiceRoleClient } from "@/app/shared/core/database/database-auth";
import { randomBytes } from "crypto";

export class UserBaseService {
  protected getAdminClient() {
    // Garante uso de service role (sem fallback para anon/publishable),
    // evitando falhas por RLS em operações admin (auth.admin + inserts em tabelas protegidas).
    return getServiceRoleClient();
  }

  private async findAuthUserIdByEmail(email: string): Promise<string | null> {
    const adminClient = this.getAdminClient();
    const normalized = email.trim().toLowerCase();

    // OTIMIZAÇÃO: Tentar buscar via RPC (O(1)) para evitar listar todos os usuários (O(N))
    // A função get_auth_user_id_by_email deve existir no banco (migration).
    try {
      const { data: userId, error } = await adminClient.rpc(
        "get_auth_user_id_by_email",
        {
          email: normalized,
        },
      );

      if (!error) {
        // Retorna ID se encontrado ou null se não encontrado
        return (userId as string) || null;
      }

      console.warn(
        "RPC get_auth_user_id_by_email failed, falling back to listUsers:",
        error,
      );
    } catch (err) {
      console.warn("Exception calling get_auth_user_id_by_email:", err);
    }

    // FALLBACK LEGADO: Manter lógica antiga caso a RPC falhe ou não exista
    // Paginar de forma segura: em instalações com muitos usuários, o usuário pode não estar na 1ª página.
    let page: number | null = 1;
    const perPage = 1000;
    let maxPages = 100; // Limite de segurança para evitar loops infinitos

    while (page && maxPages > 0) {
      try {
        const { data, error } = await adminClient.auth.admin.listUsers({
          page,
          perPage,
        });

        if (error) {
          // Se for erro de timeout ou rate limit, tentar novamente com delay
          if (
            error.message?.includes("timeout") ||
            error.message?.includes("rate limit") ||
            error.status === 429 ||
            error.status === 408
          ) {
            // Aguardar um pouco antes de tentar novamente
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue; // Tentar a mesma página novamente
          }
          throw new Error(`Failed to list auth users: ${error.message}`);
        }

        const existingUser = data?.users?.find(
          (u) => (u.email ?? "").toLowerCase() === normalized,
        );
        if (existingUser?.id) {
          return existingUser.id;
        }

        page = data?.nextPage ?? null;
        maxPages--;

        // Proteção extra: se vier uma página vazia, pare para evitar loop.
        if (!data?.users?.length) break;
      } catch (err) {
        // Se for erro de timeout ou conexão, tentar novamente
        if (
          err instanceof Error &&
          (err.message?.includes("timeout") ||
            err.message?.includes("ECONNRESET") ||
            err.message?.includes("ETIMEDOUT"))
        ) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }
        throw err;
      }
    }

    return null;
  }

  /**
   * Creates an Auth user in Supabase using the Admin API.
   * Handles "email already registered" conflicts gracefully if needed.
   */
  async createAuthUser(params: {
    email: string;
    password?: string;
    fullName?: string;
    role: "aluno" | "professor" | "usuario" | "superadmin" | "empresa";
    empresaId?: string;
    isAdmin?: boolean;
    mustChangePassword?: boolean;
  }): Promise<{ userId: string; isNew: boolean }> {
    const adminClient = this.getAdminClient();

    // Generate random password if not provided
    const password = params.password || randomBytes(16).toString("hex");

    const userMetadata: Record<string, unknown> = {
      role: params.role,
      full_name: params.fullName,
      is_admin: params.isAdmin ?? false,
      must_change_password: params.mustChangePassword ?? true,
    };

    if (params.empresaId) {
      userMetadata.empresa_id = params.empresaId;
    }

    let authUser;
    let authError;
    let retries = 3;

    // Tentar criar usuário com retry em caso de timeout
    while (retries > 0) {
      try {
        const result = await adminClient.auth.admin.createUser({
          email: params.email,
          password: password,
          email_confirm: true,
          user_metadata: userMetadata,
        });
        authUser = result.data;
        authError = result.error;
        break; // Sucesso, sair do loop
      } catch (err) {
        // Se for erro de timeout ou conexão, tentar novamente
        if (
          err instanceof Error &&
          (err.message?.includes("timeout") ||
            err.message?.includes("ECONNRESET") ||
            err.message?.includes("ETIMEDOUT"))
        ) {
          retries--;
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
        }
        // Se não for erro de timeout, propagar o erro
        throw err;
      }
    }

    if (authError) {
      // Check for existing user conflict
      const m = authError.message?.toLowerCase() || "";
      if (
        m.includes("already be registered") ||
        m.includes("already registered") ||
        m.includes("already exists") ||
        authError.status === 422
      ) {
        // Usuário já existe no Auth — buscar o ID por email com paginação.
        const existingUserId = await this.findAuthUserIdByEmail(params.email);
        if (existingUserId) {
          return { userId: existingUserId, isNew: false };
        }

        throw new Error(
          `Conflict: User with email ${params.email} exists in Auth but could not be retrieved.`,
        );
      }

      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authUser?.user) {
      throw new Error("Failed to create auth user: No user returned");
    }

    return { userId: authUser.user.id, isNew: true };
  }

  async updateAuthUser(
    userId: string,
    updates: {
      password?: string;
      fullName?: string;
      role?: string;
      empresaId?: string;
      isAdmin?: boolean;
      mustChangePassword?: boolean;
    },
  ) {
    const adminClient = this.getAdminClient();

    const updatePayload: {
      password?: string;
      user_metadata?: Record<string, unknown>;
    } = {};
    if (updates.password) updatePayload.password = updates.password;

    const metadataUpdates: Record<string, unknown> = {};
    if (updates.fullName !== undefined)
      metadataUpdates.full_name = updates.fullName;
    if (updates.role !== undefined) metadataUpdates.role = updates.role;
    if (updates.empresaId !== undefined)
      metadataUpdates.empresa_id = updates.empresaId;
    if (updates.isAdmin !== undefined)
      metadataUpdates.is_admin = updates.isAdmin;
    if (updates.mustChangePassword !== undefined)
      metadataUpdates.must_change_password = updates.mustChangePassword;

    if (Object.keys(metadataUpdates).length > 0) {
      updatePayload.user_metadata = metadataUpdates; // Merged by Supabase usually, but check current metadata if needed (Supabase usually merges shallowly or replaces? Docs say updates are merged for top-level keys).
    }

    if (Object.keys(updatePayload).length === 0) return;

    const { error } = await adminClient.auth.admin.updateUserById(
      userId,
      updatePayload,
    );
    if (error) {
      throw new Error(`Failed to update auth user: ${error.message}`);
    }
  }
}
