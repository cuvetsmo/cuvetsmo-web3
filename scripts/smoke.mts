/**
 * Smoke test · CUVETSMO Web3 wired-state verifier
 *
 * Run before every `git push` to catch regressions early. Verifies:
 *
 *   1.  Env vars present (.env.local has the keys the runtime expects)
 *   2.  11 deployed contracts have bytecode at their declared addresses
 *   3.  3 EAS schemas exist on Base Sepolia
 *   4.  Pinata gateway resolves a known IPFS CID (quest #1 metadata)
 *   5.  Pimlico bundler URL responds to `eth_chainId`
 *
 * Output: GREEN per pass, RED per fail, summary count. Exits 0 if all
 * pass, exits 1 if any fail (CI-ready).
 *
 * Usage (from repo root):
 *   npx tsx scripts/smoke.mts
 */
import path from "node:path";
import dotenv from "dotenv";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
dotenv.config({ path: path.join(REPO_ROOT, ".env.local") });
dotenv.config({ path: path.join(REPO_ROOT, "contracts", ".env") });

import {
  createPublicClient,
  http,
  type Address,
  type Hex,
} from "viem";
import { baseSepolia } from "viem/chains";

// ─── Configuration ────────────────────────────────────────────────────

const REQUIRED_ENV = [
  "NEXT_PUBLIC_PIMLICO_BUNDLER_URL",
  "NEXT_PUBLIC_PIMLICO_PAYMASTER_URL",
  "NEXT_PUBLIC_ORG_REGISTRY_ADDRESS",
  "NEXT_PUBLIC_VET_SBT_CARD_ADDRESS",
  "NEXT_PUBLIC_BADGE_REGISTRY_ADDRESS",
  "NEXT_PUBLIC_FIRST_STEPS_SBT_ADDRESS",
  "NEXT_PUBLIC_GUESTBOOK_ADDRESS",
  "NEXT_PUBLIC_TOKEN_IMPL_ADDRESS",
  "NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS",
  "NEXT_PUBLIC_NFT_IMPL_ADDRESS",
  "NEXT_PUBLIC_NFT_FACTORY_ADDRESS",
  "NEXT_PUBLIC_SBT_FACTORY_ADDRESS",
  "NEXT_PUBLIC_GOVERNOR_FACTORY_ADDRESS",
  "NEXT_PUBLIC_EAS_SCHEMA_VET_CARD",
  "NEXT_PUBLIC_EAS_SCHEMA_BADGE",
  "NEXT_PUBLIC_EAS_SCHEMA_GUESTBOOK",
  "PINATA_JWT",
] as const;

const OPTIONAL_ENV = [
  "DEPLOYER_PRIVATE_KEY", // contracts/.env · needed for server-side Pimlico ops
  "EAS_ATTESTER_PRIVATE_KEY", // optional alias; falls back to DEPLOYER_PRIVATE_KEY
] as const;

const CONTRACTS_TO_CHECK: Array<{ name: string; envKey: string }> = [
  { name: "OrgRegistry", envKey: "NEXT_PUBLIC_ORG_REGISTRY_ADDRESS" },
  { name: "VetSBTCard", envKey: "NEXT_PUBLIC_VET_SBT_CARD_ADDRESS" },
  { name: "BadgeRegistry", envKey: "NEXT_PUBLIC_BADGE_REGISTRY_ADDRESS" },
  { name: "FirstStepsSBT", envKey: "NEXT_PUBLIC_FIRST_STEPS_SBT_ADDRESS" },
  { name: "Guestbook", envKey: "NEXT_PUBLIC_GUESTBOOK_ADDRESS" },
  { name: "TokenImpl", envKey: "NEXT_PUBLIC_TOKEN_IMPL_ADDRESS" },
  { name: "TokenFactory", envKey: "NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS" },
  { name: "NFTImpl", envKey: "NEXT_PUBLIC_NFT_IMPL_ADDRESS" },
  { name: "NFTFactory", envKey: "NEXT_PUBLIC_NFT_FACTORY_ADDRESS" },
  { name: "SBTFactory", envKey: "NEXT_PUBLIC_SBT_FACTORY_ADDRESS" },
  { name: "GovernorFactory", envKey: "NEXT_PUBLIC_GOVERNOR_FACTORY_ADDRESS" },
];

const SCHEMAS_TO_CHECK: Array<{ name: string; envKey: string }> = [
  { name: "VET_CARD", envKey: "NEXT_PUBLIC_EAS_SCHEMA_VET_CARD" },
  { name: "BADGE", envKey: "NEXT_PUBLIC_EAS_SCHEMA_BADGE" },
  { name: "GUESTBOOK", envKey: "NEXT_PUBLIC_EAS_SCHEMA_GUESTBOOK" },
];

const SCHEMA_REGISTRY_ADDRESS: Address =
  "0x4200000000000000000000000000000000000020";
const SCHEMA_REGISTRY_ABI = [
  {
    inputs: [{ name: "uid", type: "bytes32" }],
    name: "getSchema",
    outputs: [
      {
        components: [
          { name: "uid", type: "bytes32" },
          { name: "resolver", type: "address" },
          { name: "revocable", type: "bool" },
          { name: "schema", type: "string" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const EMPTY_UID: Hex = `0x${"0".repeat(64)}` as Hex;

const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";

// Quest #1 CID baked into lib/quests.ts — keep in sync.
const SAMPLE_QUEST_CID = "QmRm6DpCRC1pwtcgFYP5HDv8GKyAru9kJRAaYVNtBZYyKY";

// ─── Output helpers ─────────────────────────────────────────────────────

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

let passed = 0;
let failed = 0;
let warned = 0;

function pass(label: string, detail = "") {
  passed++;
  console.log(`  ${GREEN}✓${RESET} ${label}${detail ? `  ${DIM}${detail}${RESET}` : ""}`);
}

function fail(label: string, detail = "") {
  failed++;
  console.log(`  ${RED}✗${RESET} ${label}${detail ? `  ${DIM}${detail}${RESET}` : ""}`);
}

function warn(label: string, detail = "") {
  warned++;
  console.log(`  ${YELLOW}!${RESET} ${label}${detail ? `  ${DIM}${detail}${RESET}` : ""}`);
}

function section(title: string) {
  console.log(`\n${BOLD}── ${title} ──${RESET}`);
}

// ─── Checks ─────────────────────────────────────────────────────────────

function checkEnv() {
  section("1 · Env vars");
  for (const key of REQUIRED_ENV) {
    const v = process.env[key]?.trim();
    if (v) {
      pass(key, mask(v));
    } else {
      fail(key, "missing");
    }
  }
  for (const key of OPTIONAL_ENV) {
    const v = process.env[key]?.trim();
    if (v) {
      pass(key, `${mask(v)} (optional)`);
    } else {
      warn(key, "optional · server-side gasless mint will fall back to mintPending");
    }
  }
}

function mask(v: string): string {
  if (v.length <= 12) return v.slice(0, 4) + "…";
  return v.slice(0, 6) + "…" + v.slice(-4);
}

async function checkContracts(client: ReturnType<typeof createPublicClient>) {
  section("2 · Contracts on Base Sepolia (chainId 84532)");
  for (const c of CONTRACTS_TO_CHECK) {
    const addr = process.env[c.envKey] as Address | undefined;
    if (!addr) {
      fail(c.name, `${c.envKey} unset`);
      continue;
    }
    try {
      const code = await client.getCode({ address: addr });
      if (code && code !== "0x" && code.length > 4) {
        pass(c.name, `${addr.slice(0, 8)}… (${(code.length - 2) / 2} bytes)`);
      } else {
        fail(c.name, `${addr.slice(0, 8)}… · no bytecode`);
      }
    } catch (err) {
      fail(c.name, err instanceof Error ? err.message : String(err));
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkSchemas(client: any) {
  section("3 · EAS schemas on Base Sepolia");
  for (const s of SCHEMAS_TO_CHECK) {
    const uid = process.env[s.envKey] as Hex | undefined;
    if (!uid) {
      fail(s.name, `${s.envKey} unset`);
      continue;
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(uid)) {
      fail(s.name, `${uid.slice(0, 12)}… · not a 32-byte hex`);
      continue;
    }
    try {
      const rec = (await client.readContract({
        address: SCHEMA_REGISTRY_ADDRESS,
        abi: SCHEMA_REGISTRY_ABI,
        functionName: "getSchema",
        args: [uid],
      })) as { uid: Hex; schema: string; revocable: boolean };
      if (rec.uid !== EMPTY_UID && rec.schema.length > 0) {
        pass(
          s.name,
          `revocable=${rec.revocable} · ${rec.schema.slice(0, 50)}${rec.schema.length > 50 ? "…" : ""}`,
        );
      } else {
        fail(s.name, `${uid.slice(0, 12)}… · not registered on chain`);
      }
    } catch (err) {
      fail(s.name, err instanceof Error ? err.message : String(err));
    }
  }
}

async function checkPinataGateway() {
  section("4 · Pinata gateway · sample quest metadata");
  const url = `https://${PINATA_GATEWAY}/ipfs/${SAMPLE_QUEST_CID}`;
  try {
    const abort = new AbortController();
    const t = setTimeout(() => abort.abort(), 8000);
    const res = await fetch(url, { signal: abort.signal });
    clearTimeout(t);
    if (!res.ok) {
      fail(`GET ${url}`, `HTTP ${res.status}`);
      return;
    }
    const json = (await res.json()) as Record<string, unknown>;
    const name = json?.name as string | undefined;
    if (name && name.includes("CUVETSMO Quest")) {
      pass("Pinata gateway OK", `name="${name}"`);
    } else {
      warn("Pinata gateway returned unexpected JSON", `name=${name}`);
    }
  } catch (err) {
    fail(`GET ${url}`, err instanceof Error ? err.message : String(err));
  }
}

async function checkPimlico() {
  section("5 · Pimlico bundler reachable");
  const url = process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL;
  if (!url) {
    fail("NEXT_PUBLIC_PIMLICO_BUNDLER_URL unset", "");
    return;
  }
  try {
    const abort = new AbortController();
    const t = setTimeout(() => abort.abort(), 8000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_chainId",
        params: [],
      }),
      signal: abort.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      fail("Pimlico HTTP", `${res.status} ${res.statusText}`);
      return;
    }
    const json = (await res.json()) as { result?: string; error?: { message?: string } };
    if (json.error) {
      fail("Pimlico RPC error", json.error.message ?? "unknown");
      return;
    }
    const chainId = json.result ? parseInt(json.result, 16) : NaN;
    if (chainId === 84532) {
      pass("Pimlico bundler OK", `chainId=84532 (Base Sepolia)`);
    } else {
      warn("Pimlico chainId mismatch", `expected 84532 · got ${chainId}`);
    }
  } catch (err) {
    fail("Pimlico fetch", err instanceof Error ? err.message : String(err));
  }
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log(
    `${BOLD}CUVETSMO Web3 · smoke test${RESET}\n${DIM}target: Base Sepolia (chainId 84532)${RESET}`,
  );

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org",
    ),
  });

  checkEnv();
  await checkContracts(client);
  await checkSchemas(client);
  await checkPinataGateway();
  await checkPimlico();

  console.log("\n" + BOLD + "── Summary ──" + RESET);
  console.log(
    `  ${GREEN}${passed} passed${RESET}` +
      (warned ? ` · ${YELLOW}${warned} warned${RESET}` : "") +
      (failed ? ` · ${RED}${failed} failed${RESET}` : ""),
  );
  if (failed > 0) {
    console.log(`\n${RED}${BOLD}✗ smoke test failed${RESET} — fix the items above before pushing.\n`);
    process.exit(1);
  } else {
    console.log(`\n${GREEN}${BOLD}✓ all checks passed${RESET}\n`);
  }
}

main().catch((err) => {
  console.error("Smoke test threw:", err);
  process.exit(1);
});
