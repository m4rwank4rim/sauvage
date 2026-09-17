import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "../../../../lib/db/store";
import { requireAdmin } from "../../../../lib/admin";
import { sanitizePortfolioInput } from "../../../../lib/portfolio";
import { PortfolioItem } from "../../../../lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const existing = await dbStore.getPortfolioItemById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Portfolio item not found." }, { status: 404 });
    }

    const body = await req.json();
    const allowed: (keyof PortfolioItem)[] = [
      "title", "clientName", "businessType", "year", "description",
      "tags", "featured", "colorAccent", "category", "previewType",
      "imageUrl", "sourceRequestId",
    ];

    const partial: Partial<PortfolioItem> = {};
    const sanitized = sanitizePortfolioInput({ ...existing, ...body });
    for (const key of allowed) {
      if (key in body) {
        (partial as Record<string, unknown>)[key] = sanitized[key as keyof typeof sanitized];
      }
    }

    const updated = await dbStore.updatePortfolioItem(params.id, partial);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/portfolio/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update portfolio item." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (!guard.authorized) return guard.response;

  try {
    const deleted = await dbStore.deletePortfolioItem(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Portfolio item not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch (err) {
    console.error("DELETE /api/portfolio/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete portfolio item." }, { status: 500 });
  }
}
