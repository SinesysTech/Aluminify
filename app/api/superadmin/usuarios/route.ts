import { NextRequest, NextResponse } from "next/server";
import { getDatabaseClient } from "@/shared/core/database/database";
import { requireSuperadminForAPI } from "@/shared/core/services/superadmin-auth.service";

/**
 * Superadmin User Management API
 *
 * GET /api/superadmin/usuarios — List all superadmin users
 * POST /api/superadmin/usuarios — Create a new superadmin user
 *
 * Auth: Requires superadmin authentication
 */

const UNAUTHORIZED = NextResponse.json(
  { error: "Não autorizado" },
  { status: 401 },
);

export async function GET() {
  try {
    const superadmin = await requireSuperadminForAPI();
    if (!superadmin) return UNAUTHORIZED;

    const db = getDatabaseClient();
    const { data: users, error } = await db
      .from("superadmins")
      .select("id, auth_user_id, name, email, active, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[Superadmin Users] GET error:", error);
    return NextResponse.json(
      { error: "Erro ao listar usuários" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const superadmin = await requireSuperadminForAPI();
    if (!superadmin) return UNAUTHORIZED;

    const { name, email, password } = (await request.json()) as {
      name: string;
      email: string;
      password: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "name, email e password são obrigatórios" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres" },
        { status: 400 },
      );
    }

    const db = getDatabaseClient();

    // Check if email already exists as superadmin
    const { data: existing } = await db
      .from("superadmins")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um superadmin com este email" },
        { status: 409 },
      );
    }

    // Create Supabase Auth user (role: 'usuario' to avoid trigger issues)
    const { data: authData, error: authError } =
      await db.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: "usuario",
        },
      });

    if (authError || !authData.user) {
      console.error("[Superadmin Users] Auth create error:", authError);

      if (authError?.message?.includes("already been registered")) {
        // User exists in auth but not as superadmin — link them
        const { data: existingAuth } =
          await db.auth.admin.listUsers();
        const authUser = existingAuth?.users?.find(
          (u) => u.email === email,
        );

        if (authUser) {
          const { data: newSuperadmin, error: insertError } = await db
            .from("superadmins")
            .insert({
              auth_user_id: authUser.id,
              name,
              email,
              active: true,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          return NextResponse.json({ user: newSuperadmin }, { status: 201 });
        }
      }

      return NextResponse.json(
        { error: authError?.message || "Erro ao criar usuário no auth" },
        { status: 500 },
      );
    }

    // Insert into superadmins table
    const { data: newSuperadmin, error: insertError } = await db
      .from("superadmins")
      .insert({
        auth_user_id: authData.user.id,
        name,
        email,
        active: true,
      })
      .select()
      .single();

    if (insertError) {
      // Rollback: delete auth user
      await db.auth.admin.deleteUser(authData.user.id);
      throw insertError;
    }

    return NextResponse.json({ user: newSuperadmin }, { status: 201 });
  } catch (error) {
    console.error("[Superadmin Users] POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar superadmin" },
      { status: 500 },
    );
  }
}
