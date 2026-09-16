import { NextRequest, NextResponse } from "next/server";
import { fleecaClient } from "../../../../lib/fleeca";
import { dbStore } from "../../../../lib/db/store";
import { PaymentRecord } from "../../../../lib/types";
import { requireAdmin } from "../../../../lib/admin";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const body = await req.json();
    const { requestId, amount, description } = body;

    if (!requestId) {
      return NextResponse.json({ success: false, error: "requestId is required." }, { status: 422 });
    }

    if (!amount || typeof amount !== "number" || amount < 1) {
      return NextResponse.json({ success: false, error: "Valid amount (int >= 1) is required." }, { status: 422 });
    }

    // Load the design request
    const designRequest = await dbStore.getRequestById(requestId);
    if (!designRequest) {
      return NextResponse.json({ success: false, error: "Design request not found." }, { status: 404 });
    }

    const desc = description || `Design Deposit — Request #${requestId} (${designRequest.projectType})`;

    // Call Fleeca API (server-side, key never exposed to client)
    const paymentResult = await fleecaClient.createPayment({
      amount: Math.round(amount),
      description: desc,
      requestId,
    });

    if (!paymentResult.success || !paymentResult.payment_id) {
      return NextResponse.json(
        { success: false, error: paymentResult.message || "Fleeca payment creation failed." },
        { status: 502 }
      );
    }

    // Persist the payment record
    const record: PaymentRecord = {
      paymentId: paymentResult.payment_id,
      requestId,
      amount: Math.round(amount),
      mode: (process.env.FLEECA_MODE === "1" ? 1 : 0) as 0 | 1,
      description: desc,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await dbStore.savePayment(record);

    // Attach the payment link to the design request
    await dbStore.updateRequest(requestId, {
      fleecaPaymentId: paymentResult.payment_id,
      fleecaPaymentLink: paymentResult.payment_link,
      status: "quoted",
    });

    return NextResponse.json({
      success: true,
      payment_id: paymentResult.payment_id,
      payment_link: paymentResult.payment_link,
      isSimulated: paymentResult.isSimulated,
    });
  } catch (err) {
    console.error("POST /api/fleeca/pay error:", err);
    return NextResponse.json({ success: false, error: "Payment creation failed." }, { status: 500 });
  }
}
