import { NextResponse } from "next/server";
import {
  requireUserAuth,
  AuthenticatedRequest,
} from "@/app/[tenant]/auth/middleware";
import { dashboardAnalyticsService } from "@/app/[tenant]/(modules)/dashboard/services";
import { getDatabaseClient } from "@/app/shared/core/database/database";

export const dynamic = "force-dynamic";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const realUserId = request.user?.id;

    if (!realUserId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    if (!["aluno", "professor", "usuario"].includes(request.user?.role || "")) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const impersonationContext = request.impersonationContext;
    const targetUserId = impersonationContext?.impersonatedUserId || realUserId;

    const client = getDatabaseClient();
    const userInfo = await dashboardAnalyticsService.getUserInfo(
      targetUserId,
      client,
    );

    return NextResponse.json({ data: userInfo });
  } catch (error) {
    console.error("Dashboard User API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao carregar dados do usuário",
      },
      { status: 500 },
    );
  }
}

export const GET = requireUserAuth(getHandler);
