import { NextRequest, NextResponse } from "next/server";
import { b2Configured, b2ProxyDownload } from "../../../../lib/b2";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  if (!b2Configured()) {
    return NextResponse.json({ success: false, error: "File storage not configured." }, { status: 503 });
  }
  try {
    return await b2ProxyDownload(params.key);
  } catch (err) {
    console.error("GET /api/files/[key] error:", err);
    return NextResponse.json({ success: false, error: "Failed to download file." }, { status: 500 });
  }
}