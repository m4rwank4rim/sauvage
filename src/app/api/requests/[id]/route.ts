import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../../lib/db/store";
import { requireAdmin } from "../../../../lib/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const request = await dbStore.getRequestById(params.id);
    if (!request) {
      return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
    }
    const payment = await dbStore.getPaymentByRequestId(params.id);
    return NextResponse.json({ success: true, data: { request, payment } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to load request." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const body = await req.json();
    const existing = await dbStore.getRequestById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
    }

    const allowed = [
      "status", "quoteAmount", "quoteNotes",
      "fleecaPaymentId", "fleecaPaymentLink",
      "deliverablesUrl", "deliveryNotes"
    ] as const;

    const updates: Partial<typeof existing> = {};
    for (const key of allowed) {
      if (key in body) {
        (updates as Record<string, unknown>)[key] = body[key];
      }
    }

    const updated = await dbStore.updateRequest(params.id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/requests/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update request." }, { status: 500 });
  }
}
