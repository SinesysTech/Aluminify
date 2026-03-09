import type { Metadata } from "next";
import { InvoiceList } from "./components/invoice-list";

export const metadata: Metadata = {
  title: "Faturas | Superadmin",
};

export default function FaturasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Faturas</h2>
        <p className="text-muted-foreground">
          Todas as faturas processadas pelo Stripe.
        </p>
      </div>
      <InvoiceList />
    </div>
  );
}
