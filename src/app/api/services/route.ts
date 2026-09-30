import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../lib/db/store";
import { requireAdmin } from "../../../lib/admin";
import { sanitizeServiceUpdate } from "../../../lib/services";
import { siteConfig } from "../../../config/siteConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await dbStore.getAllServices();
    return NextResponse.json({ success: true, data: services });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to load packages." }, { status: 500 });
  }
}

/** Restores every tier to the defaults committed in siteConfig. */
export async function DELETE() {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const services = await dbStore.resetServices();
    return NextResponse.json({ success: true, data: services });
  } catch (err) {
    console.error("DELETE /api/services error:", err);
    return NextResponse.json({ success: false, error: "Failed to reset packages." }, { status: 500 });
  }
}

/** Applies a batch of tier edits in one request (each entry keyed by id). */
export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || !("updates" in body) || !Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, error: "updates array is required." },
        { status: 422 }
      );
    }

    const knownIds = new Set(siteConfig.services.map((s) => s.id));
    const failed: string[] = [];
    const saved = [];

    for (const entry of body.updates as Record<string, unknown>[]) {
      const id = String(entry?.id ?? "");
      if (!knownIds.has(id)) {
        failed.push(id || "(missing id)");
        continue;
      }
      const partial = sanitizeServiceUpdate(entry);
      if (Object.keys(partial).length === 0) {
        failed.push(id);
        continue;
      }
      const updated = await dbStore.updateService(id, partial);
      if (updated) saved.push(updated);
      else failed.push(id);
    }

    if (failed.length > 0) {
      return NextResponse.json(
        { success: false, error: `Unknown or empty package ids: ${failed.join(", ")}` },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, data: saved });
  } catch (err) {
    console.error("PATCH /api/services error:", err);
    return NextResponse.json({ success: false, error: "Failed to update packages." }, { status: 500 });
  }
}