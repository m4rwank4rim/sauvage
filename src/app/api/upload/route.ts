import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { blobUpload, blobConfigured } from "../../../lib/blob";
import { enforceRateLimit } from "../../../lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Sign in to upload files." }, { status: 401 });
    }

    const limited = await enforceRateLimit(req, "upload", 12);
    if (limited) return limited;

    if (!blobConfigured()) {
      return NextResponse.json(
        { success: false, error: "File storage is not configured yet." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const fileName = String(body.fileName || "attachment").slice(0, 120);
    const contentType = String(body.contentType || "application/octet-stream").slice(0, 80);
    const base64 = String(body.data || "");

    if (!base64) {
      return NextResponse.json({ success: false, error: "No file data provided." }, { status: 422 });
    }

    const MAX_BYTES = 4 * 1024 * 1024;
    if (base64.length > Math.ceil((MAX_BYTES * 4) / 3) + 4) {
      return NextResponse.json({ success: false, error: "Max 4 MB per attachment." }, { status: 413 });
    }

    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "Max 4 MB per attachment." }, { status: 413 });
    }
    const result = await blobUpload(fileName, buffer, contentType);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}