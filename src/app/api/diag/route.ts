import { NextResponse } from "next/server";
import { kvEnv } from "../../../lib/db/store";
import { blobConfigured, blobProbe } from "../../../lib/blob";
import { discordBotConfigured } from "../../../lib/discordNotify";

export const dynamic = "force-dynamic";

const mask = (t?: string) => (t ? `${t.slice(0, 6)}...${t.slice(-4)}` : undefined);

async function discordDiag() {
  if (!discordBotConfigured()) return { configured: false };
  const token = process.env.DISCORD_BOT_TOKEN as string;
  const guild = process.env.DISCORD_GUILD_ID as string;
  const headers = { Authorization: `Bot ${token}` };
  const out: Record<string, unknown> = { configured: true, guildIdSet: true };

  try {
    const me = await fetch("https://discord.com/api/v10/users/@me", { headers }).then((r) => r.json());
    out.bot = me?.username ? `${me.username}` : { error: me?.message || "no username" };
  } catch (err) {
    out.bot = { error: String(err) };
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guild}/roles`, { headers });
    const roles = await res.json();
    if (Array.isArray(roles)) {
      out.roleCount = roles.length;
      out.verifiedRole = roles.find((r: { name?: string }) => r.name === "Verified Client")?.name ?? null;
    } else {
      out.roles = { status: res.status, error: roles?.message || "not an array" };
    }
  } catch (err) {
    out.roles = { error: String(err) };
  }

  return out;
}

export async function GET() {
  const env = kvEnv();
  const out: Record<string, unknown> = {
    storageDriver: "vercel-blob",
    blob: await blobProbe(true),
    discord: await discordDiag(),
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
    const sdkItemRaw = await r.get<string>("agency:req:REQ-8967");
    let sdkItem = null;
    let sdkItemParseErr = null;
    if (sdkItemRaw) {
      try {
        sdkItem = { status: (JSON.parse(sdkItemRaw) as { status?: string }).status?.slice(0, 30) ?? null };
      } catch (e) {
        sdkItemParseErr = String(e);
      }
    }
    out.sdk = {
      init: sdkInit,
      reqList: sdkReqs,
      reqCount: sdkReqs?.length ?? null,
      payList: sdkPays,
      payCount: sdkPays?.length ?? null,
      itemProbe: {
        raw: sdkItemRaw ? sdkItemRaw.slice(0, 80) : null,
        parsed: sdkItem,
        parseError: sdkItemParseErr,
      },
    };
  } catch (err) {
    out.sdk = { error: String(err) };
  }

  try {
    const headers = { Authorization: `Bearer ${env.token}` };
    const [init, reqs, pays, itemProbe] = await Promise.all([
      fetch(`${env.url}/get/agency:init`, { headers }).then((x) => x.json()),
      fetch(`${env.url}/lrange/agency:reqs/0/-1`, { headers }).then((x) => x.json()),
      fetch(`${env.url}/lrange/agency:pays/0/-1`, { headers }).then((x) => x.json()),
      fetch(`${env.url}/get/agency:req:REQ-8967`, { headers }).then((x) => x.json()),
    ]);
    out.rawFetch = {
      init,
      reqs,
      reqCount: Array.isArray(reqs?.result) ? reqs.result.length : reqs,
      pays,
      payCount: Array.isArray(pays?.result) ? pays.result.length : pays,
      itemProbe: {
        result: typeof itemProbe?.result === "string" ? itemProbe.result.slice(0, 80) : itemProbe?.result,
        error: itemProbe?.error ?? null,
      },
    };
  } catch (err) {
    out.rawFetch = { error: String(err) };
  }

  return NextResponse.json(out);
}
