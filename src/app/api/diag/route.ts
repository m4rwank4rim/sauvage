import { NextResponse } from "next/server";
import { kvEnv } from "../../../lib/db/store";

export const dynamic = "force-dynamic";

const mask = (t?: string) => (t ? `${t.slice(0, 6)}...${t.slice(-4)}` : undefined);

export async function GET() {
  const env = kvEnv();
  const out: Record<string, unknown> = {
    envCandidates: {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      REDIS_REST_API_URL: process.env.REDIS_REST_API_URL,
      KV_URL: process.env.KV_URL,
      REDIS_URL: process.env.REDIS_URL,
      used: env.url,
      tokenMask: mask(env.token),
    },
  };

  if (!env.url || !env.token) {
    out.sdk = { error: "kv unused" };
    return NextResponse.json(out);
  }

  try {
    const { Redis } = await import("@upstash/redis");
    const r = new Redis({ url: env.url, token: env.token });

    const [sdkInit, sdkReqs, sdkPays] = await Promise.all([
      r.get<string>("agency:init"),
      r.lrange<string>("agency:reqs", 0, -1),
      r.lrange<string>("agency:pays", 0, -1),
    ]);
    out.sdk = {
      init: sdkInit,
      sdkReqList: sdkReqs,
      sdkReqCount: sdkReqs?.length ?? null,
      sdkPayList: sdkPays,
      sdkPayCount: sdkPays?.length ?? null,
    };
  } catch (err) {
    out.sdk = { error: String(err) };
  }

  try {
    const headers = { Authorization: `Bearer ${env.token}` };
    const [init, reqs, pays] = await Promise.all([
      fetch(`${env.url}/get/agency:init`, { headers }).then((x) => x.json()),
      fetch(`${env.url}/lrange/agency:reqs/0/-1`, { headers }).then((x) => x.json()),
      fetch(`${env.url}/lrange/agency:pays/0/-1`, { headers }).then((x) => x.json()),
    ]);
    out.rawFetch = {
      init,
      reqs,
      reqCount: Array.isArray(reqs?.result) ? reqs.result.length : reqs,
      pays,
      payCount: Array.isArray(pays?.result) ? pays.result.length : pays,
    };
  } catch (err) {
    out.rawFetch = { error: String(err) };
  }

  return NextResponse.json(out);
}