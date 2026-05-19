import { NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

import { getQuestById } from "@/lib/quests";
import {
  CONTRACTS,
  BADGE_REGISTRY_ABI,
  isReady,
} from "@/lib/contracts";

/**
 * POST /api/quests/[id]/verify
 *
 * Body: { userAddress: 0x..., txHash?: 0x..., extra?: any }
 *
 * 1. Look up quest by id.
 * 2. Run on-chain verification matching the quest's `kind`:
 *    - mint / transfer / approve: receipt exists + emits expected topic
 *    - sign / vote: trusted client-side signal (Day 1) — TODO server-verify
 *    - read: presence of receipt/tx is enough (URL parsing handled client side)
 *    - auto: no verification needed
 *    - connect: client-side only — server records claim
 * 3. If verified + BadgeRegistry deployed + BADGE_MINTER_PRIVATE_KEY present →
 *    server mints badge via BadgeRegistry.mint(user, badgeId).
 *    Otherwise return verified=true with `mintPending=true` so the UI can
 *    show "badge will mint once contracts go live".
 *
 * Spec: master plan §5.2 Quests
 */

interface VerifyBody {
  userAddress?: string;
  txHash?: string;
}

const rpcUrl =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org";

// ERC-721/1155 Transfer + ERC-20 Approval topic0s — used for log sniffing.
const TOPIC_TRANSFER_ERC721 =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const TOPIC_APPROVAL_ERC20 =
  "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const questId = Number.parseInt(id, 10);
  const quest = getQuestById(questId);
  if (!quest) {
    return NextResponse.json(
      { error: `Unknown quest id ${id}` },
      { status: 404 },
    );
  }

  let body: VerifyBody = {};
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const userAddress = body.userAddress?.toString().trim();
  if (!userAddress || !isAddress(userAddress)) {
    return NextResponse.json(
      { error: "Missing or invalid `userAddress`" },
      { status: 400 },
    );
  }

  // Per-kind verification ------------------------------------------------
  const verifyKindsNeedingTx: string[] = [
    "mint",
    "transfer",
    "approve",
    "read",
  ];
  let verified = false;
  let detail = "";

  if (verifyKindsNeedingTx.includes(quest.kind)) {
    const txHash = body.txHash?.toString().trim();
    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json(
        { error: "Quest needs txHash (0x + 64 hex)" },
        { status: 400 },
      );
    }

    try {
      const pub = createPublicClient({
        chain: baseSepolia,
        transport: http(rpcUrl),
      });
      const receipt = await pub.getTransactionReceipt({
        hash: txHash as Hex,
      });
      if (!receipt || receipt.status !== "success") {
        return NextResponse.json(
          { error: "Tx not found or failed" },
          { status: 422 },
        );
      }
      const userLc = userAddress.toLowerCase();
      const fromLc = receipt.from.toLowerCase();
      if (fromLc !== userLc) {
        return NextResponse.json(
          {
            error: "Tx sender does not match userAddress",
            from: receipt.from,
            userAddress,
          },
          { status: 422 },
        );
      }

      if (quest.kind === "mint") {
        // ERC-721 mint = Transfer from 0x0 with the user as `to` (topic2).
        const mintLog = receipt.logs.find((l) => {
          if (l.topics[0] !== TOPIC_TRANSFER_ERC721) return false;
          const fromTopic = l.topics[1];
          const toTopic = l.topics[2];
          if (!fromTopic || !toTopic) return false;
          const fromAddr = `0x${fromTopic.slice(-40)}`.toLowerCase();
          const toAddr = `0x${toTopic.slice(-40)}`.toLowerCase();
          return (
            fromAddr === "0x0000000000000000000000000000000000000000" &&
            toAddr === userLc
          );
        });
        if (!mintLog) {
          return NextResponse.json(
            {
              error:
                "No ERC-721 mint Transfer event found with you as recipient",
            },
            { status: 422 },
          );
        }
        verified = true;
        detail = "ERC-721 mint Transfer event matched.";
      } else if (quest.kind === "transfer") {
        const ok = receipt.logs.some(
          (l) => l.topics[0] === TOPIC_TRANSFER_ERC721,
        );
        if (!ok) {
          return NextResponse.json(
            { error: "No Transfer event in tx" },
            { status: 422 },
          );
        }
        verified = true;
        detail = "Transfer event present.";
      } else if (quest.kind === "approve") {
        const ok = receipt.logs.some(
          (l) => l.topics[0] === TOPIC_APPROVAL_ERC20,
        );
        if (!ok) {
          return NextResponse.json(
            { error: "No Approval event in tx" },
            { status: 422 },
          );
        }
        verified = true;
        detail = "ERC-20 Approval event present.";
      } else if (quest.kind === "read") {
        // Reading quests use tx hash as the artifact of "did you find it".
        verified = true;
        detail = `Tx ${txHash} exists with status=success.`;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: "Receipt lookup failed", message },
        { status: 500 },
      );
    }
  } else {
    // sign / vote / auto / connect — Day 1 trusts the client signal.
    verified = true;
    detail = `${quest.kind} verification stub (Day 1).`;
  }

  if (!verified) {
    return NextResponse.json(
      { verified: false, message: "Quest not verified." },
      { status: 422 },
    );
  }

  // Mint badge ----------------------------------------------------------
  const minterKey = process.env.BADGE_MINTER_PRIVATE_KEY?.trim();
  const registry = CONTRACTS.BADGE_REGISTRY;

  if (!isReady(registry) || !minterKey) {
    return NextResponse.json({
      verified: true,
      questId,
      badge: quest.badge,
      xp: quest.xp,
      mintPending: true,
      detail,
      message:
        "Verified! Badge mint pending — contracts will be wired soon. Your XP is already counted.",
    });
  }

  try {
    const pk: Hex = (minterKey.startsWith("0x")
      ? minterKey
      : `0x${minterKey}`) as Hex;
    const account = privateKeyToAccount(pk);
    const wallet = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(rpcUrl),
    });
    const txHash = await wallet.writeContract({
      address: registry,
      abi: BADGE_REGISTRY_ABI,
      functionName: "mint",
      args: [userAddress as `0x${string}`, BigInt(quest.id)],
    });
    return NextResponse.json({
      verified: true,
      questId,
      badge: quest.badge,
      xp: quest.xp,
      mintTxHash: txHash,
      explorerUrl: `https://sepolia.basescan.org/tx/${txHash}`,
      detail,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        verified: true,
        questId,
        badge: quest.badge,
        xp: quest.xp,
        mintError: message,
        detail,
        message:
          "Verified but badge mint failed on-chain. Try again later — XP is still counted.",
      },
      { status: 200 },
    );
  }
}
