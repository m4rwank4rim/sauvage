import { NextResponse } from "next/server";
import { dbStore } from "../../../lib/db/store";
import { requireAdmin } from "../../../lib/admin";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const payments = await dbStore.getAllPayments();
    return NextResponse.json({ success: true, data: payments });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch payments." }, { status: 500 });
  }
}
