import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local. Run this from the project root with KV credentials present.");
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  let value = trimmed.slice(idx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

const url = env.KV_REST_API_URL;
const token = env.KV_REST_API_TOKEN || env.KV_REST_API_READ_ONLY_TOKEN;
if (!url || !token) {
  console.error("KV_REST_API_URL and KV_REST_API_TOKEN must be present in .env.local");
  process.exit(1);
}

const kv = new Redis({ url, token });

let cursor = "0";
let deleted = 0;
do {
  const [next, keys] = await kv.scan(cursor, { match: "agency:*", count: 200 });
  if (keys.length) {
    for (const key of keys) {
      await kv.del(key);
      deleted++;
    }
    console.log(`deleted ${keys.length} key(s): ${keys.join(", ")}`);
  }
  cursor = next;
} while (cursor !== "0");

console.log(`\nDone. Removed ${deleted} key(s) under agency:*.`);