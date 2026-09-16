import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../lib/db/store";
import { notifyDiscord } from "../../../lib/discord";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await dbStore.getAllReviews();
    return NextResponse.json({ success: true, data: reviews });
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json({ success: false, error: "Failed to load reviews." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const characterName = String(body.characterName || "").trim();
    const businessName = String(body.businessName || "").trim();
    const content = String(body.content || "").trim();
    const projectDelivered = String(body.projectDelivered || "").trim();
    const rating = Number(body.rating);

    if (!characterName) {
      return NextResponse.json(
        { success: false, error: "Enter your character name." },
        { status: 422 }
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be a whole number from 1 to 5." },
        { status: 422 }
      );
    }
    if (content.length < 10 || content.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Review must be between 10 and 2000 characters." },
        { status: 422 }
      );
    }

    const review = await dbStore.createReview({
      characterName,
      businessName: businessName || undefined,
      content,
      projectDelivered: projectDelivered || undefined,
      rating,
    });

    await notifyDiscord({
      title: "⭐ New Client Review",
      description: `**${characterName}** rated SAUVAGE **${rating}/5**`,
      color: 0xccff00,
      fields: [
        { name: "Review", value: content.length > 200 ? `${content.slice(0, 200)}…` : content, inline: false },
        { name: "Business", value: businessName || "N/A", inline: true },
        { name: "Project", value: projectDelivered || "N/A", inline: true },
      ],
      footer: "SAUVAGE Creative Studio",
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit review." }, { status: 500 });
  }
}