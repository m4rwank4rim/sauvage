import { NextRequest, NextResponse } from "next/server";
import { blobConfigured, blobProxyDownload } from "../../../../lib/blob";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  if (!blobConfigured()) {
    return NextResponse.json({ success: false, error: "File storage not configured." }, { status: 503 });
  }
  try {
    return await blobProxyDownload(params.key);
  } catch (err) {
    console.error("GET /api/files/[key] error:", err);
    return NextResponse.json({ success: false, error: "Failed to download file." }, { status: 500 });
  }
}