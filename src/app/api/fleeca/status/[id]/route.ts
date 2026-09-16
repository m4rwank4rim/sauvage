import { NextRequest, NextResponse } from "next/server";
import { fleecaClient } from "../../../../../lib/fleeca";
import { dbStore } from "../../../../../lib/db/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;

    // First try our local store
    const localRecord = await dbStore.getPaymentById(paymentId);

    // If it's a sandbox/simulated payment, return local record directly
    if (
      paymentId.startsWith("flc_sim_") ||
      paymentId.startsWith("flc_dev_") ||
      paymentId.startsWith("flc_seed_")
    ) {
      if (localRecord) {
        return NextResponse.json({ success: true, data: localRecord, source: "local" });
      }
      // Seed payment not yet explicitly stored — check if a request has it
      const allRequests = await dbStore.getAllRequests();
      const linkedRequest = allRequests.find((r) => r.fleecaPaymentId === paymentId);
      if (linkedRequest) {
        return NextResponse.json({
          success: true,
          data: {
            paymentId,
            requestId: linkedRequest.id,
            amount: linkedRequest.quoteAmount || 0,
            status: linkedRequest.status === "paid" ? "payment_successful" : "pending",
            mode: 0,
          },
          source: "local",
        });
      }
      return NextResponse.json({ success: false, error: "Payment not found." }, { status: 404 });
    }

    // Try calling the real Fleeca API as reconciliation source of truth
    const liveData = await fleecaClient.getPayment(paymentId);

    if (liveData) {
      // Reconcile our local store if status has changed
      if (
        liveData.status === "payment_successful" ||
        liveData.status === "payment_failed"
      ) {
        await dbStore.reconcilePayment(
          paymentId,
          liveData.status,
          liveData.payer_routing,
          liveData.payer_name
        );
      }
      return NextResponse.json({ success: true, data: liveData, source: "fleeca_api" });
    }

    // Fall back to local record
    if (localRecord) {
      return NextResponse.json({ success: true, data: localRecord, source: "local" });
    }

    return NextResponse.json({ success: false, error: "Payment not found." }, { status: 404 });
  } catch (err) {
    console.error("GET /api/fleeca/status/[id] error:", err);
    return NextResponse.json({ success: false, error: "Status check failed." }, { status: 500 });
  }
}
