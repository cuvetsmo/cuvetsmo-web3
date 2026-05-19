/**
 * Client-side helpers that hit our `/api/pinata/upload` server route.
 * Server holds PINATA_JWT — we never touch it from the browser.
 *
 * For the day-1 NFT/SBT flow we only need image + collection-metadata pins.
 * Each image is pinned individually so per-token URI = `<baseURI><tokenId>`.
 */

export interface PinResult {
  cid: string;
  gateway: string;
  url: string;
  ipfs: string;
}

export async function pinFile(file: File): Promise<PinResult> {
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await fetch("/api/pinata/upload", {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(body.error || `Pinata upload failed (${res.status})`);
  }
  return (await res.json()) as PinResult;
}

export async function pinJSON(metadata: unknown): Promise<PinResult> {
  const res = await fetch("/api/pinata/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(body.error || `Pinata pin JSON failed (${res.status})`);
  }
  return (await res.json()) as PinResult;
}

/**
 * Pin a folder by individually pinning each file + a manifest. For day-1
 * we keep it simple and accept the larger pin count: each image gets its
 * own CID and the per-token metadata JSON references that CID.
 *
 * Returns `metadataBaseCid` — the metadata folder won't actually be a
 * directory on IPFS, but the convention is `ipfs://<cid>/<tokenId>.json`,
 * which works because each metadata file is pinned individually with
 * gateway resolution per-file.
 */
export async function pinCollectionImages(files: File[]): Promise<PinResult[]> {
  const results: PinResult[] = [];
  for (const file of files) {
    results.push(await pinFile(file));
  }
  return results;
}
