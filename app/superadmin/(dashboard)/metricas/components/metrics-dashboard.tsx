"use client";

import { useState, useEffect } from "react";

interface PlanDistribution {
  name: string;
  count: number;
  revenue_cents: number;
}

interface BalanceItem {
  amount: number;
  currency: string;
}

interface MetricsData {
  totalSubscriptions: number;
  totalActive: number;
  totalCanceled: number;
  totalTenants: number;
  monthlyCount: number;
  yearlyCount: number;
  estimatedMRR: number;
  recentCancellations: number;
  statusCounts: Record<string, number>;
  planDistribution: PlanDistribution[];
  stripeBalance: {
    available: BalanceItem[];
    pending: BalanceItem[];
  } | null;
}

export function MetricsDashboard() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/superadmin/metricas");
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-7 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-sm text-muted-foreground">
        Erro ao carregar métricas.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Tenants Ativos</div>
          <div className="text-2xl font-bold">{data.totalTenants}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">
            Assinaturas Ativas
          </div>
          <div className="text-2xl font-bold text-green-600">
            {data.totalActive}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">MRR Estimado</div>
          <div className="text-2xl font-bold">
            {formatCurrency(data.estimatedMRR)}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">
            Cancelamentos (30d)
          </div>
          <div className="text-2xl font-bold text-red-600">
            {data.recentCancellations}
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold">Assinaturas por Status</h3>
          <div className="space-y-2">
            {Object.entries(data.statusCounts).map(([status, count]) => {
              const total = data.totalSubscriptions || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">
                      {status === "active"
                        ? "Ativa"
                        : status === "canceled"
                          ? "Cancelada"
                          : status === "past_due"
                            ? "Inadimplente"
                            : status === "trialing"
                              ? "Trial"
                              : status === "unpaid"
                                ? "Não paga"
                                : status}
                    </span>
                    <span className="text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status === "active"
                          ? "bg-green-500"
                          : status === "canceled"
                            ? "bg-red-400"
                            : status === "past_due"
                              ? "bg-yellow-500"
                              : status === "trialing"
                                ? "bg-blue-400"
                                : "bg-gray-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold">Distribuição por Plano</h3>
          {data.planDistribution.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma assinatura ativa.
            </p>
          ) : (
            <div className="space-y-3">
              {data.planDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{plan.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {plan.count} assinatura{plan.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(plan.revenue_cents)}/mês
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Billing Interval & Stripe Balance */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold">Intervalo de Cobrança</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center rounded-lg bg-muted/50 p-3">
              <div className="text-2xl font-bold">{data.monthlyCount}</div>
              <div className="text-sm text-muted-foreground">Mensal</div>
            </div>
            <div className="text-center rounded-lg bg-muted/50 p-3">
              <div className="text-2xl font-bold">{data.yearlyCount}</div>
              <div className="text-sm text-muted-foreground">Anual</div>
            </div>
          </div>
        </div>

        {data.stripeBalance && (
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h3 className="font-semibold">Saldo Stripe</h3>
            <div className="space-y-2">
              {data.stripeBalance.available.map((b, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Disponível ({b.currency.toUpperCase()})
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(b.amount)}
                  </span>
                </div>
              ))}
              {data.stripeBalance.pending.map((b, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Pendente ({b.currency.toUpperCase()})
                  </span>
                  <span className="font-medium text-yellow-600">
                    {formatCurrency(b.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Total: {data.totalSubscriptions} assinatura
        {data.totalSubscriptions !== 1 ? "s" : ""} registrada
        {data.totalSubscriptions !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
