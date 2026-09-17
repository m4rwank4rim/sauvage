import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../lib/db/store";
import { requireAdmin } from "../../../lib/admin";
import { sanitizePortfolioInput } from "../../../lib/portfolio";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await dbStore.getAllPortfolio();
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to load portfolio." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const body = await req.json();
    const input = sanitizePortfolioInput(body);
    if (!input.title.trim() || !input.clientName.trim()) {
      return NextResponse.json(
        { success: false, error: "title and clientName are required." },
        { status: 422 }
      );
    }
    const item = await dbStore.createPortfolioItem(input);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    console.error("POST /api/portfolio error:", err);
    return NextResponse.json({ success: false, error: "Failed to create portfolio item." }, { status: 500 });
  }
}
