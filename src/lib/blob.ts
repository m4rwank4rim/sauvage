const TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";

export function blobConfigured(): boolean {
  return Boolean(TOKEN);
}

export async function blobUpload(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; fileName: string }> {
  if (!TOKEN) throw new Error("Blob storage is not configured.");
  if (!BUFFER_SAFE(buffer)) throw new Error("File too large (max 4 MB).");

  const { put } = await import("@vercel/blob");
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `attachments/${Date.now()}_${safeName}`;
  const blob = await put(pathname, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: contentType || "application/octet-stream",
  });
  return { url: blob.url, fileName: blob.pathname };
}

export async function blobProxyDownload(fileName: string): Promise<Response> {
  if (!TOKEN) return new Response("Storage not configured", { status: 503 });
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: fileName, limit: 1 });
  const hit = blobs?.[0];
  if (!hit) return new Response("File not found", { status: 404 });
  return Response.redirect(hit.url, 307);
}

export async function blobDelete(fileName: string): Promise<void> {
  if (!TOKEN) return;
  const { del } = await import("@vercel/blob");
  await del(fileName);
}

export type BlobProbeResult = {
  configured: boolean;
  authorized?: boolean;
  buckets?: { name: string; type: string }[];
  writeOk?: boolean;
  writeRoundtripMs?: number;
  error?: string;
};

const BUFFER_SAFE = (b: Buffer) => b.byteLength <= 4 * 1024 * 1024;

export async function blobProbe(writeTest = false): Promise<BlobProbeResult> {
  if (!blobConfigured()) return { configured: false };
  try {
    if (writeTest) {
      const probeBody = "blob-probe-" + Date.now();
      const { put, list, del } = await import("@vercel/blob");
      const key = `probe/${Date.now()}.txt`;
      const b = await put(key, probeBody, { access: "public", contentType: "text/plain", addRandomSuffix: true });
      const t0 = Date.now();
      const { blobs } = await list({ prefix: "probe/", limit: 1 });
      const roundtripMs = Date.now() - t0;
      await del(b.pathname);
      return {
        configured: true,
        authorized: blobs !== undefined,
        writeOk: Boolean(b.url),
        writeRoundtripMs: roundtripMs,
      };
    }
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: "probe/", limit: 1 });
    return { configured: true, authorized: blobs !== undefined };
  } catch (error) {
    return { configured: true, error: error instanceof Error ? error.message : String(error) };
  }
}
