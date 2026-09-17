import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../../lib/db/store";
import { requireAdmin } from "../../../../lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids.map((id: unknown) => String(id)) : [];
    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: "ids array is required." }, { status: 422 });
    }
    const items = await dbStore.reorderPortfolio(ids);
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("POST /api/portfolio/reorder error:", err);
    return NextResponse.json({ success: false, error: "Failed to reorder portfolio." }, { status: 500 });
  }
}
