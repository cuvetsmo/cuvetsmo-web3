import { NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  parseEther,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

/**
 * Faucet endpoint — drips 0.001 ETH on Base Sepolia to a user's address.
 *
 * DORMANT (2026-05-20): every visible feature on web3.cuvetsmo.com pays
 * its own gas via Pimlico Paymaster + Coinbase Smart Wallet UserOps, so
 * users never need raw ETH and the Wallet 101 wizard no longer routes
 * here. This route is intentionally left in place + the dormant
 * FaucetStep component in wallet-101-wizard.tsx is preserved so we can
 * revive cheaply if a future feature ever needs EOA-funded gas. To
 * revive: set FAUCET_PRIVATE_KEY env var on Vercel, fund the wallet via
 * Coinbase CDP / Alchemy faucet, then wire the wizard step back in.
 *
 * Rate limit (Day 1): in-memory Map keyed by lowercase address, 24h cooldown.
 *   - Survives normal runtime, NOT process restarts. Good enough for MVP.
 *   - Future: migrate to Supabase table (claims: address, last_claim_at).
 *
 * Server wallet: env FAUCET_PRIVATE_KEY (0x-prefixed). Server-only.
 *
 * If FAUCET_PRIVATE_KEY is missing/empty, returns a helpful 503 pointing
 * users at the Coinbase Developer Platform faucet so the flow still
 * completes (URL updated 2026-05-20: old /faucets/... path now 404s).
 *
 * Spec: master plan §6.4 Faucet (now dormant per the §Wave 3.5 sponsored-
 * deploy retrospective).
 */

const DRIP_AMOUNT_ETH = "0.001";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
// Old /faucets/base-ethereum-sepolia-faucet returns 403 since the Coinbase
// rebrand. The CDP portal path is the current working entry point.
const COINBASE_FAUCET =
  "https://portal.cdp.coinbase.com/products/faucet";

// In-memory rate limit. globalThis so HMR in dev does not blow it away.
const g = globalThis as unknown as { _faucetClaims?: Map<string, number> };
const claims: Map<string, number> = (g._faucetClaims ??= new Map());

const rpcUrl =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org";

export async function GET() {
  const configured = !!process.env.FAUCET_PRIVATE_KEY;
  return NextResponse.json({
    status: "ready",
    pillar: "Learn",
    method: "POST",
    body: { address: "0x..." },
    dripAmountEth: DRIP_AMOUNT_ETH,
    cooldownHours: COOLDOWN_MS / 3_600_000,
    serverWalletConfigured: configured,
    fallbackFaucet: configured ? null : COINBASE_FAUCET,
  });
}

export async function POST(req: Request) {
  let body: { address?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const address = body.address?.toString().trim();
  if (!address || !isAddress(address)) {
    return NextResponse.json(
      { error: "Missing or invalid `address` (expected 0x... 40 hex)" },
      { status: 400 },
    );
  }

  const key = address.toLowerCase();
  const last = claims.get(key);
  const now = Date.now();
  if (last && now - last < COOLDOWN_MS) {
    const remainingMs = COOLDOWN_MS - (now - last);
    return NextResponse.json(
      {
        error: "Rate limited",
        remainingHours: Math.ceil(remainingMs / 3_600_000),
        message: "1 drip per address per 24h. Try again later.",
      },
      { status: 429 },
    );
  }

  const pkRaw = process.env.FAUCET_PRIVATE_KEY?.trim();
  if (!pkRaw) {
    return NextResponse.json(
      {
        error: "Faucet not configured yet",
        message:
          "Server wallet not funded. ใช้ Coinbase Base Sepolia public faucet ระหว่างนี้ก่อน.",
        fallbackFaucet: COINBASE_FAUCET,
      },
      { status: 503 },
    );
  }

  // Normalize hex
  const pk: Hex = (pkRaw.startsWith("0x") ? pkRaw : `0x${pkRaw}`) as Hex;
  if (pk.length !== 66) {
    return NextResponse.json(
      { error: "FAUCET_PRIVATE_KEY misconfigured (must be 32-byte hex)" },
      { status: 500 },
    );
  }

  try {
    const account = privateKeyToAccount(pk);
    const transport = http(rpcUrl);
    const wallet = createWalletClient({
      account,
      chain: baseSepolia,
      transport,
    });
    const pub = createPublicClient({ chain: baseSepolia, transport });

    // Cheap sanity check — server wallet has at least 2× drip in balance.
    const bal = await pub.getBalance({ address: account.address });
    const drip = parseEther(DRIP_AMOUNT_ETH);
    if (bal < drip * 2n) {
      return NextResponse.json(
        {
          error: "Faucet wallet low on funds",
          message:
            "Server wallet ใกล้หมด ETH. ใช้ public faucet ก่อน — admin จะเติม.",
          fallbackFaucet: COINBASE_FAUCET,
        },
        { status: 503 },
      );
    }

    const txHash = await wallet.sendTransaction({
      to: address as `0x${string}`,
      value: drip,
    });

    claims.set(key, now);

    return NextResponse.json({
      success: true,
      txHash,
      explorerUrl: `https://sepolia.basescan.org/tx/${txHash}`,
      dripAmountEth: DRIP_AMOUNT_ETH,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Faucet send failed", message },
      { status: 500 },
    );
  }
}
