import type { Metadata } from "next";
import { SubscriptionDetail } from "./components/subscription-detail";

export const metadata: Metadata = {
  title: "Detalhes da Assinatura | Superadmin",
};

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <SubscriptionDetail subscriptionId={id} />
    </div>
  );
}
