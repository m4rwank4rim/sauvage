import { NextResponse } from "next/server";
import { dbStore } from "../../../lib/db/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [requests, payments] = await Promise.all([
      dbStore.getAllRequests(),
      dbStore.getAllPayments(),
    ]);

    const paid = payments.filter((p) => p.status === "payment_successful");
    const funded = paid.reduce((sum, p) => sum + (p.amount || 0), 0);

    const requestedIds = new Set(requests.map((r) => r.id));
    const paidRequests = paid
      .map((p) => requests.find((r) => r.id === p.requestId))
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    const clients = new Set(paidRequests.map((r) => r.clientName)).size;

    const turnaroundHours: number[] = [];
    for (const pay of paid) {
      const req = requests.find((r) => r.id === pay.requestId);
      if (!req) continue;
      const created = new Date(req.createdAt).getTime();
      const paidAt = new Date(pay.paidAt || pay.createdAt).getTime();
      if (Number.isFinite(created) && Number.isFinite(paidAt) && paidAt > created) {
        turnaroundHours.push((paidAt - created) / 3600000);
      }
    }
    const avgTurnaroundHours = turnaroundHours.length
      ? Math.round((turnaroundHours.reduce((a, b) => a + b, 0) / turnaroundHours.length) * 10) / 10
      : null;

    const latest = paid[0] ?? null;
    const latestRequest = latest ? requests.find((r) => r.id === latest.requestId) ?? null : null;

    return NextResponse.json({
      success: true,
      data: {
        requests: requests.length,
        payments: payments.length,
        commissions: paid.length,
        clients,
        funded,
        avgTurnaroundHours,
        latest: latest
          ? {
              id: latestRequest?.id ?? latest.requestId,
              projectType: latestRequest?.projectType ?? null,
              amount: latest.amount,
              payerName: latest.payerName || null,
              paidAt: latest.paidAt ?? null,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({ success: false, error: "Failed to compute stats." }, { status: 500 });
  }
}