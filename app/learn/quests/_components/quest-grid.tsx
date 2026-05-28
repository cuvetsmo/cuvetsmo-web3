"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
// useEffect still used by the modal for ESC keybinding below.
import { usePrivy, useWallets, type ConnectedWallet } from "@privy-io/react-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  QUESTS,
  TIER_LABEL,
  TIER_ORDER,
  TOTAL_XP_AVAILABLE,
  SIGNATURE_VERIFIED_KINDS,
  questSignChallenge,
  type Quest,
} from "@/lib/quests";
import { cn, explorerUrl } from "@/lib/utils";
import { fireConfetti } from "@/lib/confetti";

const LS_KEY = "cuvetsmo:quests:completed:v1";

interface CompletedState {
  ids: number[];
  xp: number;
}

function readCompleted(): CompletedState {
  if (typeof window === "undefined") return { ids: [], xp: 0 };
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return { ids: [], xp: 0 };
    const parsed = JSON.parse(raw) as CompletedState;
    if (!Array.isArray(parsed.ids)) return { ids: [], xp: 0 };
    return parsed;
  } catch {
    return { ids: [], xp: 0 };
  }
}

function writeCompleted(state: CompletedState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function QuestGrid() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const address = embedded?.address;

  // SSR-safe lazy init: readCompleted() guards on `typeof window`.
  const [completed, setCompleted] = useState<CompletedState>(() =>
    readCompleted(),
  );
  const [open, setOpen] = useState<Quest | null>(null);

  const markComplete = useCallback(
    (q: Quest) => {
      setCompleted((prev) => {
        if (prev.ids.includes(q.id)) return prev;
        const next: CompletedState = {
          ids: [...prev.ids, q.id],
          xp: prev.xp + q.xp,
        };
        writeCompleted(next);
        return next;
      });
    },
    [],
  );

  const sorted = useMemo(
    () =>
      [...QUESTS].sort(
        (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.id - b.id,
      ),
    [],
  );

  const percent = (completed.xp / TOTAL_XP_AVAILABLE) * 100;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardDescription className="uppercase tracking-wide text-xs">
            Your XP
          </CardDescription>
          <CardTitle className="font-mono text-2xl">
            {completed.xp.toLocaleString()} / {TOTAL_XP_AVAILABLE.toLocaleString()} XP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={percent} label="Quest XP" />
          <p className="text-xs text-[var(--color-muted)]">
            ทำ quest ทั้ง {QUESTS.length} ครบ = unlock leaderboard. (เร็วๆ นี้)
          </p>
          {!authenticated && (
            <Button onClick={login} size="sm" variant="outline">
              Login ก่อนเริ่ม quest
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((q) => (
          <QuestCard
            key={q.id}
            quest={q}
            done={completed.ids.includes(q.id)}
            onOpen={() => setOpen(q)}
          />
        ))}
      </div>

      {open && (
        <QuestDetailModal
          quest={open}
          onClose={() => setOpen(null)}
          onComplete={markComplete}
          done={completed.ids.includes(open.id)}
          authenticated={authenticated}
          login={login}
          userAddress={address}
          wallet={embedded}
        />
      )}
    </div>
  );
}

function QuestCard({
  quest,
  done,
  onOpen,
}: {
  quest: Quest;
  done: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] rounded-xl",
      )}
    >
      <Card
        className={cn(
          "h-full cursor-pointer",
          done && "border-emerald-400",
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <Badge tone={done ? "success" : "brand"}>
              {done ? "Done" : `+${quest.xp} XP`}
            </Badge>
            <Badge tone="muted">{TIER_LABEL[quest.tier]}</Badge>
          </div>
          <CardTitle className="text-base mt-2 leading-snug">
            {quest.title}
          </CardTitle>
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            {quest.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            {quest.blurb}
          </p>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-[var(--color-muted)]">
          <BadgePreview quest={quest} small />
          <span className="ml-auto">Tap to start →</span>
        </CardFooter>
      </Card>
    </button>
  );
}

function BadgePreview({ quest, small }: { quest: Quest; small?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] font-medium",
        small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      )}
    >
      <span
        className={cn(
          "rounded-full bg-[var(--color-brand)] text-white font-mono",
          small ? "h-4 w-4 text-[9px]" : "h-5 w-5 text-xs",
          "inline-flex items-center justify-center",
        )}
      >
        {quest.badgeGlyph}
      </span>
      <span>{quest.badge}</span>
    </span>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────
type VerifyState =
  | { phase: "idle" }
  | { phase: "loading" }
  | {
      phase: "success";
      payload: {
        badge: string;
        xp: number;
        mintTxHash?: string;
        explorerUrl?: string;
        mintPending?: boolean;
        attestation?: {
          schemaUid: string;
          attester: string;
          userOpHash: string;
          txHash: string;
          easExplorerUrl: string;
        };
      };
    }
  | { phase: "error"; message: string };

function QuestDetailModal({
  quest,
  onClose,
  onComplete,
  done,
  authenticated,
  login,
  userAddress,
  wallet,
}: {
  quest: Quest;
  onClose: () => void;
  onComplete: (q: Quest) => void;
  done: boolean;
  authenticated: boolean;
  login: () => void;
  userAddress: string | undefined;
  wallet: ConnectedWallet | undefined;
}) {
  const [txHash, setTxHash] = useState("");
  const [state, setState] = useState<VerifyState>({ phase: "idle" });

  const needsTx =
    quest.kind === "mint" ||
    quest.kind === "transfer" ||
    quest.kind === "approve" ||
    quest.kind === "read";

  // No on-chain artifact → must prove completion with a wallet signature.
  const needsSignature = SIGNATURE_VERIFIED_KINDS.has(quest.kind);

  async function verify() {
    if (!userAddress) {
      login();
      return;
    }
    setState({ phase: "loading" });
    try {
      // Signature-verified kinds (sign/vote/connect/auto) have no on-chain
      // tx — the user must actively sign a quest-specific challenge so the
      // server can verify wallet ownership + intent. This is the action.
      let signature: string | undefined;
      if (needsSignature) {
        if (!wallet) {
          setState({
            phase: "error",
            message: "Wallet not ready — reconnect and try again.",
          });
          return;
        }
        try {
          const provider = await wallet.getEthereumProvider();
          const challenge = questSignChallenge(quest.id, userAddress);
          signature = (await provider.request({
            method: "personal_sign",
            params: [challenge, userAddress],
          })) as string;
        } catch {
          setState({
            phase: "error",
            message: "คุณต้องเซ็นข้อความใน wallet เพื่อยืนยัน quest นี้.",
          });
          return;
        }
      }

      const res = await fetch(`/api/quests/${quest.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress,
          txHash: needsTx ? txHash : undefined,
          signature,
        }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setState({
          phase: "success",
          payload: {
            badge: data.badge,
            xp: data.xp,
            mintTxHash: data.mintTxHash,
            explorerUrl: data.explorerUrl,
            mintPending: !!data.mintPending,
            attestation: data.attestation,
          },
        });
        onComplete(quest);
        // 🎉 celebrate the completion · no-op under reduce-motion
        fireConfetti();
      } else {
        setState({
          phase: "error",
          message: data.error || data.message || "Verification failed",
        });
      }
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`quest-${quest.id}-title`}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge tone="brand">Quest #{quest.id}</Badge>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-[var(--color-muted)] hover:text-[var(--color-text)] text-xl leading-none"
              >
                ×
              </button>
            </div>
            <CardTitle id={`quest-${quest.id}-title`} className="mt-2">
              {quest.title}
            </CardTitle>
            <CardDescription>{quest.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Section title="Concept">
              <p>{quest.concept}</p>
            </Section>
            <Section title="Task">
              <p>{quest.task}</p>
            </Section>
            <Section title="Badge">
              <BadgePreview quest={quest} />
            </Section>

            {needsTx && (
              <div className="space-y-2">
                <label
                  htmlFor={`tx-${quest.id}`}
                  className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
                >
                  Tx hash
                </label>
                <input
                  id={`tx-${quest.id}`}
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value.trim())}
                  placeholder="0x..."
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
                <p className="text-xs text-[var(--color-muted)]">
                  {quest.verifyHint}
                </p>
              </div>
            )}

            {state.phase === "loading" && (
              <div className="rounded-lg bg-[var(--color-brand-light)] p-3 text-sm text-[var(--color-brand)]">
                กำลังตรวจสอบ on-chain...
              </div>
            )}
            {state.phase === "success" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
                <p className="font-semibold text-emerald-700">
                  Quest complete · +{state.payload.xp} XP
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Badge: {state.payload.badge}
                </p>
                {state.payload.mintPending && (
                  <p className="text-xs text-emerald-700 mt-2">
                    Badge attestation pending — env not yet configured. XP
                    บันทึกแล้ว · attestation จะ issue เมื่อ admin set EAS_ATTESTER_PRIVATE_KEY.
                  </p>
                )}
                {state.payload.attestation && (
                  <div className="mt-3 rounded-md bg-white/70 border border-emerald-200 p-2 text-[11px] space-y-1">
                    <p className="text-emerald-800">
                      <span className="text-emerald-600">⛓️ Attested on EAS:</span>{" "}
                      <a
                        href={state.payload.attestation.easExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-mono"
                      >
                        view on easscan.org ↗
                      </a>
                    </p>
                    <p className="text-emerald-800">
                      <span className="text-emerald-600">Attester:</span>{" "}
                      <span className="font-mono">
                        {state.payload.attestation.attester.slice(0, 6)}…
                        {state.payload.attestation.attester.slice(-4)}
                      </span>{" "}
                      <span className="text-emerald-600">· gas:</span>{" "}
                      <span className="font-mono">$0 (Pimlico)</span>
                    </p>
                  </div>
                )}
                {state.payload.mintTxHash && (
                  <a
                    href={
                      state.payload.explorerUrl ||
                      explorerUrl(state.payload.mintTxHash, "tx")
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs underline text-[var(--color-brand)]"
                  >
                    ดู tx บน BaseScan ↗
                  </a>
                )}
              </div>
            )}
            {state.phase === "error" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                {state.message}
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!authenticated ? (
              <Button onClick={login}>Login ก่อน verify</Button>
            ) : done && state.phase === "idle" ? (
              <Button variant="outline" disabled>
                เสร็จแล้ว
              </Button>
            ) : (
              <Button onClick={verify} disabled={state.phase === "loading"}>
                {state.phase === "loading"
                  ? "Verifying..."
                  : needsSignature
                    ? "เซ็น + Verify"
                    : "Verify quest"}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              ปิด
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-1">
        {title}
      </p>
      <div className="text-sm text-[var(--color-text)] leading-relaxed">
        {children}
      </div>
    </div>
  );
}
