import { NextRequest, NextResponse } from "next/server";
import { fleecaClient } from "../../../../lib/fleeca";

// Helper endpoint used exclusively by the sandbox checkout simulator to get a
// correctly signed HMAC for the test webhook payload, keeping FLEECA_API_KEY server-side.
export async function POST(req: NextRequest) {
  try {
    const { payload } = await req.json();
    if (!payload) {
      return NextResponse.json({ success: false, error: "payload required." }, { status: 422 });
    }
    const signature = fleecaClient.signPayload(payload);
    return NextResponse.json({ success: true, signature });
  } catch {
    return NextResponse.json({ success: false, error: "Signing failed." }, { status: 500 });
  }
}
