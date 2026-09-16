import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { dbStore } from "../../../../../lib/db/store";
import { fleecaClient } from "../../../../../lib/fleeca";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const request = await dbStore.getRequestById(params.id);
    if (!request) {
      return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
    }
    if (request.status !== "ready_for_review") {
      return NextResponse.json(
        { success: false, error: "This project is not awaiting your acceptance yet." },
        { status: 409 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const userName = session?.user?.name;
    const isClient =
      (userId && request.userId === userId) ||
      Boolean(userName && request.discordTag.includes(userName));

    if (!isClient) {
      return NextResponse.json(
        { success: false, error: "Only the project owner can accept the order." },
        { status: 403 }
      );
    }

    let link = request.balancePaymentLink;
    if (!link) {
      const balance = request.balanceAmount ?? Math.round((request.totalAmount || 0) / 2);
      if (balance < 1) {
        return NextResponse.json(
          { success: false, error: "No outstanding balance to pay." },
          { status: 422 }
        );
      }
      const payment = await fleecaClient.createPayment({
        amount: balance,
        description: `Balance — Request #${request.id} (${request.projectType})`,
        requestId: request.id,
      });
      if (!payment.success || !payment.payment_id) {
        return NextResponse.json(
          { success: false, error: payment.message || "Fleeca payment creation failed." },
          { status: 502 }
        );
      }
      await dbStore.updateRequest(request.id, {
        balancePaymentId: payment.payment_id,
        balancePaymentLink: payment.payment_link,
      });
      await dbStore.savePayment({
        paymentId: payment.payment_id,
        requestId: request.id,
        amount: balance,
        mode: (process.env.FLEECA_MODE === "1" ? 1 : 0) as 0 | 1,
        description: `Balance — Request #${request.id}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      link = payment.payment_link;
    }

    return NextResponse.json({ success: true, data: { balancePaymentLink: link } });
  } catch (err) {
    console.error("POST /api/requests/[id]/accept error:", err);
    return NextResponse.json({ success: false, error: "Failed to prepare acceptance." }, { status: 500 });
  }
}