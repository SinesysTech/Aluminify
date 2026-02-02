"use client";

import { usePlantaoQuota } from "@/app/shared/hooks/use-plantao-quota";
import { CalendarCheck, AlertTriangle } from "lucide-react";

interface PlantaoQuotaBannerProps {
  empresaId: string | null;
}

export function PlantaoQuotaBanner({ empresaId }: PlantaoQuotaBannerProps) {
  const { totalQuota, usedThisMonth, remaining, loading, error } =
    usePlantaoQuota(empresaId);

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border bg-muted/50 p-4">
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (totalQuota === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-medium text-destructive">
            Sem plantões disponíveis
          </p>
          <p className="text-xs text-muted-foreground">
            Seu curso não inclui plantões. Entre em contato com a administração
            para mais informações.
          </p>
        </div>
      </div>
    );
  }

  const isExhausted = remaining <= 0;
  const isLow = remaining > 0 && remaining <= Math.ceil(totalQuota * 0.25);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 ${
        isExhausted
          ? "border-destructive/30 bg-destructive/5"
          : isLow
            ? "border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20"
            : "border-border bg-card"
      }`}
    >
      <CalendarCheck
        className={`h-5 w-5 shrink-0 ${
          isExhausted
            ? "text-destructive"
            : isLow
              ? "text-yellow-600 dark:text-yellow-500"
              : "text-primary"
        }`}
      />
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            isExhausted
              ? "text-destructive"
              : isLow
                ? "text-yellow-700 dark:text-yellow-400"
                : "text-foreground"
          }`}
        >
          {isExhausted
            ? "Cota mensal atingida"
            : `${remaining} de ${totalQuota} plantões disponíveis`}
        </p>
        <p className="text-xs text-muted-foreground">
          {isExhausted
            ? `Você já utilizou todos os ${totalQuota} plantões deste mês. Aguarde o próximo mês.`
            : `Você utilizou ${usedThisMonth} de ${totalQuota} plantões este mês.`}
        </p>
      </div>
    </div>
  );
}
