import { NextRequest, NextResponse } from "next/server";
import { notifyDiscord } from "../../../lib/discord";

export async function POST(req: NextRequest) {
  try {
    const { name, message } = await req.json();

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ success: false, error: "Name and message are required." }, { status: 422 });
    }

    console.log(`[Contact Form] From: ${name} — ${message.slice(0, 120)}`);

    await notifyDiscord({
      title: "📬 New Contact Message",
      description: message,
      fields: [
        { name: "From", value: name, inline: true },
      ],
      color: 0x5865f2,
      footer: "Contact Form — Vortex Creative",
    });

    return NextResponse.json({ success: true, message: "Message received. We will respond via Discord." });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to process contact message." }, { status: 500 });
  }
}
