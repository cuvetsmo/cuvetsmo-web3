"use client";

import { useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useReadContract } from "wagmi";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QUESTS, TOTAL_XP_AVAILABLE, type Quest } from "@/lib/quests";
import {
  CONTRACTS,
  BADGE_REGISTRY_ABI,
  VET_SBT_CARD_ABI,
  isReady,
} from "@/lib/contracts";
import { shortAddress, explorerUrl } from "@/lib/utils";
import { useUserAddresses } from "@/lib/use-user-addresses";

const QUEST_LS_KEY = "cuvetsmo:quests:completed:v1";

interface CompletedState {
  ids: number[];
  xp: number;
}

export function ProfilePanel() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const address = embedded?.address ?? user?.wallet?.address;

  // Same dual-address pattern as VetCardPanel: when gasless mint is used,
  // assets live on the Smart Account, not the Privy EOA. Read at both.
  const { smartAccount } = useUserAddresses();

  // Lazy init: localStorage access is gated so SSR doesn't crash.
  const [completed] = useState<CompletedState>(() => {
    if (typeof window === "undefined") return { ids: [], xp: 0 };
    try {
      const raw = window.localStorage.getItem(QUEST_LS_KEY);
      if (!raw) return { ids: [], xp: 0 };
      const parsed = JSON.parse(raw) as CompletedState;
      if (!Array.isArray(parsed.ids)) return { ids: [], xp: 0 };
      return parsed;
    } catch {
      return { ids: [], xp: 0 };
    }
  });
  const [copied, setCopied] = useState(false);

  const cardContract = CONTRACTS.VET_SBT_CARD;
  const cardReady = isReady(cardContract);

  const badgeContract = CONTRACTS.BADGE_REGISTRY;
  const badgeContractReady = isReady(badgeContract);

  // ─── Card reads (EOA + Smart Account) ─────────────────────────────────
  const { data: cardOnEoa } = useReadContract({
    address: cardContract,
    abi: VET_SBT_CARD_ABI,
    functionName: "cardOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address && cardReady },
  });
  const { data: cardOnSmartAccount } = useReadContract({
    address: cardContract,
    abi: VET_SBT_CARD_ABI,
    functionName: "cardOf",
    args: smartAccount ? [smartAccount] : undefined,
    query: { enabled: !!smartAccount && cardReady },
  });
  const cardHasTokenId = (c: unknown) =>
    !!c && typeof c === "object" && "tokenId" in c && (c as { tokenId: bigint }).tokenId !== 0n;
  const card = cardHasTokenId(cardOnEoa)
    ? cardOnEoa
    : cardHasTokenId(cardOnSmartAccount)
      ? cardOnSmartAccount
      : null;

  // ─── Badge reads (EOA + Smart Account · BadgeRegistry path) ───────────
  // Note: quest verify route now issues EAS BADGE attestations, not
  // BadgeRegistry mints (see B2 refactor in app/api/quests/[id]/verify).
  // BadgeRegistry will return [] for everyone going forward. localStorage
  // is the day-1 source of truth for completed-quest count. Full EAS-
  // attestation listing in profile = Phase 2 work (see docs/INDEXER_SETUP.md).
  const { data: badgesOnEoa } = useReadContract({
    address: badgeContract,
    abi: BADGE_REGISTRY_ABI,
    functionName: "badgesOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address && badgeContractReady },
  });
  const { data: badgesOnSmartAccount } = useReadContract({
    address: badgeContract,
    abi: BADGE_REGISTRY_ABI,
    functionName: "badgesOf",
    args: smartAccount ? [smartAccount] : undefined,
    query: { enabled: !!smartAccount && badgeContractReady },
  });

  const ownedBadgeIds = useMemo<Set<number>>(() => {
    const combined = new Set<number>();
    for (const list of [badgesOnEoa, badgesOnSmartAccount]) {
      if (Array.isArray(list)) {
        for (const id of list as readonly bigint[]) combined.add(Number(id));
      }
    }
    if (combined.size > 0) return combined;
    // Fallback: localStorage so users see progress even before EAS-attestation
    // indexer comes online.
    return new Set(completed.ids);
  }, [badgesOnEoa, badgesOnSmartAccount, completed.ids]);

  const ownedQuests: Quest[] = useMemo(
    () => QUESTS.filter((q) => ownedBadgeIds.has(q.id)),
    [ownedBadgeIds],
  );

  const completionPct =
    (ownedQuests.length / QUESTS.length) * 100;

  const hasCard =
    card &&
    typeof card === "object" &&
    "tokenId" in card &&
    (card as { tokenId: bigint }).tokenId !== 0n;

  if (!ready) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-[var(--color-muted)]">
          กำลังโหลด Privy...
        </CardContent>
      </Card>
    );
  }

  if (!authenticated || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login เพื่อดู profile ของคุณ</CardTitle>
          <CardDescription>
            Profile รวม wallet, Vet SBT Card, Badge collection, และ XP ของคุณ
            ในหน้าเดียว.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={login}>Login</Button>
        </CardFooter>
      </Card>
    );
  }

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  const totalXp = ownedQuests.reduce((sum, q) => sum + q.xp, 0);
  const loginMethods = [
    user?.email && "email",
    user?.google && "google",
    user?.wallet && "wallet",
  ]
    .filter(Boolean)
    .map((m) => String(m));

  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card>
        <CardHeader>
          <Badge tone="brand" className="self-start">
            Your profile
          </Badge>
          <CardTitle className="text-xl">
            {user?.email?.address ||
              user?.google?.email ||
              shortAddress(address)}
          </CardTitle>
          <CardDescription>
            CUVETSMO Web3 profile — {ownedQuests.length} / {QUESTS.length}{" "}
            quests, {totalXp} XP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
              Wallet address
            </p>
            <p className="font-mono text-sm break-all">{address}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={copyAddress}>
                {copied ? "Copied!" : "Copy"}
              </Button>
              <a
                href={explorerUrl(address, "address")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="ghost">
                  View on BaseScan ↗
                </Button>
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat
              label="Total XP"
              value={`${totalXp.toLocaleString()} / ${TOTAL_XP_AVAILABLE.toLocaleString()}`}
            />
            <Stat
              label="Quests done"
              value={`${ownedQuests.length} / ${QUESTS.length}`}
            />
            <Stat
              label="Badges owned"
              value={String(ownedBadgeIds.size)}
            />
            <Stat
              label="Card status"
              value={hasCard ? "Active" : "Not claimed"}
            />
          </div>

          <div className="rounded-lg bg-[var(--color-brand-light)] p-3">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--color-brand)]">
              <span>Overall completion</span>
              <span className="font-mono">{Math.round(completionPct)}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-[var(--color-muted)]">
            Login methods: {loginMethods.join(", ") || "—"}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </CardFooter>
      </Card>

      {/* Card preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vet SBT Card</CardTitle>
          <CardDescription>
            {hasCard
              ? `Token #${(card as { tokenId: bigint }).tokenId.toString()} owned by this wallet.`
              : "ยังไม่ได้ claim — ทำเลยที่ /build/card."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/build/card">
            <Button>{hasCard ? "View card" : "Claim card"}</Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Badge collection</CardTitle>
            <Badge tone="muted">
              {ownedBadgeIds.size} / {QUESTS.length}
            </Badge>
          </div>
          <CardDescription>
            แต่ละ badge = 1 quest. {badgeContractReady ? "On-chain truth via BadgeRegistry." : "Local progress — on-chain badges mint หลัง contract live."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {QUESTS.map((q) => {
              const owned = ownedBadgeIds.has(q.id);
              return (
                <div
                  key={q.id}
                  className={
                    "rounded-lg border p-3 flex flex-col items-center gap-2 text-center " +
                    (owned
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]"
                      : "border-dashed border-[var(--color-border)] bg-[var(--color-bg)] opacity-60")
                  }
                >
                  <span
                    className={
                      "h-9 w-9 rounded-full font-mono text-sm inline-flex items-center justify-center " +
                      (owned
                        ? "bg-[var(--color-brand)] text-white"
                        : "bg-[var(--color-border)] text-[var(--color-muted)]")
                    }
                  >
                    {q.badgeGlyph}
                  </span>
                  <p className="text-xs font-semibold leading-tight">
                    {q.badge}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted)] leading-tight">
                    #{q.id} — {owned ? "Owned" : "Locked"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/learn/quests">
            <Button variant="outline">
              {ownedBadgeIds.size === QUESTS.length
                ? "Replay quests"
                : "Earn more badges"}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
        {label}
      </p>
      <p className="font-mono text-sm">{value}</p>
    </div>
  );
}
