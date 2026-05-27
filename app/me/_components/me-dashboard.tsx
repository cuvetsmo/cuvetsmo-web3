"use client";

/**
 * /me Dashboard · single-glance overview of the user's CUVETSMO Web3 state.
 *
 * Renders 3 modes:
 *   1. Loading · waiting for Privy ready
 *   2. Logged out · big Connect CTA + 3 example/teaser cards
 *   3. Logged in · greeting + wallet + 4 stat cards + 3 quick actions
 *
 * Uses the same dual-address pattern as ProfilePanel · reads Vet SBT Card
 * from BOTH EOA and Smart Account because gasless mints (C2 path) land on
 * Smart Account, while direct wagmi mints land on EOA. Without checking
 * both we'd miss assets minted via the other gas path.
 *
 * Activity timeline (last 5 txs) deferred to Phase 5+ when the Goldsky
 * subgraph is live · until then we surface quest XP from localStorage
 * (same key the QuestGrid writes to) so users see meaningful state
 * immediately rather than empty zeros.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useReadContract } from "wagmi";

import { Reveal } from "@/app/(marketing)/_components/reveal";
import { NumberTicker } from "@/app/(marketing)/_components/number-ticker";
import { useUserAddresses } from "@/lib/use-user-addresses";
import {
  CONTRACTS,
  VET_SBT_CARD_ABI,
  isReady,
} from "@/lib/contracts";
import { shortAddress, explorerUrl } from "@/lib/utils";
import { QUESTS, TOTAL_XP_AVAILABLE } from "@/lib/quests";

const QUEST_LS_KEY = "cuvetsmo:quests:completed:v1";

interface CompletedState {
  ids: number[];
  xp: number;
}

function readCompleted(): CompletedState {
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
}

export function MeDashboard() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { eoa, smartAccount, smartAccountResolved } = useUserAddresses();
  const [completed, setCompleted] = useState<CompletedState>({ ids: [], xp: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCompleted(readCompleted());
  }, []);

  // Dual-address VetSBTCard read · same pattern as ProfilePanel
  const cardAddr = CONTRACTS.VET_SBT_CARD;
  const cardReady = isReady(cardAddr);

  const { data: cardOnEoa } = useReadContract({
    address: cardAddr,
    abi: VET_SBT_CARD_ABI,
    functionName: "cardOf",
    args: eoa ? [eoa] : undefined,
    query: { enabled: !!eoa && cardReady },
  });
  const { data: cardOnSmartAccount } = useReadContract({
    address: cardAddr,
    abi: VET_SBT_CARD_ABI,
    functionName: "cardOf",
    args: smartAccount ? [smartAccount] : undefined,
    query: { enabled: !!smartAccount && cardReady },
  });
  const cardHasTokenId = (c: unknown): c is { tokenId: bigint } =>
    !!c && typeof c === "object" && "tokenId" in c && (c as { tokenId: bigint }).tokenId !== 0n;
  const card = cardHasTokenId(cardOnEoa)
    ? cardOnEoa
    : cardHasTokenId(cardOnSmartAccount)
      ? cardOnSmartAccount
      : null;

  // ─── Mode 1: loading ────────────────────────────────────────────────
  if (!mounted || !ready) {
    return (
      <main>
        <section className="relative overflow-hidden cloud-bg">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
            <p className="text-sm text-[var(--color-muted)]">
              Loading dashboard …
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ─── Mode 2: logged out ─────────────────────────────────────────────
  if (!authenticated) {
    return (
      <main>
        <section className="relative overflow-hidden cloud-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-12 text-center">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-3">
                /me · Your dashboard
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 max-w-3xl mx-auto">
                Connect wallet to see{" "}
                <span className="text-[var(--color-brand)]">your stuff</span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-2xl mx-auto mb-8 leading-relaxed">
                Vet SBT Card · Quest progress · XP · Badges · activity history ·
                all in one glance · gasless mint via Privy + Pimlico
              </p>
              <button
                type="button"
                onClick={() => login()}
                className="btn-brand text-base px-6 py-3"
              >
                Connect Wallet
              </button>
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                เข้าด้วย Email · Google · Discord — เราจะสร้าง Smart Account ให้
              </p>
            </Reveal>
          </div>
        </section>

        {/* Teaser cards · 3 things you can do once connected */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold mb-4 text-center">
              สิ่งที่จะอยู่ในนี้
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                emoji: "🪪",
                title: "Vet SBT Card",
                blurb: "Soulbound credential · ผูกกับ @chula.ac.th",
                href: "/build/card",
              },
              {
                emoji: "🏆",
                title: "Quest Progress",
                blurb: "10 quests · 1000 XP · EAS badge ต่อ quest",
                href: "/learn/quests",
              },
              {
                emoji: "🧪",
                title: "Lab Creations",
                blurb: "Token · NFT · DAO ที่คุณ deploy เอง",
                href: "/lab",
              },
            ].map((t, i) => (
              <Reveal key={t.title} delay={i * 80}>
                <Link
                  href={t.href}
                  className="card hover:border-[var(--color-brand)] hover:-translate-y-0.5 transition-all opacity-60 hover:opacity-100 h-full block"
                >
                  <div className="text-3xl mb-3 leading-none">{t.emoji}</div>
                  <h3 className="font-bold text-base mb-1">{t.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                    {t.blurb}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // ─── Mode 3: logged in · full dashboard ─────────────────────────────
  const xpPct = Math.round((completed.xp / TOTAL_XP_AVAILABLE) * 100);
  const questsLeft = QUESTS.length - completed.ids.length;
  const displayName =
    (user?.email?.address && user.email.address.split("@")[0]) ||
    (user?.google?.email && user.google.email.split("@")[0]) ||
    "Vet 86+";

  return (
    <main>
      {/* Hero · greeting + wallet pills */}
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              /me · Your dashboard
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              สวัสดี · {displayName}
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-muted)] mb-5">
              อยู่ใน CUVETSMO Web3 · Base Sepolia testnet
            </p>

            {/* Wallet pills · EOA + Smart Account */}
            <div className="flex flex-wrap gap-2.5">
              {eoa && (
                <WalletPill
                  label="EOA · Privy"
                  address={eoa}
                  tone="sky"
                />
              )}
              {smartAccount && (
                <WalletPill
                  label="Smart Account"
                  address={smartAccount}
                  tone="emerald"
                />
              )}
              {!smartAccount && smartAccountResolved === false && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-xs text-[var(--color-muted)]">
                  Resolving Smart Account …
                </span>
              )}
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-rose-400 hover:text-rose-600 text-xs text-[var(--color-muted)] transition-colors"
              >
                Sign out
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* 4-card stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <Reveal delay={0}>
            <StatCard
              label="Vet SBT Card"
              value={card ? `#${card.tokenId}` : "—"}
              hint={card ? "Claimed ✓" : "ยังไม่มี"}
              accent="from-sky-100/40 to-cyan-50/20"
              border="border-sky-200/50"
              emoji="🪪"
            />
          </Reveal>
          <Reveal delay={60}>
            <StatCard
              label="Quest XP"
              value={`${completed.xp}`}
              numeric={completed.xp}
              hint={`/${TOTAL_XP_AVAILABLE} · ${xpPct}%`}
              accent="from-emerald-100/40 to-teal-50/20"
              border="border-emerald-200/50"
              emoji="🏆"
            />
          </Reveal>
          <Reveal delay={120}>
            <StatCard
              label="Quests done"
              value={`${completed.ids.length}`}
              numeric={completed.ids.length}
              hint={`/${QUESTS.length} · ${questsLeft} เหลือ`}
              accent="from-purple-100/40 to-violet-50/20"
              border="border-purple-200/50"
              emoji="⛓️"
            />
          </Reveal>
          <Reveal delay={180}>
            <StatCard
              label="Lab assets"
              value="0"
              numeric={0}
              hint="indexer ใน Phase 1"
              accent="from-amber-100/40 to-yellow-50/20"
              border="border-amber-200/50"
              emoji="🧪"
            />
          </Reveal>
        </div>

        {/* Quest progress bar · prominent */}
        <Reveal>
          <section className="card mb-8">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <h2 className="font-bold text-lg">Quest progress</h2>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  {completed.ids.length} จาก {QUESTS.length} · {completed.xp} จาก {TOTAL_XP_AVAILABLE} XP
                </p>
              </div>
              <Link
                href="/learn/quests"
                className="text-sm font-medium text-[var(--color-brand)] hover:underline"
              >
                ทำต่อ →
              </Link>
            </div>
            <div className="h-3 rounded-full bg-[var(--color-border)]/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </section>
        </Reveal>

        {/* Vet SBT Card preview · big card */}
        <Reveal delay={80}>
          <section className="mb-8">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-bold text-lg">Vet SBT Card</h2>
              <Link
                href="/build/card"
                className="text-sm font-medium text-[var(--color-brand)] hover:underline"
              >
                {card ? "ดู card →" : "Claim →"}
              </Link>
            </div>

            {card ? (
              <article
                className="rounded-2xl p-6 sm:p-8 border h-44 flex flex-col justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%)",
                  borderColor: "rgba(255,255,255,0.12)",
                  color: "white",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.18em] text-sky-200 mb-1">
                      CUVETSMO · WEB3
                    </p>
                    <p className="text-lg font-bold">VET SBT CARD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] tracking-[0.18em] text-sky-200 mb-1">
                      TOKEN
                    </p>
                    <p className="text-lg font-mono">#{String(card.tokenId).padStart(4, "0")}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-sky-200 mb-0.5">
                    BASE · SOULBOUND · CHAIN 84532
                  </p>
                </div>
              </article>
            ) : (
              <article className="rounded-2xl p-6 sm:p-8 border border-dashed border-[var(--color-border)] bg-[var(--color-card)] h-44 flex flex-col items-center justify-center text-center gap-3">
                <span aria-hidden className="text-4xl leading-none">
                  🪪
                </span>
                <div>
                  <p className="font-bold text-base">ยังไม่ได้ claim Vet SBT Card</p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Soulbound · ผูกกับอีเมล @chula.ac.th · gasless
                  </p>
                </div>
                <Link href="/build/card" className="btn-brand text-sm">
                  Claim now →
                </Link>
              </article>
            )}
          </section>
        </Reveal>

        {/* Quick actions row */}
        <Reveal delay={160}>
          <section>
            <h2 className="font-bold text-lg mb-3">Quick actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { emoji: "🎨", title: "Mint NFT", href: "/play/mint", hint: "Sandbox" },
                { emoji: "📝", title: "Sign Board", href: "/play/board", hint: "Permanent" },
                { emoji: "🪙", title: "Token Forge", href: "/lab/token-forge", hint: "Deploy ERC-20" },
                { emoji: "🎖️", title: "SBT Maker", href: "/lab/sbt-maker", hint: "Non-transferable" },
              ].map((a, i) => (
                <Reveal key={a.title} delay={i * 60}>
                  <Link
                    href={a.href}
                    className="group card hover:border-[var(--color-brand)] hover:-translate-y-0.5 transition-all h-full flex flex-col items-start gap-2 block"
                  >
                    <span aria-hidden className="text-2xl leading-none group-hover:scale-110 transition-transform">
                      {a.emoji}
                    </span>
                    <h3 className="font-bold text-sm">{a.title}</h3>
                    <span className="text-[11px] text-[var(--color-muted)]">
                      {a.hint}
                    </span>
                    <span className="mt-auto text-xs font-medium text-[var(--color-brand)] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      เปิด <span aria-hidden>→</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Pillar shortcuts · footer */}
        <Reveal delay={240}>
          <section className="mt-10 grid sm:grid-cols-4 gap-3 text-center text-sm">
            <Link href="/learn" className="rounded-lg px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors">
              📚 Learn hub
            </Link>
            <Link href="/play" className="rounded-lg px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors">
              🎮 Play hub
            </Link>
            <Link href="/build" className="rounded-lg px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors">
              🛠️ Build hub
            </Link>
            <Link href="/lab" className="rounded-lg px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors">
              🧪 Lab hub
            </Link>
          </section>
        </Reveal>
      </div>
    </main>
  );
}

/* ─── Small components ─────────────────────────────────────────────── */

function WalletPill({
  label,
  address,
  tone,
}: {
  label: string;
  address: string;
  tone: "sky" | "emerald";
}) {
  const toneCss = {
    sky: "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-900/30 dark:border-sky-700/40 dark:text-sky-300",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700/40 dark:text-emerald-300",
  }[tone];
  return (
    <a
      href={explorerUrl(address, "address")}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs hover:opacity-90 transition-opacity ${toneCss}`}
    >
      <span className="font-semibold not-italic font-sans">{label}</span>
      <span>·</span>
      <span>{shortAddress(address)}</span>
      <span aria-hidden>↗</span>
    </a>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
  border,
  emoji,
  numeric,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
  border: string;
  emoji: string;
  /** Optional · if set, animates count-up from 0 to numeric value */
  numeric?: number;
}) {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${accent} border ${border} h-full`}
    >
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {label}
        </p>
        <span aria-hidden className="text-xl leading-none">
          {emoji}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)] tabular-nums">
        {numeric !== undefined ? (
          <NumberTicker value={numeric} duration={1200} startOnMount />
        ) : (
          value
        )}
      </p>
      <p className="text-[11px] text-[var(--color-muted)] mt-1">
        {hint}
      </p>
    </div>
  );
}
