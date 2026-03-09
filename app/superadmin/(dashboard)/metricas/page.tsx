import type { Metadata } from "next";
import { MetricsDashboard } from "./components/metrics-dashboard";

export const metadata: Metadata = {
  title: "Métricas | Superadmin",
};

export default function MetricasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Métricas</h2>
        <p className="text-muted-foreground">
          Métricas detalhadas de assinaturas, receita e tenants.
        </p>
      </div>
      <MetricsDashboard />
    </div>
  );
}
