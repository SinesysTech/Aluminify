import { NextRequest, NextResponse } from "next/server";
import { getDatabaseClient } from "@/shared/core/database/database";
import { requireSuperadminForAPI } from "@/shared/core/services/superadmin-auth.service";

/**
 * Superadmin User Detail API
 *
 * PUT /api/superadmin/usuarios/[id] — Update superadmin name/email
 * PATCH /api/superadmin/usuarios/[id] — Toggle active status
 *
 * Auth: Requires superadmin authentication
 */

const UNAUTHORIZED = NextResponse.json(
  { error: "Não autorizado" },
  { status: 401 },
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const superadmin = await requireSuperadminForAPI();
    if (!superadmin) return UNAUTHORIZED;

    const { id } = await params;
    const { name, email } = (await request.json()) as {
      name?: string;
      email?: string;
    };

    if (!name && !email) {
      return NextResponse.json(
        { error: "Informe name ou email para atualizar" },
        { status: 400 },
      );
    }

    const db = getDatabaseClient();

    // Get current superadmin
    const { data: current } = await db
      .from("superadmins")
      .select("id, auth_user_id, email")
      .eq("id", id)
      .single();

    if (!current) {
      return NextResponse.json(
        { error: "Superadmin não encontrado" },
        { status: 404 },
      );
    }

    // If email changed, check uniqueness and update auth user
    if (email && email !== current.email) {
      const { data: emailExists } = await db
        .from("superadmins")
        .select("id")
        .eq("email", email)
        .neq("id", id)
        .maybeSingle();

      if (emailExists) {
        return NextResponse.json(
          { error: "Já existe um superadmin com este email" },
          { status: 409 },
        );
      }

      // Update email in Supabase Auth
      await db.auth.admin.updateUserById(current.auth_user_id, { email });
    }

    // Update name in auth metadata
    if (name) {
      await db.auth.admin.updateUserById(current.auth_user_id, {
        user_metadata: { full_name: name },
      });
    }

    // Update superadmins table
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const { data: updated, error } = await db
      .from("superadmins")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[Superadmin Users] PUT error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar superadmin" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const superadmin = await requireSuperadminForAPI();
    if (!superadmin) return UNAUTHORIZED;

    const { id } = await params;
    const { active } = (await request.json()) as { active: boolean };

    if (active === undefined) {
      return NextResponse.json(
        { error: "active é obrigatório" },
        { status: 400 },
      );
    }

    // Prevent self-deactivation
    if (!active && superadmin.id === id) {
      return NextResponse.json(
        { error: "Não é possível desativar sua própria conta" },
        { status: 400 },
      );
    }

    const db = getDatabaseClient();

    const { data: updated, error } = await db
      .from("superadmins")
      .update({ active })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[Superadmin Users] PATCH error:", error);
    return NextResponse.json(
      { error: "Erro ao alterar status do superadmin" },
      { status: 500 },
    );
  }
}
