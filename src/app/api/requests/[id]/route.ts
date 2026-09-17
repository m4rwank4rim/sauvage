import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../../lib/db/store";
import { requireAdmin } from "../../../../lib/admin";

export const dynamic = "force-dynamic";

const json = (payload: unknown, init?: number) => {
  const res = NextResponse.json(payload, { status: init });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const request = await dbStore.getRequestById(params.id);
    if (!request) {
      return json({ success: false, error: "Request not found." }, 404);
    }
    const allPayments = await dbStore.getAllPayments();
    const payments = allPayments.filter((p) => p.requestId === params.id);
    const payment = payments[0] ?? null;
    return json({ success: true, data: { request, payment, payments } });
  } catch (err) {
    return json({ success: false, error: "Failed to load request." }, 500);
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

    if (updates.status === "cancelled" && existing.status !== "cancelled") {
      await dbStore.appendMessage(params.id, {
        authorRole: "system",
        author: "SAUVAGE Design",
        content: "This project has been cancelled. Reach out on Discord if you have any questions.",
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/requests/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update request." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const existing = await dbStore.getRequestById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
    }
    const paymentsDeleted = await dbStore.deletePaymentsByRequestId(params.id);
    await dbStore.deleteRequest(params.id);
    return NextResponse.json({ success: true, data: { id: params.id, paymentsDeleted } });
  } catch (err) {
    console.error("DELETE /api/requests/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete request." }, { status: 500 });
  }
}
