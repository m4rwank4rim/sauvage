import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../../lib/db/store";
import { requireAdmin } from "../../../../lib/admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const deleted = await dbStore.deletePayment(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Payment not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { paymentId: params.id } });
  } catch (err) {
    console.error("DELETE /api/payments/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete payment." }, { status: 500 });
  }
}
