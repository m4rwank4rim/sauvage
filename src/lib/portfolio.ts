import { PortfolioItem } from "./types";

export const PORTFOLIO_CATEGORIES: PortfolioItem["category"][] = [
  "Logos",
  "Print",
  "Digital/Social",
  "Signage",
  "Other",
];

export const PORTFOLIO_PREVIEWS: PortfolioItem["previewType"][] = [
  "logo",
  "menu",
  "digital",
  "signage",
];

const clamp = (value: unknown, max: number): string => String(value ?? "").slice(0, max);

export const sanitizePortfolioInput = (body: Record<string, unknown>): Omit<PortfolioItem, "id"> => {
  const rawTags = Array.isArray(body.tags) ? body.tags : String(body.tags ?? "").split(",");
  const tags = rawTags
    .map((t) => clamp(t, 40).trim())
    .filter(Boolean)
    .slice(0, 10);

  const colorAccent = clamp(body.colorAccent, 9);
  const category = body.category as PortfolioItem["category"];
  const previewType = body.previewType as PortfolioItem["previewType"];

  return {
    title: clamp(body.title, 120),
    clientName: clamp(body.clientName, 120),
    businessType: clamp(body.businessType, 120),
    year: clamp(body.year || new Date().getFullYear(), 8),
    description: clamp(body.description, 2000),
    tags,
    featured: Boolean(body.featured),
    colorAccent: /^#[0-9a-fA-F]{3,8}$/.test(colorAccent) ? colorAccent : "#CCFF00",
    category: PORTFOLIO_CATEGORIES.includes(category) ? category : "Other",
    previewType: PORTFOLIO_PREVIEWS.includes(previewType) ? previewType : "digital",
    imageUrl: body.imageUrl ? clamp(body.imageUrl, 500) : undefined,
    sourceRequestId: body.sourceRequestId ? clamp(body.sourceRequestId, 40) : undefined,
  };
};
