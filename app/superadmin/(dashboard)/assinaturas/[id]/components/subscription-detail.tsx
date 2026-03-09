"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StripeItem {
  id: string;
  price_id: string;
  amount: number | null;
  currency: string;
  interval: string | null;
  current_period_start: number;
  current_period_end: number;
}

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    billing_interval: string;
    created_at: string;
    canceled_at: string | null;
    current_period_end: string | null;
    next_payment_date: string | null;
    last_payment_amount_cents: number | null;
    stripe_subscription_id: string | null;
    stripe_customer_id: string;
    subscription_plans: {
      name: string;
      slug: string;
      price_monthly_cents: number;
      price_yearly_cents: number | null;
    } | null;
    empresas: {
      id: string;
      nome: string;
      slug: string;
      stripe_customer_id: string | null;
    } | null;
  };
  stripeData: {
    id: string;
    status: string;
    cancel_at_period_end: boolean;
    items: StripeItem[];
  } | null;
  invoices: Invoice[];
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Ativa", className: "bg-green-100 text-green-700" },
  past_due: {
    label: "Inadimplente",
    className: "bg-yellow-100 text-yellow-700",
  },
  canceled: { label: "Cancelada", className: "bg-red-100 text-red-700" },
  unpaid: { label: "Não paga", className: "bg-red-100 text-red-700" },
  trialing: { label: "Trial", className: "bg-blue-100 text-blue-700" },
  paused: { label: "Pausada", className: "bg-gray-100 text-gray-600" },
};

export function SubscriptionDetail({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/superadmin/assinaturas/${subscriptionId}`,
        );
        if (!res.ok) {
          setError("Assinatura não encontrada");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [subscriptionId]);

  async function handleCancel() {
    if (!confirm("Tem certeza que deseja cancelar esta assinatura?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/superadmin/assinaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          subscription_id: subscriptionId,
        }),
      });
      const result = await res.json();
      if (result.success) {
        // Refresh data
        const refreshRes = await fetch(
          `/api/superadmin/assinaturas/${subscriptionId}`,
        );
        const refreshData = await refreshRes.json();
        setData(refreshData);
      }
    } finally {
      setActionLoading(false);
    }
  }

  function formatCurrency(cents: number, currency = "BRL") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  }

  function formatDate(date: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
  }

  function formatTimestamp(ts: number) {
    return new Date(ts * 1000).toLocaleDateString("pt-BR");
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Carregando detalhes...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error || "Dados não encontrados"}
        </div>
        <Link
          href="/superadmin/assinaturas"
          className="text-sm text-primary hover:underline"
        >
          Voltar para assinaturas
        </Link>
      </div>
    );
  }

  const { subscription: sub, stripeData, invoices } = data;
  const statusInfo = STATUS_LABELS[sub.status] || {
    label: sub.status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/superadmin/assinaturas"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Assinaturas
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">
            {sub.empresas?.nome || "Tenant"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {sub.empresas?.slug} — {sub.subscription_plans?.name || "—"}
          </p>
        </div>
        {sub.status === "active" && (
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {actionLoading ? "Cancelando..." : "Cancelar Assinatura"}
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="mt-1">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}
            >
              {statusInfo.label}
            </span>
            {stripeData?.cancel_at_period_end && (
              <span className="ml-2 text-xs text-yellow-600">
                (cancela no fim do período)
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Intervalo</div>
          <div className="mt-1 text-lg font-semibold">
            {sub.billing_interval === "year" ? "Anual" : "Mensal"}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Valor</div>
          <div className="mt-1 text-lg font-semibold">
            {sub.billing_interval === "year"
              ? sub.subscription_plans?.price_yearly_cents
                ? formatCurrency(sub.subscription_plans.price_yearly_cents)
                : "—"
              : sub.subscription_plans?.price_monthly_cents
                ? formatCurrency(sub.subscription_plans.price_monthly_cents)
                : "—"}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold">Detalhes da Assinatura</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Criada em</span>
              <span>{formatDate(sub.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fim do período</span>
              <span>{formatDate(sub.current_period_end)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximo pagamento</span>
              <span>{formatDate(sub.next_payment_date)}</span>
            </div>
            {sub.canceled_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancelada em</span>
                <span>{formatDate(sub.canceled_at)}</span>
              </div>
            )}
            {sub.last_payment_amount_cents && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último pagamento</span>
                <span>
                  {formatCurrency(sub.last_payment_amount_cents)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold">Dados Stripe</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subscription ID</span>
              <span className="font-mono text-xs">
                {sub.stripe_subscription_id || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer ID</span>
              <span className="font-mono text-xs">
                {sub.stripe_customer_id || "—"}
              </span>
            </div>
            {stripeData?.items.map((item) => (
              <div key={item.id} className="border-t pt-2 mt-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price ID</span>
                  <span className="font-mono text-xs">{item.price_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Período Stripe
                  </span>
                  <span>
                    {formatTimestamp(item.current_period_start)} —{" "}
                    {formatTimestamp(item.current_period_end)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Faturas</h3>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma fatura encontrada.
          </p>
        ) : (
          <div className="rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Número
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Valor
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Data
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const invStatus = STATUS_LABELS[inv.status || ""] || {
                    label: inv.status || "—",
                    className: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-sm font-mono">
                        {inv.number || inv.id.slice(0, 12)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${invStatus.className}`}
                        >
                          {invStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {formatCurrency(inv.amount_due, inv.currency)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {formatTimestamp(inv.created)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          {inv.hosted_invoice_url && (
                            <a
                              href={inv.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Ver
                            </a>
                          )}
                          {inv.invoice_pdf && (
                            <a
                              href={inv.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:underline"
                            >
                              PDF
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
