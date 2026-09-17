import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../lib/db/store";
import { DesignRequest } from "../../../lib/types";
import { requireAdmin } from "../../../lib/admin";
import { notifyDiscord } from "../../../lib/discord";
import { fleecaClient } from "../../../lib/fleeca";
import { enforceRateLimit } from "../../../lib/rate-limit";
import { siteConfig } from "../../../config/siteConfig";

type PublicService = { id: string; name: string; category: string; price: number };

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const requests = await dbStore.getAllRequests();
    return NextResponse.json({ success: true, data: requests });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to load requests." }, { status: 500 });
  }
}

const half = (n: number) => Math.round(n / 2);

export async function POST(req: NextRequest) {
  try {
    const limited = await enforceRateLimit(req, "requests", 6);
    if (limited) return limited;

    const body = await req.json();

    const {
      clientName,
      discordTag,
      businessName,
      projectType,
      budgetRange,
      urgency,
      brief,
      attachments,
      userId,
      packageId,
      customBudget,
    } = body;

    if (!clientName || !discordTag || !projectType || !urgency || !brief) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: clientName, discordTag, projectType, urgency, brief." },
        { status: 422 }
      );
    }

    const service = packageId
      ? (siteConfig.services as PublicService[]).find((s) => s.id === packageId)
      : null;

    let flow: "instant" | "manual" = "manual";
    let totalAmount: number | undefined;
    let packageName: string | undefined;
    let displayBudget = budgetRange || "Request a quote";

    if (service) {
      flow = "instant";
      totalAmount = service.price;
      packageName = service.name;
      displayBudget = `$${service.price.toLocaleString()} — ${service.name}`;
    } else if (customBudget && Number(customBudget) >= 1000) {
      flow = "instant";
      totalAmount = Math.round(Number(customBudget));
      displayBudget = `$${totalAmount.toLocaleString()} — Custom project`;
    }

    const newRequest = await dbStore.createRequest({
      clientName,
      discordTag,
      businessName: businessName || undefined,
      projectType,
      budgetRange: displayBudget,
      urgency,
      brief,
      attachments: attachments || [],
      userId: userId || undefined,
      flow,
      totalAmount,
      packageName,
      status: flow === "instant" ? "awaiting_deposit" : "pending_quote",
    });

    if (flow === "instant" && totalAmount) {
      const deposit = half(totalAmount);
      const balance = totalAmount - deposit;
      const payment = await fleecaClient.createPayment({
        amount: deposit,
        description: `50% Deposit - Request #${newRequest.id} (${newRequest.projectType})`,
        requestId: newRequest.id,
      });

      if (payment.success && payment.payment_id) {
        await dbStore.updateRequest(newRequest.id, {
          depositAmount: deposit,
          balanceAmount: balance,
          depositPaymentId: payment.payment_id,
          depositPaymentLink: payment.payment_link,
        });
      }

      await dbStore.savePayment({
        paymentId: payment.payment_id || `${newRequest.id}_deposit`,
        requestId: newRequest.id,
        amount: deposit,
        mode: (process.env.FLEECA_MODE === "1" ? 1 : 0) as 0 | 1,
        description: `50% Deposit - Request #${newRequest.id}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      await notifyDiscord({
        title: "📥 New Instant Project Request",
        description: `**#${newRequest.id}** — ${newRequest.projectType} (${packageName || "Custom"})`,
        color: 0xccff00,
        fields: [
          { name: "Client", value: `${clientName} (${discordTag})`, inline: true },
          { name: "Package", value: packageName || "Custom", inline: true },
          { name: "Total", value: `$${totalAmount.toLocaleString()}`, inline: true },
          { name: "Deposit", value: `$${deposit.toLocaleString()} (50%)`, inline: true },
          {
            name: "Brief",
            value: brief.length > 200 ? `${brief.slice(0, 200)}…` : brief,
            inline: false,
          },
        ],
        footer: "SAUVAGE Creative Studio",
      });

      return NextResponse.json(
        {
          success: true,
          data: { ...newRequest, depositAmount: deposit, balanceAmount: balance },
          payment: payment,
        },
        { status: 201 }
      );
    }

    await notifyDiscord({
      title: "📋 New Design Request",
      description: `**#${newRequest.id}** — ${newRequest.projectType}`,
      color: 0xccff00,
      fields: [
        { name: "Client", value: `${clientName} (${discordTag})`, inline: true },
        { name: "Business", value: businessName || "N/A", inline: true },
        { name: "Budget", value: budgetRange || "Request a quote", inline: true },
        { name: "Urgency", value: urgency, inline: true },
        { name: "Brief", value: brief.length > 200 ? `${brief.slice(0, 200)}…` : brief, inline: false },
      ],
      footer: "SAUVAGE Creative Studio",
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return NextResponse.json({ success: false, error: "Failed to create request." }, { status: 500 });
  }
}