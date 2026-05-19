import { NextResponse, type NextRequest } from "next/server";

/**
 * Server-side Pinata upload proxy.
 *
 * Path: POST /api/pinata/upload
 * Body: multipart/form-data with `file` (image) + optional `name` (string)
 *       OR application/json with `metadata` (object) — pins the JSON.
 *
 * Returns: { cid: string, gateway: string, url: string }
 *
 * Why server-side?
 *   PINATA_JWT is full-access. We hold it server-only so we can rotate
 *   without rebuilding the client + enforce the upload size cap here.
 */

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const PINATA_PIN_FILE = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_PIN_JSON = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

function gateway(): string {
  const g = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";
  return g.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function gatewayUrl(cid: string): string {
  return `https://${gateway()}/ipfs/${cid}`;
}

export async function POST(req: NextRequest) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: "Pinata not configured. PINATA_JWT missing." },
      { status: 503 },
    );
  }

  const contentType = req.headers.get("content-type") || "";

  // ───────────── JSON metadata pin ─────────────
  if (contentType.includes("application/json")) {
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const upstream = await fetch(PINATA_PIN_JSON, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataContent: payload,
        pinataMetadata: { name: "cuvetsmo-mint-metadata" },
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { error: "Pinata pinJSON failed", detail: text.slice(0, 500) },
        { status: 502 },
      );
    }

    const json = (await upstream.json()) as { IpfsHash?: string };
    const cid = json.IpfsHash;
    if (!cid) {
      return NextResponse.json(
        { error: "Pinata response missing IpfsHash" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      cid,
      gateway: gateway(),
      url: gatewayUrl(cid),
      ipfs: `ipfs://${cid}`,
    });
  }

  // ───────────── multipart file pin ─────────────
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Unsupported Content-Type. Use multipart/form-data or application/json." },
      { status: 415 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form body" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing `file` field" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_FILE_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type ${file.type}. Use jpg/png/webp.` },
      { status: 415 },
    );
  }

  // Re-build FormData for upstream
  const upstreamForm = new FormData();
  upstreamForm.append("file", file, file.name || "upload");
  upstreamForm.append(
    "pinataMetadata",
    JSON.stringify({ name: file.name || "cuvetsmo-mint-image" }),
  );

  const upstream = await fetch(PINATA_PIN_FILE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: upstreamForm,
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: "Pinata pinFile failed", detail: text.slice(0, 500) },
      { status: 502 },
    );
  }

  const json = (await upstream.json()) as { IpfsHash?: string };
  const cid = json.IpfsHash;
  if (!cid) {
    return NextResponse.json(
      { error: "Pinata response missing IpfsHash" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    cid,
    gateway: gateway(),
    url: gatewayUrl(cid),
    ipfs: `ipfs://${cid}`,
  });
}
