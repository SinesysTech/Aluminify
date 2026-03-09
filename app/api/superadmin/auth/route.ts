import { NextRequest, NextResponse } from "next/server";
import {
  loginSuperadmin,
  logoutSuperadmin,
  requireSuperadminForAPI,
} from "@/shared/core/services/superadmin-auth.service";

/**
 * Superadmin Auth API
 *
 * POST /api/superadmin/auth — Login
 * DELETE /api/superadmin/auth — Logout
 * GET /api/superadmin/auth — Check session
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const result = await loginSuperadmin(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Superadmin Auth] POST error:", error);
    return NextResponse.json(
      { error: "Erro ao autenticar" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await logoutSuperadmin();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Superadmin Auth] DELETE error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer logout" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const superadmin = await requireSuperadminForAPI();

    if (!superadmin) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: superadmin.id,
        name: superadmin.name,
        email: superadmin.email,
      },
    });
  } catch (error) {
    console.error("[Superadmin Auth] GET error:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 },
    );
  }
}
