import { NextResponse } from "next/server";
import { dbStore, kvBackendName, kvEnv } from "../../../lib/db/store";

export async function GET() {
  try {
    const requests = await dbStore.getAllRequests();
    const payments = await dbStore.getAllPayments();
    return NextResponse.json({
      backend: kvBackendName(),
      kvHost: kvEnv().url ? new URL(kvEnv().url as string).hostname : "none",
      requestCount: requests.length,
      paymentCount: payments.length,
      requestIds: requests.slice(0, 10).map((r) => r.id),
      paymentIds: payments.slice(0, 10).map((p) => p.paymentId),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}