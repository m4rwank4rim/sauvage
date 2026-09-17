#!/usr/bin/env node
/*
 * SAUVAGE Discord server auto-setup.
 *
 * Creates every role, category and channel from scripts/discord-template.json.
 * Idempotent: existing roles/channels matching a name are reused, not duplicated.
 *
 * Usage:
 *   set DISCORD_BOT_TOKEN=<token> DISCORD_GUILD_ID=<guild_id>
 *   npm run discord:setup
 *
 * The bot needs "Manage Server", "Manage Roles", "Manage Channels" and must be
 * placed at the TOP of the role list (its highest role) so it can create
 * high-position roles like Founder.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const template = JSON.parse(
  readFileSync(join(__dirname, "discord-template.json"), "utf8")
);

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const toInt = (hex) => parseInt(hex.replace("#", ""), 16);
const FLAGS = PermissionFlagsBits;

const PERMISSION_MAP = {
  Administrator: FLAGS.Administrator,
  ManageGuild: FLAGS.ManageGuild,
  ManageChannels: FLAGS.ManageChannels,
  ManageRoles: FLAGS.ManageRoles,
  ManageMessages: FLAGS.ManageMessages,
  ManageThreads: FLAGS.ManageThreads,
  KickMembers: FLAGS.KickMembers,
  BanMembers: FLAGS.BanMembers,
  AttachFiles: FLAGS.AttachFiles,
  EmbedLinks: FLAGS.EmbedLinks,
  AddReactions: FLAGS.AddReactions,
  ReadMessageHistory: FLAGS.ReadMessageHistory,
  ChangeNickname: FLAGS.ChangeNickname,
  UseExternalEmojis: FLAGS.UseExternalEmojis,
  CreatePublicThreads: FLAGS.CreatePublicThreads,
  CreatePrivateThreads: FLAGS.CreatePrivateThreads,
  Connect: FLAGS.Connect,
};

const toPermissions = (names) =>
  (names || []).reduce((bits, name) => bits | (PERMISSION_MAP[name] ?? 0n), 0n);

const accessOverwrites = (guild, roleMap, access, overrides) => {
  const everyone = guild.roles.everyone.id;
  const staff = template.staffRoles.map((n) => roleMap[n]).filter(Boolean);
  const clients = template.clientRoles.map((n) => roleMap[n]).filter(Boolean);
  const management = roleMap.Management ? [roleMap.Management] : [];

  const map = new Map();
  const set = (id, allow, deny) =>
    map.set(id, { id, allow, deny });

  switch (access) {
    case "readonly":
      set(everyone, FLAGS.ViewChannel, FLAGS.SendMessages);
      staff.forEach((r) => set(r.id, FLAGS.ViewChannel | FLAGS.SendMessages, 0n));
      break;
    case "client":
      set(everyone, 0n, FLAGS.ViewChannel | FLAGS.SendMessages);
      clients.forEach((r) => set(r.id, FLAGS.ViewChannel | FLAGS.SendMessages, 0n));
      staff.forEach((r) => set(r.id, FLAGS.ViewChannel | FLAGS.SendMessages, 0n));
      break;
    case "staff":
      set(everyone, 0n, FLAGS.ViewChannel | FLAGS.SendMessages);
      staff.forEach((r) => set(r.id, FLAGS.ViewChannel | FLAGS.SendMessages, 0n));
      break;
    case "management":
      set(everyone, 0n, FLAGS.ViewChannel | FLAGS.SendMessages);
      management.forEach((r) => set(r.id, FLAGS.ViewChannel | FLAGS.SendMessages, 0n));
      break;
    default:
      break;
  }

  (overrides || []).forEach(({ role, allow, deny }) => {
    const r = roleMap[role];
    if (r) {
      set(r.id, toPermissions(allow), toPermissions(deny));
    }
  });

  return [...map.values()];
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const ensureRoles = async (guild) => {
  await guild.roles.fetch();
  const roleMap = {};
  for (let i = 0; i < template.roles.length; i++) {
    const cfg = template.roles[i];
    const existing = guild.roles.cache.find(
      (r) => r.name.toLowerCase() === cfg.name.toLowerCase()
    );
    if (existing) {
      roleMap[cfg.name] = existing;
      console.log(`role reuse  : ${cfg.name}`);
      continue;
    }
    const role = await guild.roles.create({
      name: cfg.name,
      colors: [toInt(cfg.color)],
      hoist: Boolean(cfg.hoist),
      mentionable: Boolean(cfg.mentionable),
      permissions: toPermissions(cfg.permissions),
      position: template.roles.length - i,
      reason: "SAUVAGE template setup",
    });
    roleMap[cfg.name] = role;
    console.log(`role created: ${cfg.name}`);
  }
  return roleMap;
};

const channelType = (type) =>
  type === "voice" ? ChannelType.GuildVoice : ChannelType.GuildText;

const ensureChannel = async (guild, cfg, roleMap, parent) => {
  const access = cfg.access ?? parent.access ?? "public";
  const existing = guild.channels.cache.find(
    (c) =>
      c.name === cfg.name &&
      c.parentId === parent?.id &&
      (cfg.type === "voice" ? c.isVoiceBased() : c.isTextBased())
  );
  const overwrites = accessOverwrites(guild, roleMap, access, cfg.overrides);
  if (existing) {
    if (overwrites.length) await existing.permissionOverwrites.set(overwrites);
    console.log(`channel reuse: ${parent?.name ?? "-"} / #${cfg.name}`);
    return existing;
  }
  try {
    const created = await guild.channels.create({
      name: cfg.name,
      type: channelType(cfg.type),
      parent: parent?.id,
      topic: cfg.type === "voice" ? undefined : cfg.topic,
      permissionOverwrites: overwrites.length ? overwrites : undefined,
      reason: "SAUVAGE template setup",
    });
    console.log(`channel made: ${parent?.name ?? "-"} / #${cfg.name} (${access})`);
    return created;
  } catch (err) {
    console.warn(
      `channel FAILED: ${parent?.name ?? "-"} / #${cfg.name} — ${err.message} details=${JSON.stringify(err?.rawError?.errors)}`
    );
    return null;
  }
};

const ensureCategories = async (guild, roleMap) => {
  const created = {};
  for (const cat of template.categories) {
    let category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === cat.name
    );
    if (!category) {
      category = await guild.channels.create({
        name: cat.name,
        type: ChannelType.GuildCategory,
        reason: "SAUVAGE template setup",
      });
      console.log(`category made: ${cat.name}`);
    } else {
      console.log(`category reuse: ${cat.name}`);
    }
    const overwrites = accessOverwrites(guild, roleMap, cat.access, cat.overrides);
    if (overwrites.length) await category.permissionOverwrites.set(overwrites);
    category
      .children.cache.forEach(async (child) => {
        await child.lockPermissions();
      });
    for (const ch of cat.channels) {
      await ensureChannel(guild, ch, roleMap, category);
    }
    created[cat.name] = category;
  }
  return created;
};

const postMessages = async (guild, categories) => {
  for (const [channelName, payload] of Object.entries(template.messages || {})) {
    let channel = null;
    for (const cat of Object.values(categories)) {
      channel =
        cat.children.cache.find((c) => c.name === channelName) ?? null;
      if (channel) break;
    }
    if (!channel) continue;
    const messages = await channel.messages.fetch({ limit: 5 });
    if (messages.some((m) => m.author.id === client.user.id)) {
      console.log(`message skip : #${channelName} (already posted)`);
      continue;
    }
    if (channelName === "welcome") {
      const embed = new EmbedBuilder()
        .setColor(toInt("#CCFF00"))
        .setTitle("SAUVAGE\u2122 \u2014 Los Santos Creative Agency")
        .setDescription(payload.content)
        .setFooter({ text: `${template.guildName}` });
      await channel.send({ embeds: [embed] });
    } else {
      await channel.send(payload.content);
    }
    console.log(`message posted: #${channelName}`);
  }
};

const main = async () => {
  if (!TOKEN || !GUILD_ID) {
    console.error("Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID.");
    process.exit(1);
  }

  await client.login(TOKEN);
  const guild = await client.guilds.fetch(GUILD_ID);
  await guild.channels.fetch();

  if (guild.name !== template.guildName) {
    await guild.setName(template.guildName, "SAUVAGE template setup");
    console.log(`guild renamed: ${template.guildName}`);
  }

  const roleMap = await ensureRoles(guild);
  const categories = await ensureCategories(guild, roleMap);
  await postMessages(guild, categories);

  console.log("\nDone. Server structure is live.");
  console.log(
    "Create your share invite/template later via Server Settings -> Server Template."
  );
  await client.destroy();
};

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exitCode = 1;
  client.destroy();
});