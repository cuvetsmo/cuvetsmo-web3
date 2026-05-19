/**
 * EAS schema registration helper · CUVETSMO Web3
 *
 * Wave 2F · Free Base mainnet path.
 *
 * Two modes:
 *
 *   GET /api/eas/schemas
 *     → Returns the current schema configuration + readiness check.
 *       Useful for the admin/status dashboard.
 *
 *   POST /api/eas/schemas
 *     → Registers a single schema on Base mainnet via an admin wallet.
 *       Body: { schemaName: 'VET_CARD' | 'BADGE' | 'GUESTBOOK', network?: 'base' | 'base-sepolia' }
 *       Cost: ~$0.50 per schema on Base mainnet (one-time, on the admin wallet).
 *       Returns: { uid, txHash, schemaName, network, alreadyRegistered? }
 *
 * Admin wallet: env EAS_ADMIN_PRIVATE_KEY (server-only, NEVER NEXT_PUBLIC_).
 *               If unset, POST returns 503 with instructions.
 *
 * Day-1 production flow (if Palm has admin wallet funded):
 *   1. curl -X POST /api/eas/schemas -d '{"schemaName":"VET_CARD"}'
 *   2. Paste returned UID into .env.local as NEXT_PUBLIC_EAS_SCHEMA_VET_CARD
 *   3. Repeat for BADGE and GUESTBOOK
 *   4. Push to Vercel
 *
 * Alternative (CDP-sponsored client-side registration): use lib/eas.ts
 * `registerSchema()` directly from an admin-only page. Either path works.
 */

import { NextResponse } from "next/server";
import { JsonRpcProvider, Wallet } from "ethers";
import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import type { Hex } from "viem";

import {
  CHAIN_IDS,
  SCHEMA_REGISTRY_ADDRESS,
  SCHEMAS,
  defaultRpcForNetwork,
  easSchemaUrl,
  schemasReady,
  type EasNetwork,
  type SchemaName,
} from "@/lib/eas";

const VALID_SCHEMA_NAMES: SchemaName[] = ["VET_CARD", "BADGE", "GUESTBOOK"];

function isSchemaName(v: string | undefined): v is SchemaName {
  return !!v && VALID_SCHEMA_NAMES.includes(v as SchemaName);
}

function isNetwork(v: string | undefined): v is EasNetwork {
  return v === "base" || v === "base-sepolia";
}

export async function GET() {
  const summary = VALID_SCHEMA_NAMES.map((name) => {
    const s = SCHEMAS[name];
    return {
      name,
      label: s.label,
      schema: s.schema,
      revocable: s.revocable,
      uid: s.uid || null,
      registered: !!s.uid,
      easExplorerUrl: s.uid ? easSchemaUrl(s.uid, "base") : null,
    };
  });

  const adminConfigured = !!process.env.EAS_ADMIN_PRIVATE_KEY?.trim();

  return NextResponse.json({
    status: "ready",
    pillar: "EAS",
    network: {
      base: { chainId: CHAIN_IDS.BASE, explorer: "https://base.easscan.org" },
      "base-sepolia": {
        chainId: CHAIN_IDS.BASE_SEPOLIA,
        explorer: "https://base-sepolia.easscan.org",
      },
    },
    contracts: {
      schemaRegistry: SCHEMA_REGISTRY_ADDRESS,
    },
    schemas: summary,
    allRegistered: schemasReady(),
    adminWalletConfigured: adminConfigured,
    docs: {
      easDocs: "https://docs.attest.org/",
      mainnetFreePathDoc: "/docs/MAINNET_FREE_PATH.md",
    },
  });
}

export async function POST(req: Request) {
  let body: { schemaName?: string; network?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const name = body.schemaName?.toString().trim();
  if (!isSchemaName(name)) {
    return NextResponse.json(
      {
        error: "Invalid schemaName",
        message: `expected one of ${VALID_SCHEMA_NAMES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const networkRaw = body.network?.toString().trim() ?? "base";
  if (!isNetwork(networkRaw)) {
    return NextResponse.json(
      {
        error: "Invalid network",
        message: "expected 'base' or 'base-sepolia'",
      },
      { status: 400 },
    );
  }
  const network: EasNetwork = networkRaw;

  // Idempotent: if the schema is already configured via env var, return it.
  const existing = SCHEMAS[name];
  if (existing.uid) {
    return NextResponse.json({
      schemaName: name,
      network,
      uid: existing.uid,
      txHash: null,
      alreadyRegistered: true,
      easExplorerUrl: easSchemaUrl(existing.uid, network),
    });
  }

  const pkRaw = process.env.EAS_ADMIN_PRIVATE_KEY?.trim();
  if (!pkRaw) {
    // Day-1: admin wallet not yet funded → return placeholder + instructions.
    return NextResponse.json(
      {
        error: "Admin wallet not configured",
        message:
          "EAS_ADMIN_PRIVATE_KEY not set. Either (a) set it after funding " +
          "the admin wallet with ~$2 on Base mainnet, or (b) register " +
          "schemas client-side via lib/eas.ts registerSchema() while " +
          "connected to the admin wallet.",
        instructions: [
          "1. cast wallet new  # generate admin keypair",
          "2. Fund the address with ~$2 of ETH on Base mainnet (covers 3 schemas)",
          "3. Add EAS_ADMIN_PRIVATE_KEY=0x... to .env.local (server-only)",
          "4. Re-run this POST endpoint for VET_CARD, BADGE, GUESTBOOK",
          "5. Paste returned UIDs into NEXT_PUBLIC_EAS_SCHEMA_* env vars",
          "6. Redeploy",
        ],
        schemaName: name,
        network,
        uid: null,
        alreadyRegistered: false,
        placeholder: true,
      },
      { status: 503 },
    );
  }

  // Normalize hex.
  const pk: Hex = (pkRaw.startsWith("0x") ? pkRaw : `0x${pkRaw}`) as Hex;
  if (pk.length !== 66) {
    return NextResponse.json(
      { error: "EAS_ADMIN_PRIVATE_KEY misconfigured (must be 32-byte hex)" },
      { status: 500 },
    );
  }

  try {
    const provider = new JsonRpcProvider(defaultRpcForNetwork(network));
    const wallet = new Wallet(pk, provider);

    // Sanity check — admin has enough ETH to cover ~$1 of gas.
    const bal = await provider.getBalance(wallet.address);
    const minBal = 500_000_000_000_000n; // 0.0005 ETH (~$1-2 on Base)
    if (bal < minBal) {
      return NextResponse.json(
        {
          error: "Admin wallet too low on funds",
          message: `${wallet.address} has only ${bal.toString()} wei — needs ≥0.0005 ETH on ${network}`,
          adminAddress: wallet.address,
        },
        { status: 503 },
      );
    }

    const reg = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
    reg.connect(wallet);

    const schema = SCHEMAS[name];
    const tx = await reg.register({
      schema: schema.schema,
      revocable: schema.revocable,
    });
    const uid = await tx.wait();

    return NextResponse.json({
      schemaName: name,
      network,
      uid,
      txHash: tx.receipt?.hash ?? null,
      adminAddress: wallet.address,
      alreadyRegistered: false,
      easExplorerUrl: easSchemaUrl(uid, network),
      next: `Paste UID into .env.local as NEXT_PUBLIC_EAS_SCHEMA_${name}=${uid}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // If the schema was already registered (deterministic UID collision),
    // EAS will revert. Detect and surface a friendly message.
    if (/already exists|AlreadyExists/i.test(message)) {
      return NextResponse.json(
        {
          error: "Schema already registered on chain",
          message:
            "Someone (possibly us in a past deploy) already registered this " +
            "schema. Use lib/eas.ts computeSchemaUid(...) to recover the UID " +
            "and paste it into .env.local.",
          schemaName: name,
          network,
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Schema registration failed", message },
      { status: 500 },
    );
  }
}
