/**
 * EAS schema registration via Pimlico-sponsored UserOps — CUVETSMO Web3
 *
 * Mirrors the deploy-via-pimlico.mts pattern but targets the EAS
 * SchemaRegistry contract on Base Sepolia. Registers VET_CARD, BADGE,
 * GUESTBOOK schemas without the deployer EOA needing any ETH.
 *
 * Usage (from repo root):
 *   npx tsx contracts/script/register-eas-schemas-via-pimlico.mts
 *
 * Output: paste-ready `NEXT_PUBLIC_EAS_SCHEMA_*` env-var lines, ready to
 * drop into .env.local + Vercel env. Idempotent — re-runs detect schemas
 * already on-chain and skip them.
 *
 * Cost to deployer: $0 (Pimlico paymaster sponsors all gas).
 */
import path from "node:path";

import dotenvLoader from "dotenv";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
dotenvLoader.config({ path: path.join(REPO_ROOT, ".env.local") });
dotenvLoader.config({ path: path.join(REPO_ROOT, "contracts", ".env") });

import {
  createPublicClient,
  http,
  encodeFunctionData,
  encodePacked,
  keccak256,
  type Hex,
  type Address,
} from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  toCoinbaseSmartAccount,
  createBundlerClient,
  createPaymasterClient,
  entryPoint06Address,
} from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";

// ───────────────────────────────────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────────────────────────────────

const PIMLICO_URL = process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL;
const _DEPLOYER_PK = process.env.DEPLOYER_PRIVATE_KEY as Hex | undefined;

if (!PIMLICO_URL) throw new Error("NEXT_PUBLIC_PIMLICO_BUNDLER_URL missing in .env.local");
if (!_DEPLOYER_PK) throw new Error("DEPLOYER_PRIVATE_KEY missing in contracts/.env");
// Past the guard above this is guaranteed defined — re-bind with the narrower
// type so downstream uses don't fight TypeScript's lost-narrowing across the
// module-level top-level throw.
const DEPLOYER_PK: Hex = _DEPLOYER_PK;

const SCHEMA_REGISTRY: Address = "0x4200000000000000000000000000000000000020";
const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";
const EMPTY_UID: Hex = `0x${"0".repeat(64)}` as Hex;

// Schema definitions — keep IN SYNC with lib/eas.ts SCHEMAS.
const SCHEMAS = [
  {
    name: "VET_CARD" as const,
    schema:
      "uint16 yearAdmitted, bytes32 studentIdHash, uint8 facultyCode, uint8 departmentCode",
    revocable: true,
  },
  {
    name: "BADGE" as const,
    schema: "string badgeId, string metadataURI, uint64 awardedAt",
    revocable: true,
  },
  {
    name: "GUESTBOOK" as const,
    schema: "string message",
    revocable: false,
  },
] as const;

// Minimal ABI fragments for SchemaRegistry.register + getSchema.
const REGISTRY_ABI = [
  {
    inputs: [
      { name: "schema", type: "string" },
      { name: "resolver", type: "address" },
      { name: "revocable", type: "bool" },
    ],
    name: "register",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
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

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

/**
 * Compute the deterministic UID a schema will have once registered.
 * Mirrors SchemaRegistry._getUID() — keccak256(abi.encodePacked(schema,
 * resolver, revocable)).
 */
function predictSchemaUid(
  schema: string,
  resolver: Address,
  revocable: boolean,
): Hex {
  return keccak256(
    encodePacked(
      ["string", "address", "bool"],
      [schema, resolver, revocable],
    ),
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────────────

async function main() {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org",
    ),
  });

  const owner = privateKeyToAccount(DEPLOYER_PK);
  // version: '1.1' matches deploy-via-pimlico.mts — gives the SAME smart
  // account address as the contract-deploy run (0x96165f...c456).
  const smartAccount = await toCoinbaseSmartAccount({
    client: publicClient,
    owners: [owner],
    version: "1.1",
  });

  const smartAccountAddr = await smartAccount.getAddress();
  console.log(`Owner EOA      : ${owner.address}`);
  console.log(`Smart account  : ${smartAccountAddr}`);
  console.log(`SchemaRegistry : ${SCHEMA_REGISTRY}`);

  const smartCode = await publicClient.getCode({ address: smartAccountAddr });
  console.log(
    `Smart status   : ${smartCode && smartCode !== "0x" ? "already deployed" : "will deploy on first UserOp"}`,
  );
  console.log("");

  // Match deploy script — use EntryPoint v0.6 (Pimlico paymaster lives here).
  const bundler = createBundlerClient({
    account: smartAccount,
    client: publicClient,
    transport: http(PIMLICO_URL),
    paymaster: createPaymasterClient({ transport: http(PIMLICO_URL) }),
  });

  const pimlicoClient = createPimlicoClient({
    transport: http(PIMLICO_URL),
    entryPoint: {
      address: entryPoint06Address,
      version: "0.6",
    },
  });

  const results: Array<{ name: string; uid: Hex; status: string }> = [];

  for (const s of SCHEMAS) {
    const predictedUid = predictSchemaUid(s.schema, ZERO_ADDRESS, s.revocable);
    console.log(`──── ${s.name} ────`);
    console.log(`  schema    : ${s.schema}`);
    console.log(`  revocable : ${s.revocable}`);
    console.log(`  predicted : ${predictedUid}`);

    // Idempotency check — is the schema already on-chain?
    const existing = await publicClient.readContract({
      address: SCHEMA_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "getSchema",
      args: [predictedUid],
    });

    if (existing.uid !== EMPTY_UID) {
      console.log(`  status    : already registered, skipping UserOp`);
      results.push({ name: s.name, uid: predictedUid, status: "existing" });
      console.log("");
      continue;
    }

    const callData = encodeFunctionData({
      abi: REGISTRY_ABI,
      functionName: "register",
      args: [s.schema, ZERO_ADDRESS, s.revocable],
    });

    // Pimlico bundler doesn't auto-fill gas prices before asking paymaster
    // for sponsorship — we must fetch + pass them explicitly.
    const gasPrice = await pimlicoClient.getUserOperationGasPrice();

    console.log(`  → sending sponsored UserOp...`);
    const hash = await bundler.sendUserOperation({
      account: smartAccount,
      calls: [{ to: SCHEMA_REGISTRY, value: 0n, data: callData }],
      maxFeePerGas: gasPrice.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
    });
    console.log(`  → userOp  : ${hash}`);

    const receipt = await bundler.waitForUserOperationReceipt({ hash });
    console.log(`  → tx      : ${receipt.receipt.transactionHash}`);
    console.log(`  → success : ${receipt.success}`);

    if (!receipt.success) {
      throw new Error(`UserOp failed for ${s.name}: ${hash}`);
    }
    results.push({ name: s.name, uid: predictedUid, status: "registered" });
    console.log("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Output: paste-ready env-var lines
  // ─────────────────────────────────────────────────────────────────────────
  console.log("══════════════════════════════════════════════════════════");
  console.log("✅ All 3 schemas ready. Paste into .env.local + Vercel:");
  console.log("══════════════════════════════════════════════════════════");
  console.log("");
  for (const r of results) {
    console.log(`NEXT_PUBLIC_EAS_SCHEMA_${r.name}=${r.uid}`);
  }
  console.log("");
  console.log("EAS Scanner (Base Sepolia):");
  for (const r of results) {
    console.log(`  ${r.name}: https://base-sepolia.easscan.org/schema/view/${r.uid}`);
  }
  console.log("══════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
