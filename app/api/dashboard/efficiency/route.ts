import { NextResponse } from "next/server";
import {
  requireUserAuth,
  AuthenticatedRequest,
} from "@/app/[tenant]/auth/middleware";
import { dashboardAnalyticsService } from "@/app/[tenant]/(modules)/dashboard/services";
import { getDatabaseClient } from "@/app/shared/core/database/database";
import { DashboardPeriod } from "@/app/[tenant]/(modules)/dashboard/types";

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

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "anual") as DashboardPeriod;
    const empresaId = searchParams.get("empresa_id") || undefined;

    const client = getDatabaseClient();
    const efficiency = await dashboardAnalyticsService.getFocusEfficiency(
      targetUserId,
      client,
      period,
      empresaId,
    );

    return NextResponse.json({ data: efficiency });
  } catch (error) {
    console.error("Dashboard Efficiency API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao carregar eficiência de foco",
      },
      { status: 500 },
    );
  }
}

export const GET = requireUserAuth(getHandler);
