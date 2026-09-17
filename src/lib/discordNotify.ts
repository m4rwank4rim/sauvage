import { DesignRequest } from "./types";

/**
 * Discord bot integration for client-facing notifications (direct messages)
 * and role sync (Verified Client). Pure REST over fetch — no websocket,
 * safe for serverless runtimes. Everything degrades gracefully: when the
 * bot token or guild id is not configured, or the user cannot be reached,
 * calls resolve to `false` without throwing.
 */

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const VERIFIED_ROLE_NAME = "Verified Client";
const BRAND_LIME = 0xccff00;

export function discordBotConfigured(): boolean {
  return Boolean(BOT_TOKEN && GUILD_ID);
}

const projectLink = (id: string): string => {
  const base = process.env.SITE_URL || process.env.NEXTAUTH_URL;
  return base ? `${base}/request/${id}` : "";
};

async function discordApi(path: string, init?: RequestInit & { okStatus?: number[] }): Promise<{ ok: boolean; status: number; json?: any }> {
  if (!BOT_TOKEN) return { ok: false, status: 0 };
  try {
    const res = await fetch(`https://discord.com/api/v10${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${BOT_TOKEN}`,
        ...init?.headers,
      },
    });
    let json: any = undefined;
    try {
      json = await res.json();
    } catch {
      /* no body */
    }
    const okStatus = init?.okStatus ?? [200, 201, 204];
    return { ok: okStatus.includes(res.status), status: res.status, json };
  } catch (err) {
    console.error("[Discord] API call failed:", path, err);
    return { ok: false, status: 0 };
  }
}

/**
 * Send a direct message (embed) to a Discord user. Only works when both the
 * bot and the user share a guild and the user has DMs enabled.
 */
export async function dmUser(
  discordUserId: string | undefined | null,
  title: string,
  description: string
): Promise<boolean> {
  if (!discordUserId || !discordBotConfigured()) return false;

  const dm = await discordApi(`/users/${discordUserId}/channels`, { method: "POST", body: JSON.stringify({}) });
  if (!dm.ok || !dm.json?.id) {
    console.warn("[Discord] Cannot reach user", discordUserId, "- status", dm.status);
    return false;
  }

  const sent = await discordApi(`/channels/${dm.json.id}/messages`, {
    method: "POST",
    okStatus: [200, 201],
    body: JSON.stringify({
      embeds: [
        {
          title,
          description,
          color: BRAND_LIME,
          footer: { text: "SAUVAGE™ Creative Studio" },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
  if (!sent.ok) console.warn("[Discord] DM to", discordUserId, "failed - status", sent.status);
  return sent.ok;
}

/**
 * Assign the "Verified Client" role to a member of the guild. Idempotent.
 * Returns false when the user is not in the guild yet (they'll get the role
 * once they join — the next payment/status change will re-sync).
 */
export async function assignVerifiedClient(discordUserId: string | undefined | null): Promise<boolean> {
  if (!discordUserId || !discordBotConfigured()) return false;

  const roles = await discordApi(`/guilds/${GUILD_ID}/roles`);
  if (!roles.ok || !Array.isArray(roles.json)) return false;
  const role = roles.json.find((r: { name?: string }) => r.name === VERIFIED_ROLE_NAME);
  if (!role?.id) return false;

  const res = await discordApi(`/guilds/${GUILD_ID}/members/${discordUserId}/roles/${role.id}`, {
    method: "PUT",
    okStatus: [204],
    body: JSON.stringify({}),
  });
  if (!res.ok) console.warn("[Discord] Role sync for", discordUserId, "failed - status", res.status);
  return res.ok;
}

const STATUS_MESSAGES: Record<string, { title: string; body: (r: DesignRequest) => string }> = {
  quoted: {
    title: "🧾 Your quote is ready",
    body: (r) =>
      `**#${r.id}** — ${r.projectType}\n\nYour quote of **$${(r.quoteAmount ?? 0).toLocaleString()}** is ready. Head to your project room to review the details and pay your deposit via Fleeca.${projectLink(r.id) ? `\n\n📌 ${projectLink(r.id)}` : ""}`,
  },
  awaiting_deposit: {
    title: "💳 Deposit link ready",
    body: (r) =>
      `**#${r.id}** — ${r.projectType}\n\nYour 50% deposit link is ready. Paying it opens your project room immediately.${projectLink(r.id) ? `\n\n📌 ${projectLink(r.id)}` : ""}`,
  },
  in_progress: {
    title: "🎨 Your project is in production",
    body: (r) =>
      `**#${r.id}** — ${r.projectType}\n\nThe designer has started on your work. Watch progress and chat in your project room.${projectLink(r.id) ? `\n\n📌 ${projectLink(r.id)}` : ""}`,
  },
  ready_for_review: {
    title: "🎁 Final files ready for review",
    body: (r) =>
      `**#${r.id}** — ${r.projectType}\n\nYour final designs are awaiting you in the project room. When you're happy, accept the order to release the remaining balance and complete the project.${projectLink(r.id) ? `\n\n📌 ${projectLink(r.id)}` : ""}`,
  },
  delivered: {
    title: "📦 Your project has been delivered",
    body: (r) =>
      `**#${r.id}** — ${r.projectType}\n\nFinal files have been delivered. Review them in your project room and accept when you're satisfied.${projectLink(r.id) ? `\n\n📌 ${projectLink(r.id)}` : ""}`,
  },
  completed: {
    title: "✅ Order complete — thank you!",
    body: (r) =>
      `**#${r.id}** — ${r.projectType}\n\nYour project with SAUVAGE is complete. Files stay available whenever you need them. We'd love a review if you have a moment!${projectLink(r.id) ? `\n\n📌 ${projectLink(r.id)}` : ""}`,
  },
  cancelled: {
    title: "⚠️ Project cancelled",
    body: (r) =>
      `**#${r.id}** — ${r.projectType}\n\nThis project has been cancelled. If anything looks wrong, reach out to us on Discord.`,
  },
};

/** DM the client the standard copy for a given status. No-op when unconfigured. */
export async function notifyClientStatus(request: DesignRequest | null | undefined, status: string): Promise<boolean> {
  if (!request?.userId) return false;
  const entry = STATUS_MESSAGES[status];
  if (!entry) return false;
  return dmUser(request.userId, entry.title, entry.body(request));
}