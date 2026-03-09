"use client";

import { useState, useEffect, useCallback } from "react";

interface Invoice {
  id: string;
  number: string | null;
  customer: string | null;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  created: number;
  period_start: number;
  period_end: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  customer_email: string | null;
  customer_name: string | null;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  paid: { label: "Paga", className: "bg-green-100 text-green-700" },
  open: { label: "Aberta", className: "bg-yellow-100 text-yellow-700" },
  draft: { label: "Rascunho", className: "bg-gray-100 text-gray-600" },
  uncollectible: {
    label: "Incobrável",
    className: "bg-red-100 text-red-700",
  },
  void: { label: "Anulada", className: "bg-gray-100 text-gray-600" },
};

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [hasMore, setHasMore] = useState(false);

  const fetchInvoices = useCallback(async (startingAfter?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (startingAfter) params.set("starting_after", startingAfter);
      params.set("limit", "25");

      const res = await fetch(`/api/superadmin/faturas?${params}`);
      const data = await res.json();

      if (startingAfter) {
        setInvoices((prev) => [...prev, ...(data.invoices || [])]);
      } else {
        setInvoices(data.invoices || []);
      }
      setHasMore(data.has_more || false);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  function formatCurrency(cents: number, currency: string) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleDateString("pt-BR");
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="paid">Paga</option>
          <option value="open">Aberta</option>
          <option value="draft">Rascunho</option>
          <option value="uncollectible">Incobrável</option>
          <option value="void">Anulada</option>
        </select>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Número
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Valor
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Data</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Período
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Carregando faturas...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Nenhuma fatura encontrada.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const statusInfo = STATUS_LABELS[inv.status || ""] || {
                  label: inv.status || "—",
                  className: "bg-gray-100 text-gray-600",
                };

                return (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-sm font-mono">
                      {inv.number || inv.id.slice(0, 12)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {inv.customer_name || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inv.customer_email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatCurrency(inv.amount_due, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(inv.created)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(inv.period_start)} —{" "}
                      {formatDate(inv.period_end)}
                    </td>
                    <td className="px-4 py-3">
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
              })
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <button
          onClick={() => {
            const lastId = invoices[invoices.length - 1]?.id;
            if (lastId) fetchInvoices(lastId);
          }}
          disabled={loading}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {loading ? "Carregando..." : "Carregar mais"}
        </button>
      )}

      <div className="text-sm text-muted-foreground">
        {invoices.length} fatura{invoices.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
