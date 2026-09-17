import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { dbStore } from "../../../lib/db/store";
import { requireAdmin } from "../../../lib/admin";
import { notifyDiscord } from "../../../lib/discord";
import { enforceRateLimit } from "../../../lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const limited = await enforceRateLimit(req, "messages", 30);
    if (limited) return limited;

    const { requestId, content, attachmentUrl, attachmentName } = await req.json();
    if (!requestId) {
      return NextResponse.json({ success: false, error: "requestId is required." }, { status: 422 });
    }
    if ((!content || !String(content).trim()) && !attachmentUrl) {
      return NextResponse.json(
        { success: false, error: "Message needs text or an attachment." },
        { status: 422 }
      );
    }

    const request = await dbStore.getRequestById(requestId);
    if (!request) {
      return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
    }
    if (request.status === "completed" || request.status === "cancelled") {
      return NextResponse.json(
        { success: false, error: "Chat is closed on this project." },
        { status: 403 }
      );
    }

    const text = String(content || "").trim().slice(0, 2000);

    const guard = await requireAdmin();
    if (guard.authorized) {
      const message = await dbStore.appendMessage(requestId, {
        authorRole: "designer",
        author: "SAUVAGE Design",
        content: text,
        attachmentUrl,
        attachmentName,
      });
      return NextResponse.json({ success: true, data: message }, { status: 201 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const userName = session?.user?.name;

    const isClient =
      (userId && request.userId === userId) ||
      Boolean(userName && (request.userId === undefined || request.userId === userId) && request.discordTag.includes(userName));

    if (!isClient) {
      return NextResponse.json(
        { success: false, error: "You can only message on your own projects." },
        { status: 403 }
      );
    }

    const message = await dbStore.appendMessage(requestId, {
      authorRole: "client",
      author: request.clientName,
      content: text,
      attachmentUrl,
      attachmentName,
    });

    await notifyDiscord({
      title: "💬 New Client Message",
      description: `**${request.clientName}** on **#${request.id}** (${request.projectType})`,
      color: 0xccff00,
      fields: [
        {
          name: text ? "Message" : "Attachment",
          value: text ? (text.length > 200 ? `${text.slice(0, 200)}…` : text) : attachmentUrl || "File",
          inline: false,
        },
      ],
      footer: "SAUVAGE Creative Studio",
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (err) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json({ success: false, error: "Failed to send message." }, { status: 500 });
  }
}