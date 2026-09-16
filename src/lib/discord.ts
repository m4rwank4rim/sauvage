const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordNotifyOptions {
  title: string;
  description?: string;
  fields?: DiscordEmbedField[];
  /** Decimal color. Defaults to brand lime (`0xCCFF00`). */
  color?: number;
  /** Override the footer text. */
  footer?: string;
}

const BRAND_LIME = 0xccff00;

/**
 * Post a rich embed to the configured Discord webhook. No-op when
 * DISCORD_WEBHOOK_URL is unset (keeps local dev quiet). Always resolves
 * without throwing — notification failures never break the main flow.
 */
export async function notifyDiscord(options: DiscordNotifyOptions): Promise<boolean> {
  if (!WEBHOOK_URL) return false;

  const embed: Record<string, unknown> = {
    title: options.title,
    color: options.color ?? BRAND_LIME,
    timestamp: new Date().toISOString(),
  };
  if (options.description) embed.description = options.description;
  if (options.fields && options.fields.length > 0) embed.fields = options.fields;
  if (options.footer) embed.footer = { text: options.footer };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "SAUVAGE", embeds: [embed] }),
    });
    if (!res.ok) {
      console.error("[Discord] webhook returned", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Discord] webhook failed:", err);
    return false;
  }
}