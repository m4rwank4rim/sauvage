import crypto from "crypto";

const KEY_ID = process.env.B2_APPLICATION_KEY_ID || "";
const APP_KEY = process.env.B2_APPLICATION_KEY || "";
const BUCKET = process.env.B2_BUCKET || "";
const PUBLIC_BASE = (process.env.B2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
const MAX_UPLOAD = 4 * 1024 * 1024;

let cachedAuth: { apiUrl: string; authToken: string; accountId: string; bucketId: string; bucketName: string } | null = null;
let cacheExpiry = 0;

async function authorize() {
  const now = Date.now();
  if (cachedAuth && now < cacheExpiry) return cachedAuth;
  if (!KEY_ID || !APP_KEY) throw new Error("B2 credentials not configured.");

  const token = Buffer.from(`${KEY_ID}:${APP_KEY}`).toString("base64");
  const res = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: { Authorization: `Basic ${token}` },
  });
  if (!res.ok) throw new Error(`B2 auth failed (${res.status})`);
  const data = await res.json();
  const allowedBucket = data.allowed?.bucketId;
  let bucketId = allowedBucket;
  let bucketName = data.allowed?.bucketName || BUCKET;
  let bucketNameMatch = bucketName;

  if (!bucketId || bucketName !== BUCKET) {
    const list = await fetch(`${data.apiUrl}/b2api/v2/b2_list_buckets`, {
      method: "POST",
      headers: { Authorization: data.authorizationToken, "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: data.accountId }),
    });
    if (!list.ok) throw new Error(`B2 list_buckets failed (${list.status})`);
    const buckets = await list.json();
    const match = buckets.buckets?.find((b: any) => b.bucketName === BUCKET);
    if (!match) {
      const names = (buckets.buckets ?? []).map((b: any) => b.bucketName).join(", ") || "none";
      throw new Error(`B2 bucket "${BUCKET}" not found (available: ${names})`);
    }
    bucketId = match.bucketId;
    bucketName = match.bucketName;
  }

  cachedAuth = { apiUrl: data.apiUrl, authToken: data.authorizationToken, accountId: data.accountId, bucketId, bucketName };
  cacheExpiry = now + 9 * 60 * 1000;
  return cachedAuth;
}

export async function b2Upload(fileName: string, buffer: Buffer, contentType: string): Promise<{ url: string; fileName: string }> {
  if (buffer.byteLength > MAX_UPLOAD) throw new Error("File too large (max 4 MB).");

  const auth = await authorize();
  const getRes = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: { Authorization: auth.authToken, "Content-Type": "application/json" },
    body: JSON.stringify({ bucketId: auth.bucketId }),
  });
  if (!getRes.ok) throw new Error(`B2 get_upload_url failed (${getRes.status})`);
  const { uploadUrl, authorizationToken } = await getRes.json();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestampName = `${Date.now()}_${safeName}`;

  const sha1 = crypto.createHash("sha1").update(buffer).digest("hex");

  const upRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(timestampName),
      "Content-Type": contentType || "application/octet-stream",
      "X-Bz-Content-Sha1": sha1,
    },
    body: buffer as unknown as BodyInit,
  });
  if (!upRes.ok) throw new Error(`B2 upload failed (${upRes.status})`);
  const out = await upRes.json();
  const publicUrl = PUBLIC_BASE ? `${PUBLIC_BASE}/${encodeURIComponent(out.fileName)}` : `/api/files/${encodeURIComponent(out.fileName)}`;
  return { url: publicUrl, fileName: out.fileName };
}

export async function b2DownloadUrl(fileName: string): Promise<string> {
  if (PUBLIC_BASE) return `${PUBLIC_BASE}/${encodeURIComponent(fileName)}`;
  return `/api/files/${encodeURIComponent(fileName)}`;
}

export async function b2ProxyDownload(fileName: string): Promise<Response> {
  const auth = await authorize();
  const b2Res = await fetch(
    `${auth.apiUrl}/b2api/v2/b2_download_file_by_name?fileName=${encodeURIComponent(fileName)}`,
    { headers: { Authorization: auth.authToken } }
  );
  if (!b2Res.ok) return new Response("File not found", { status: 404 });
  const headers = new Headers();
  const ct = b2Res.headers.get("content-type");
  const cl = b2Res.headers.get("content-length");
  if (ct) headers.set("content-type", ct);
  if (cl) headers.set("content-length", cl);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(b2Res.body, { status: b2Res.status, headers });
}

export function b2Configured(): boolean {
  return Boolean(KEY_ID && APP_KEY && BUCKET);
}

export type B2ProbeResult = {
  configured: boolean;
  keyIdLen?: number;
  bucket?: string | null;
  publicBase?: boolean;
  authorized?: boolean;
  buckets?: { name: string; type: string }[];
  error?: string;
};

export async function b2Probe(): Promise<B2ProbeResult> {
  const out: B2ProbeResult = {
    configured: b2Configured(),
    keyIdLen: KEY_ID.length || 0,
    bucket: BUCKET || null,
    publicBase: Boolean(PUBLIC_BASE),
  };
  if (!b2Configured()) return out;
  try {
    const auth = await authorize();
    const list = await fetch(`${auth.apiUrl}/b2api/v2/b2_list_buckets`, {
      method: "POST",
      headers: { Authorization: auth.authToken, "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: auth.accountId }),
    });
    if (!list.ok) throw new Error(`B2 list_buckets failed (${list.status})`);
    const lb = await list.json();
    out.authorized = true;
    out.buckets = (lb.buckets ?? []).map((b: { bucketName: string; bucketType: string }) => ({
      name: b.bucketName,
      type: b.bucketType,
    }));
  } catch (err) {
    out.error = err instanceof Error ? err.message.slice(0, 200) : String(err);
  }
  return out;
}
