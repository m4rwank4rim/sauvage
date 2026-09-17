import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin";
import { kvEnv } from "../../../../lib/db/store";

export const dynamic = "force-dynamic";

const TEST_IDS = ["REQ-6331", "REQ-6397", "REQ-7358"];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cleanup-secret");
  if (secret !== "sauvage-cleanup-2025") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const env = kvEnv();
  if (!env.url || !env.token) {
    return NextResponse.json({ error: "KV not configured" }, { status: 500 });
  }

  const headers = { Authorization: `Bearer ${env.token}` };
  const base = env.url;

  async function kvDel(key: string) {
    await fetch(`${base}/del/${encodeURIComponent(key)}`, { method: "POST", headers });
  }

  async function kvLRem(list: string, count: number, value: string) {
    await fetch(`${base}/lrem/${encodeURIComponent(list)}/${count}/${encodeURIComponent(value)}`, { method: "POST", headers });
  }

  // Remove from req list
  for (const id of TEST_IDS) {
    await kvLRem("agency:reqs", 0, id);
    await kvDel(`agency:req:${id}`);
  }

  // Find and delete associated payments
  const payListRes = await fetch(`${base}/lrange/agency:pays/0/-1`, { headers });
  const payList = await payListRes.json();
  const payments = Array.isArray(payList?.result) ? payList.result : [];

  for (const payId of payments) {
    const payRes = await fetch(`${base}/get/agency:pay:${encodeURIComponent(payId)}`, { headers });
    const payJson = await payRes.json();
    const payRaw = payJson?.result;
    if (payRaw) {
      try {
        const pay = JSON.parse(payRaw);
        if (TEST_IDS.includes(pay.requestId)) {
          await kvLRem("agency:pays", 0, payId);
          await kvDel(`agency:pay:${payId}`);
        }
      } catch {
        /* ignore */
      }
    }
  }

  // Final lists
  const [finalReqs, finalPays] = await Promise.all([
    fetch(`${base}/lrange/agency:reqs/0/-1`, { headers }).then((r) => r.json()),
    fetch(`${base}/lrange/agency:pays/0/-1`, { headers }).then((r) => r.json()),
  ]);

  return NextResponse.json({
    ok: true,
    remainingRequests: finalReqs?.result ?? [],
    remainingPayments: finalPays?.result ?? [],
  });
}