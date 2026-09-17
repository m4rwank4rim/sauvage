#!/usr/bin/env node
// Cleanup test fixtures from Upstash Redis (KV)
import { Redis } from "@upstash/redis";

const TEST_IDS = ["REQ-6331", "REQ-6397", "REQ-7358"];

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error("❌ Missing UPSTASH_REDIS_REST_URL / KV_REST_API_URL or token");
  process.exit(1);
}

const r = new Redis({ url, token });

async function main() {
  console.log("🔍 Fetching current request list...");
  const reqList = await r.lrange("agency:reqs", 0, -1);
  console.log("Current requests:", reqList);

  for (const id of TEST_IDS) {
    // Remove from req list
    const removed = await r.lrem("agency:reqs", 0, id);
    if (removed > 0) console.log(`✅ Removed ${id} from agency:reqs`);
    else console.log(`ℹ️ ${id} not in agency:reqs`);

    // Delete request hash
    const delReq = await r.del(`agency:req:${id}`);
    if (delReq) console.log(`✅ Deleted agency:req:${id}`);

    // Find and delete associated payments
    const payList = await r.lrange("agency:pays", 0, -1);
    for (const payId of payList) {
      const payRaw = await r.get(`agency:pay:${payId}`);
      if (payRaw) {
        try {
          const pay = JSON.parse(payRaw);
          if (pay.requestId === id) {
            await r.lrem("agency:pays", 0, payId);
            await r.del(`agency:pay:${payId}`);
            console.log(`✅ Deleted payment ${payId} for ${id}`);
          }
        } catch {
          /* ignore */
        }
      }
    }
  }

  console.log("📋 Final request list:", await r.lrange("agency:reqs", 0, -1));
  console.log("💰 Final payment list:", await r.lrange("agency:pays", 0, -1));
  console.log("🎉 Done");
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});