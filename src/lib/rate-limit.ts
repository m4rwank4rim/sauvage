import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { kvEnv } from "./db/store";

const memory = new Map<string, { count: number; resetAt: number }>();

const client = (): Redis | null => {
  const env = kvEnv();
  if (!env.url || !env.token) return null;
  return new Redis({ url: env.url, token: env.token });
};

export const getClientIp = (req: NextRequest): string => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
};

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds = 60
): Promise<{ ok: boolean; retryAfter: number }> {
  const bucketKey = `rate:${key}`;
  const redis = client();

  if (redis) {
    try {
      const count = await redis.incr(bucketKey);
      if (count === 1) await redis.expire(bucketKey, windowSeconds);
      if (count > limit) {
        const ttl = await redis.ttl(bucketKey);
        return { ok: false, retryAfter: ttl > 0 ? ttl : windowSeconds };
      }
      return { ok: true, retryAfter: 0 };
    } catch {
      // fall through to in-memory limiter
    }
  }

  const now = Date.now();
  const entry = memory.get(bucketKey);
  if (!entry || entry.resetAt <= now) {
    memory.set(bucketKey, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, retryAfter: 0 };
  }
  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

export async function enforceRateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowSeconds = 60
): Promise<NextResponse | null> {
  const { ok, retryAfter } = await rateLimit(`${scope}:${getClientIp(req)}`, limit, windowSeconds);
  if (ok) return null;
  return NextResponse.json(
    { success: false, error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
