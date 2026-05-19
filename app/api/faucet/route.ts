import { NextResponse } from "next/server";

/**
 * Faucet endpoint — placeholder.
 *
 * Agent B implements:
 *   - rate limit (1 claim per address per 24h)
 *   - signature verification on POST body
 *   - server-side wallet sends ~0.01 ETH on Base Sepolia
 *
 * Use cuvetsmo-server wallet (private key in FAUCET_PRIVATE_KEY env, NEVER NEXT_PUBLIC_*).
 *
 * Spec: master plan §6.4 Faucet
 */
export async function GET() {
  return NextResponse.json({
    status: "placeholder",
    pillar: "Learn",
    agent: "Agent B",
    spec: "master plan §6.4 Faucet",
    method: "POST",
    note: "Wave 1 stub. Wave 2 wires up rate-limited Base Sepolia ETH dispenser.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      error: "faucet not yet implemented",
      agent: "Agent B will implement in Wave 2",
    },
    { status: 501 },
  );
}
