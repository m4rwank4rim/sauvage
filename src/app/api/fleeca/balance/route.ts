import { NextResponse } from "next/server";
import { fleecaClient } from "../../../../lib/fleeca";
import { requireAdmin } from "../../../../lib/admin";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const result = await fleecaClient.getBalance();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }
    return NextResponse.json({
      success: true,
      data: { ...result.data, mode: process.env.FLEECA_MODE === "1" ? 1 : 0 },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Balance check failed." }, { status: 500 });
  }
}
