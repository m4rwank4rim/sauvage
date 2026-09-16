import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../lib/db/store";
import { DesignRequest } from "../../../lib/types";
import { requireAdmin } from "../../../lib/admin";
import { notifyDiscord } from "../../../lib/discord";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { clientName, discordTag, businessName, projectType, budgetRange, urgency, brief, attachments } = body;

    if (!clientName || !discordTag || !projectType || !urgency || !brief) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: clientName, discordTag, projectType, urgency, brief." },
        { status: 422 }
      );
    }

    const newRequest = await dbStore.createRequest({
      clientName,
      discordTag,
      businessName: businessName || undefined,
      projectType,
      budgetRange: budgetRange || "Request a quote",
      urgency,
      brief,
      attachments: attachments || [],
    });

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
      footer: "Vortex Creative Studio",
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return NextResponse.json({ success: false, error: "Failed to create request." }, { status: 500 });
  }
}
