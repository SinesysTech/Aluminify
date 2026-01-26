import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createFinancialService } from "@/app/[tenant]/(modules)/financeiro/services";
import type {
  HotmartWebhookPayload,
  HotmartPurchasePayload,
} from "@/app/[tenant]/(modules)/financeiro/services/financial.types";

/**
 * Hotmart Webhook Handler (v2.0.0)
 *
 * Receives webhook notifications from Hotmart for purchase, subscription, and club events.
 *
 * Security:
 * - Hottok validated from X-HOTMART-HOTTOK header
 * - Each empresa has its own webhook secret in payment_providers table
 *
 * URL format: /api/webhooks/hotmart?empresaId=<empresa_id>
 *
 * Supported events:
 * - Purchase: PURCHASE_APPROVED, PURCHASE_COMPLETE, PURCHASE_CANCELED,
 *             PURCHASE_REFUNDED, PURCHASE_CHARGEBACK, PURCHASE_PROTEST,
 *             PURCHASE_DELAYED, PURCHASE_BILLET_PRINTED, PURCHASE_OUT_OF_SHOPPING_CART
 * - Subscription: SUBSCRIPTION_CANCELLATION, SWITCH_PLAN, UPDATE_SUBSCRIPTION_CHARGE_DATE
 * - Club: CLUB_FIRST_ACCESS
 */

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getWebhookSecret(
  client: ReturnType<typeof getServiceClient>,
  empresaId: string
): Promise<string | null> {
  const { data, error } = await client
    .from("payment_providers")
    .select("webhook_secret")
    .eq("empresa_id", empresaId)
    .eq("provider", "hotmart")
    .eq("active", true)
    .single();

  if (error || !data) return null;
  return data.webhook_secret;
}

function getTransactionFromPayload(payload: HotmartWebhookPayload): string | undefined {
  if (
    payload.event.startsWith("PURCHASE_") &&
    payload.event !== "PURCHASE_OUT_OF_SHOPPING_CART"
  ) {
    return (payload as HotmartPurchasePayload).data?.purchase?.transaction;
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const empresaId = request.nextUrl.searchParams.get("empresaId");

    if (!empresaId) {
      console.error("[Hotmart Webhook] Missing empresaId parameter");
      return NextResponse.json(
        { error: "Missing empresaId parameter" },
        { status: 400 }
      );
    }

    // Get hottok from header (v2.0.0 spec)
    const hottok = request.headers.get("X-HOTMART-HOTTOK");

    if (!hottok) {
      console.error("[Hotmart Webhook] Missing X-HOTMART-HOTTOK header");
      return NextResponse.json(
        { error: "Missing authentication header" },
        { status: 401 }
      );
    }

    let payload: HotmartWebhookPayload;
    try {
      payload = await request.json();
    } catch {
      console.error("[Hotmart Webhook] Invalid JSON payload");
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    console.log("[Hotmart Webhook] Received:", {
      empresaId,
      event: payload.event,
      eventId: payload.id,
      version: payload.version,
      transaction: getTransactionFromPayload(payload),
      timestamp: new Date().toISOString(),
    });

    const client = getServiceClient();

    const webhookSecret = await getWebhookSecret(client, empresaId);

    if (!webhookSecret) {
      console.error(
        "[Hotmart Webhook] No active Hotmart integration for empresa:",
        empresaId
      );
      return NextResponse.json({
        success: false,
        message: "No active Hotmart integration configured for this empresa",
      });
    }

    // Validate hottok
    if (hottok !== webhookSecret) {
      console.error("[Hotmart Webhook] Invalid hottok for empresa:", empresaId);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const financialService = createFinancialService(client);
    const result = await financialService.processHotmartWebhook(empresaId, payload);

    const processingTime = Date.now() - startTime;
    console.log("[Hotmart Webhook] Processed:", {
      empresaId,
      event: payload.event,
      success: result.success,
      message: result.message,
      transactionId: result.transaction?.id,
      processingTime: `${processingTime}ms`,
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      transactionId: result.transaction?.id,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("[Hotmart Webhook] Error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: `${processingTime}ms`,
    });

    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "Hotmart Webhook Handler v2.0.0",
    usage: "POST /api/webhooks/hotmart?empresaId=<empresa_id>",
    events: {
      purchase: [
        "PURCHASE_APPROVED",
        "PURCHASE_COMPLETE",
        "PURCHASE_CANCELED",
        "PURCHASE_REFUNDED",
        "PURCHASE_CHARGEBACK",
        "PURCHASE_PROTEST",
        "PURCHASE_DELAYED",
        "PURCHASE_BILLET_PRINTED",
        "PURCHASE_OUT_OF_SHOPPING_CART",
      ],
      subscription: [
        "SUBSCRIPTION_CANCELLATION",
        "SWITCH_PLAN",
        "UPDATE_SUBSCRIPTION_CHARGE_DATE",
      ],
      club: ["CLUB_FIRST_ACCESS"],
    },
  });
}
