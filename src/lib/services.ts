import { ServiceTier } from "../config/siteConfig";

const clamp = (value: unknown, max: number): string => String(value ?? "").slice(0, max);

/** Floor price: anything under this is almost certainly a typo. */
export const MIN_PRICE = 1000;
/** Ceiling price: keeps the input from being abused with absurd values. */
export const MAX_PRICE = 10_000_000;

/**
 * Coerces an arbitrary JSON price into a safe whole-dollar in-game amount.
 * Returns null when the value cannot be read as a usable price.
 */
export const sanitizePrice = (value: unknown): number | null => {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? "").replace(/[^0-9.-]/g, ""), 10);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(MAX_PRICE, Math.max(MIN_PRICE, Math.round(parsed)));
};

/**
 * Sanitizes a PATCH body for a single package tier. Only the fields the admin
 * editor is allowed to touch are returned; `id` is never taken from the body
 * because service ids are load-bearing.
 */
export const sanitizeServiceUpdate = (body: Record<string, unknown>): Partial<ServiceTier> => {
  const partial: Partial<ServiceTier> = {};

  if ("price" in body) {
    const price = sanitizePrice(body.price);
    if (price !== null) partial.price = price;
  }
  if ("name" in body) {
    const name = clamp(body.name, 80).trim();
    if (name) partial.name = name;
  }
  if ("category" in body) {
    const category = clamp(body.category, 40).trim();
    if (category) partial.category = category;
  }
  if ("tagline" in body) {
    partial.tagline = clamp(body.tagline, 200).trim();
  }
  if ("deliveryTime" in body) {
    const deliveryTime = clamp(body.deliveryTime, 40).trim();
    if (deliveryTime) partial.deliveryTime = deliveryTime;
  }
  if ("popular" in body) {
    partial.popular = Boolean(body.popular);
  }
  if ("features" in body && Array.isArray(body.features)) {
    partial.features = body.features
      .map((f) => clamp(f, 120).trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  return partial;
};