import type { Metadata } from "next";
import { MetricsDashboard } from "./metricas/components/metrics-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Superadmin",
};

export default function SuperadminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral de assinaturas e receita da plataforma.
        </p>
      </div>
      <MetricsDashboard />
    </div>
  );
}
