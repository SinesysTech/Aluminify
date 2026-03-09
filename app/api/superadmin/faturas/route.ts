import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/shared/core/services/stripe.service";
import { requireSuperadminForAPI } from "@/shared/core/services/superadmin-auth.service";

/**
 * Superadmin Invoice API
 *
 * GET /api/superadmin/faturas — List invoices from Stripe
 *   Query params: customer, subscription, status, limit, starting_after
 */

const UNAUTHORIZED = NextResponse.json({ error: "Não autorizado" }, { status: 401 });

export async function GET(request: NextRequest) {
  try {
    const superadmin = await requireSuperadminForAPI();
    if (!superadmin) return UNAUTHORIZED;

    const { searchParams } = request.nextUrl;
    const customer = searchParams.get("customer") || undefined;
    const subscription = searchParams.get("subscription") || undefined;
    const status = (searchParams.get("status") || undefined) as
      | "draft"
      | "open"
      | "paid"
      | "uncollectible"
      | "void"
      | undefined;
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const starting_after = searchParams.get("starting_after") || undefined;

    const stripe = getStripeClient();

    const invoices = await stripe.invoices.list({
      customer,
      subscription,
      status,
      limit: Math.min(limit, 100),
      starting_after,
    });

    const data = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      customer: inv.customer,
      subscription: typeof inv.parent?.subscription_details?.subscription === "string"
        ? inv.parent.subscription_details.subscription
        : inv.parent?.subscription_details?.subscription ?? null,
      status: inv.status,
      amount_due: inv.amount_due,
      amount_paid: inv.amount_paid,
      amount_remaining: inv.amount_remaining,
      currency: inv.currency,
      created: inv.created,
      period_start: inv.period_start,
      period_end: inv.period_end,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
      customer_email: inv.customer_email,
      customer_name: inv.customer_name,
    }));

    return NextResponse.json({
      invoices: data,
      has_more: invoices.has_more,
    });
  } catch (error) {
    console.error("[Superadmin Invoices] GET error:", error);
    return NextResponse.json(
      { error: "Erro ao listar faturas" },
      { status: 500 },
    );
  }
}
