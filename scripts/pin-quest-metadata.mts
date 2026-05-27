/**
 * Pin per-quest metadata JSON to IPFS via Pinata.
 *
 * Output: prints paste-ready `metadataCid: "Qm..."` lines that get baked
 * back into `lib/quests.ts` so the EAS BADGE attestation `metadataURI`
 * field points at a stable on-chain reference instead of a page URL.
 *
 * Usage:
 *   npx tsx scripts/pin-quest-metadata.mts
 *
 * Required env:
 *   PINATA_JWT  — read from .env.local (server-only, never NEXT_PUBLIC_)
 *
 * Idempotency: Pinata returns the same CID for identical content. Re-runs
 * after edits to QUESTS will produce new CIDs only for changed quests.
 */
import path from "node:path";
import dotenv from "dotenv";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
dotenv.config({ path: path.join(REPO_ROOT, ".env.local") });

import { QUESTS } from "../lib/quests.js";

const PINATA_JWT = process.env.PINATA_JWT?.trim();
if (!PINATA_JWT) {
  throw new Error("PINATA_JWT missing in .env.local");
}

const PINATA_PIN_JSON = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

interface PinResponse {
  IpfsHash: string;
  PinSize?: number;
  Timestamp?: string;
}

/**
 * Generate a deterministic Pollinations.ai image URL for the badge.
 * Same seed + prompt → same image, so the metadata pin is reproducible.
 */
function badgeImageUrl(questId: number, glyph: string, title: string): string {
  const prompt = `minimalist circular achievement badge, large letter "${glyph}" centered in white, deep ocean blue gradient background, subtle gold rim, professional vector style, dark mode aesthetic, no text other than the letter, web3 credential badge for "${title}"`;
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?model=flux&nologo=true&seed=${questId * 7919}&width=512&height=512`;
}

interface BadgeMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  background_color: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}

function buildMetadata(quest: (typeof QUESTS)[number]): BadgeMetadata {
  return {
    name: `${quest.badge} · CUVETSMO Quest #${quest.id}`,
    description: `${quest.blurb} — Completion badge for the "${quest.title}" quest at web3.cuvetsmo.com. Soulbound EAS attestation issued by CUVETSMO Web3.`,
    image: badgeImageUrl(quest.id, quest.badgeGlyph, quest.title),
    external_url: `https://web3.cuvetsmo.com/learn/quests/${quest.id}`,
    background_color: "0369A1",
    attributes: [
      { trait_type: "Quest", value: quest.title },
      { trait_type: "Subtitle", value: quest.subtitle },
      { trait_type: "Tier", value: quest.tier },
      { trait_type: "Kind", value: quest.kind },
      { trait_type: "XP", value: quest.xp },
      { trait_type: "Badge", value: quest.badge },
      { trait_type: "Glyph", value: quest.badgeGlyph },
      { trait_type: "Issuer", value: "CUVETSMO Web3" },
      { trait_type: "Network", value: "Base Sepolia (testnet)" },
    ],
  };
}

async function pinJson(payload: BadgeMetadata, name: string): Promise<string> {
  const res = await fetch(PINATA_PIN_JSON, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: payload,
      pinataMetadata: { name },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as PinResponse;
  if (!data.IpfsHash) {
    throw new Error("Pinata response missing IpfsHash");
  }
  return data.IpfsHash;
}

async function main() {
  console.log(`Pinning ${QUESTS.length} quest metadata payloads to IPFS via Pinata...`);
  console.log("");

  const results: Array<{ id: number; cid: string; name: string }> = [];

  for (const quest of QUESTS) {
    const metadata = buildMetadata(quest);
    const pinName = `cuvetsmo-quest-${quest.id}-${quest.badge.toLowerCase().replace(/\s+/g, "-")}`;
    process.stdout.write(`  [#${quest.id}] ${quest.title.padEnd(28)} → `);
    try {
      const cid = await pinJson(metadata, pinName);
      console.log(cid);
      results.push({ id: quest.id, cid, name: pinName });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`FAILED — ${message}`);
      throw err;
    }
  }

  console.log("");
  console.log("══════════════════════════════════════════════════════════");
  console.log("✅ Pinned all quest metadata. CIDs to bake into lib/quests.ts:");
  console.log("══════════════════════════════════════════════════════════");
  console.log("");
  console.log("export const QUEST_METADATA_CID: Record<number, string> = {");
  for (const r of results) {
    console.log(`  ${r.id}: "${r.cid}",`);
  }
  console.log("};");
  console.log("");
  console.log("Gateway URLs (for spot-check):");
  for (const r of results) {
    console.log(`  #${r.id}: https://gateway.pinata.cloud/ipfs/${r.cid}`);
  }
  console.log("══════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
