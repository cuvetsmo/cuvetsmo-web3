import { NextResponse } from "next/server";
import {
  createPublicClient,
  encodeFunctionData,
  http,
  isAddress,
  type Hex,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import {
  toCoinbaseSmartAccount,
  createBundlerClient,
  createPaymasterClient,
  entryPoint06Address,
} from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";

import {
  getQuestById,
  metadataUriForQuest,
  questSignChallenge,
  SIGNATURE_VERIFIED_KINDS,
} from "@/lib/quests";
import {
  CONTRACTS,
  BADGE_REGISTRY_ABI,
  isReady,
} from "@/lib/contracts";
import { encodeBadge, SCHEMAS } from "@/lib/eas";

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
  /** Wallet signature over questSignChallenge(id, userAddress) — required for
   *  sign / vote / connect / auto kinds (no on-chain tx artifact). */
  signature?: string;
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
  } else if (SIGNATURE_VERIFIED_KINDS.has(quest.kind)) {
    // sign / vote / connect / auto — no on-chain tx to inspect, so the user
    // must prove they ACTIVELY completed the quest by signing a quest-specific
    // challenge with their wallet. The server verifies the signature recovers
    // to userAddress (EOA via ECDSA, or smart account via ERC-1271). This
    // closes the bug where these quests passed with zero user action.
    const signature = body.signature?.toString().trim();
    if (!signature || !/^0x[a-fA-F0-9]+$/.test(signature)) {
      return NextResponse.json(
        {
          error:
            "This quest requires a wallet signature. Sign the challenge in your wallet, then verify.",
        },
        { status: 400 },
      );
    }

    try {
      const pub = createPublicClient({
        chain: baseSepolia,
        transport: http(rpcUrl),
      });
      const challenge = questSignChallenge(questId, userAddress);
      // verifyMessage handles EOA (ECDSA), smart-contract (ERC-1271), and
      // counterfactual (ERC-6492) signatures via the universal validator.
      const ok = await pub.verifyMessage({
        address: userAddress as Address,
        message: challenge,
        signature: signature as Hex,
      });
      if (!ok) {
        return NextResponse.json(
          {
            error:
              "Signature does not match your wallet for this quest. Re-sign and try again.",
          },
          { status: 422 },
        );
      }
      verified = true;
      detail = `${quest.kind} signature verified against ${userAddress}.`;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: "Signature verification failed", message },
        { status: 500 },
      );
    }
  } else {
    // Unknown / future kind — fail closed rather than hand out a free badge.
    return NextResponse.json(
      { error: `Quest kind '${quest.kind}' has no verifier` },
      { status: 422 },
    );
  }

  if (!verified) {
    return NextResponse.json(
      { verified: false, message: "Quest not verified." },
      { status: 422 },
    );
  }

  // ─── Mint badge as EAS attestation via Pimlico-sponsored Smart Account ───
  //
  // Switched from BadgeRegistry.mint() (owner-only · needs funded admin EOA)
  // to EAS BADGE attestation (anyone can attest · sponsored by Pimlico) so
  // the server can issue quest badges without burning gas on a hot wallet.
  //
  // Required env:
  //   EAS_ATTESTER_PRIVATE_KEY (or DEPLOYER_PRIVATE_KEY) — server-only EOA
  //                                                       whose Smart Account
  //                                                       signs attestations
  //   NEXT_PUBLIC_EAS_SCHEMA_BADGE — BADGE schema UID (already registered)
  //   NEXT_PUBLIC_PIMLICO_BUNDLER_URL  — Pimlico bundler + paymaster RPC
  //
  // Falls back to `mintPending: true` if any of these are missing — keeps
  // the verified XP path working even before the env vars are set in prod.
  const attesterKey = (
    process.env.EAS_ATTESTER_PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY
  )?.trim();
  const badgeSchemaUid = SCHEMAS.BADGE.uid;
  const pimlicoUrl = process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL;

  if (!attesterKey || !badgeSchemaUid || !pimlicoUrl) {
    return NextResponse.json({
      verified: true,
      questId,
      badge: quest.badge,
      xp: quest.xp,
      mintPending: true,
      detail,
      message:
        "Verified! Badge attestation pending — set EAS_ATTESTER_PRIVATE_KEY (server) + NEXT_PUBLIC_EAS_SCHEMA_BADGE + NEXT_PUBLIC_PIMLICO_BUNDLER_URL to enable on-chain badges. XP is already counted.",
    });
  }

  try {
    const pk: Hex = (attesterKey.startsWith("0x")
      ? attesterKey
      : `0x${attesterKey}`) as Hex;
    const owner = privateKeyToAccount(pk);

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    });

    // version: '1.1' matches deploy-via-pimlico.mts so we use the SAME smart
    // account that owns the contracts (0x96165f...c456).
    const smartAccount = await toCoinbaseSmartAccount({
      client: publicClient,
      owners: [owner],
      version: "1.1",
    });

    const bundler = createBundlerClient({
      account: smartAccount,
      client: publicClient,
      transport: http(pimlicoUrl),
      paymaster: createPaymasterClient({ transport: http(pimlicoUrl) }),
    });
    const pimlicoClient = createPimlicoClient({
      transport: http(pimlicoUrl),
      entryPoint: { address: entryPoint06Address, version: "0.6" },
    });

    // EAS contract on Base + Base Sepolia (same address).
    const EAS_ADDRESS: Address = "0x4200000000000000000000000000000000000021";
    const ZERO_BYTES32 =
      "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex;

    // Encode the BADGE attestation payload (string badgeId, string metadataURI, uint64 awardedAt).
    // metadataURI prefers the pinned IPFS CID (immutable · standalone). Falls
    // back to the quest detail page URL if the CID hasn't been pinned yet.
    const metadataURI =
      metadataUriForQuest(quest.id) ||
      `https://web3.cuvetsmo.com/learn/quests/${quest.id}`;
    const badgeData = encodeBadge({
      badgeId: `cuvetsmo-quest-${quest.id}`,
      metadataURI,
      awardedAt: Math.floor(Date.now() / 1000),
    });

    // EAS attest() ABI fragment — single attestation.
    const EAS_ATTEST_ABI = [
      {
        inputs: [
          {
            components: [
              { name: "schema", type: "bytes32" },
              {
                components: [
                  { name: "recipient", type: "address" },
                  { name: "expirationTime", type: "uint64" },
                  { name: "revocable", type: "bool" },
                  { name: "refUID", type: "bytes32" },
                  { name: "data", type: "bytes" },
                  { name: "value", type: "uint256" },
                ],
                name: "data",
                type: "tuple",
              },
            ],
            name: "request",
            type: "tuple",
          },
        ],
        name: "attest",
        outputs: [{ name: "", type: "bytes32" }],
        stateMutability: "payable",
        type: "function",
      },
    ] as const;

    const callData = encodeFunctionData({
      abi: EAS_ATTEST_ABI,
      functionName: "attest",
      args: [
        {
          schema: badgeSchemaUid,
          data: {
            recipient: userAddress as `0x${string}`,
            expirationTime: 0n,
            revocable: true,
            refUID: ZERO_BYTES32,
            data: badgeData as Hex,
            value: 0n,
          },
        },
      ],
    });

    const gasPrice = await pimlicoClient.getUserOperationGasPrice();
    const userOpHash = await bundler.sendUserOperation({
      account: smartAccount,
      calls: [{ to: EAS_ADDRESS, value: 0n, data: callData }],
      maxFeePerGas: gasPrice.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
    });

    const receipt = await bundler.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return NextResponse.json({
      verified: true,
      questId,
      badge: quest.badge,
      xp: quest.xp,
      // Back-compat fields — quest-grid client still reads these.
      mintTxHash: receipt.receipt.transactionHash,
      explorerUrl: `https://sepolia.basescan.org/tx/${receipt.receipt.transactionHash}`,
      // Richer EAS-native fields for future quest UIs.
      attestation: {
        schemaUid: badgeSchemaUid,
        attester: smartAccount.address,
        userOpHash,
        txHash: receipt.receipt.transactionHash,
        easExplorerUrl: `https://base-sepolia.easscan.org/attester/with-schema/${badgeSchemaUid}/by/${userAddress}`,
      },
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
          "Verified but badge attestation failed on-chain. Your XP is still counted — try again later.",
      },
      { status: 200 },
    );
  }
}

// BADGE_REGISTRY_ABI + CONTRACTS.BADGE_REGISTRY are no longer referenced by
// this route's mint path (we switched to EAS attestations via Pimlico). Keep
// the imports for downstream callers that may still read badge state, and
// reference them here so the linter doesn't strip them as unused.
void BADGE_REGISTRY_ABI;
void CONTRACTS.BADGE_REGISTRY;
void isReady;
