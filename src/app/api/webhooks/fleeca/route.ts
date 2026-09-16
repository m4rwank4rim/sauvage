import { NextRequest, NextResponse } from "next/server";
import { fleecaClient } from "../../../../lib/fleeca";
import { dbStore } from "../../../../lib/db/store";
import { FleecaWebhookPayload } from "../../../../lib/types";
import { notifyDiscord } from "../../../../lib/discord";

export async function POST(req: NextRequest) {
  try {
    // Read the raw body bytes — required for HMAC-SHA256 signature verification
    const rawBody = await req.text();

    // Verify HMAC-SHA256 signature per Fleeca Gateway spec
    // Header: X-Fleeca-Signature: sha256=<hex>
    const signatureHeader = req.headers.get("x-fleeca-signature");

    const isValid = fleecaClient.verifyWebhookSignature(rawBody, signatureHeader);

    if (!isValid) {
      console.warn("[Fleeca Webhook] Invalid signature rejected.", {
        provided: signatureHeader,
        bodyPreview: rawBody.slice(0, 100),
      });
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    // Parse payload after signature verification
    let payload: FleecaWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: "Malformed JSON payload." }, { status: 400 });
    }

    const { payment_id, status, amount, payer_routing, payer_name, description } = payload;

    if (!payment_id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: payment_id, status." },
        { status: 422 }
      );
    }

    console.log(`[Fleeca Webhook] payment_id=${payment_id} status=${status} amount=${amount}`);

    // Reconcile payment and update associated request
    const { payment, request } = await dbStore.reconcilePayment(
      payment_id,
      status as "payment_successful" | "payment_failed" | "pending",
      payer_routing,
      payer_name
    );

    if (status === "payment_successful" && request) {
      console.log(
        `[Fleeca Webhook] ✅ Payment confirmed for request #${request.id} — $${amount} from ${payer_name || "unknown"}.`
      );
      await notifyDiscord({
        title: "💰 Payment Received",
        description: `Payment of **$${amount.toLocaleString()}** confirmed for request **#${request.id}** (${request.projectType}).`,
        color: 0x00ff00,
        fields: [
          { name: "Client", value: `${request.clientName} (${request.discordTag})`, inline: true },
          { name: "Payer", value: payer_name || "Unknown", inline: true },
          { name: "Routing", value: payer_routing || "N/A", inline: true },
          { name: "Request", value: `#${request.id}`, inline: true },
        ],
        footer: "Fleeca Bank — SAUVAGE",
      });
    }

    if (status === "payment_failed" && request) {
      console.log(`[Fleeca Webhook] ❌ Payment failed for request #${request.id}.`);
      await notifyDiscord({
        title: "❌ Payment Failed",
        description: `Payment of **$${amount?.toLocaleString() ?? "?"}** failed for request **#${request.id}** (${request?.projectType}).`,
        color: 0xff0000,
        fields: [
          { name: "Client", value: `${request?.clientName} (${request?.discordTag})`, inline: true },
          { name: "Payer", value: payer_name || "Unknown", inline: true },
          { name: "Routing", value: payer_routing || "N/A", inline: true },
        ],
        footer: "Fleeca Bank — SAUVAGE",
      });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err) {
    console.error("[Fleeca Webhook] Unexpected error:", err);
    return NextResponse.json({ success: false, error: "Webhook processing failed." }, { status: 500 });
  }
}
