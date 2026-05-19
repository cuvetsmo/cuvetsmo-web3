"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { shortAddress, explorerUrl } from "@/lib/utils";
import {
  CONTRACTS,
  FIRST_STEPS_SBT_ABI,
  isReady,
} from "@/lib/contracts";
import { WhatJustHappened } from "@/components/what-just-happened";

/**
 * Wallet 101 — 5-step wizard
 *   1. Welcome (concept)
 *   2. Login (Privy → embedded wallet auto-creates)
 *   3. Faucet (POST /api/faucet)
 *   4. First Mint (FirstStepsSBT.claim)
 *   5. Congrats
 *
 * Spec: master plan §5.1
 */

const STEPS = ["welcome", "login", "faucet", "mint", "done"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABEL: Record<Step, string> = {
  welcome: "ยินดีต้อนรับ",
  login: "Login + Wallet",
  faucet: "รับ test ETH",
  mint: "Mint ตัวแรก",
  done: "เสร็จแล้ว",
};

export function Wallet101Wizard() {
  const [step, setStep] = useState<Step>("welcome");
  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="grid gap-6 md:gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <ProgressBar step={step} progress={progress} />
        {step === "welcome" && <WelcomeStep onNext={() => setStep("login")} />}
        {step === "login" && <LoginStep onNext={() => setStep("faucet")} />}
        {step === "faucet" && (
          <FaucetStep
            onNext={() => setStep("mint")}
            onBack={() => setStep("login")}
          />
        )}
        {step === "mint" && (
          <MintStep
            onNext={() => setStep("done")}
            onBack={() => setStep("faucet")}
          />
        )}
        {step === "done" && <DoneStep />}
      </div>
      <aside className="md:sticky md:top-24 md:self-start">
        <Sidebar step={step} />
      </aside>
    </div>
  );
}

// ─── Progress header ────────────────────────────────────────────────────
function ProgressBar({ step, progress }: { step: Step; progress: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-[var(--color-muted)]">
        <span>
          Step {STEPS.indexOf(step) + 1} / {STEPS.length} — {STEP_LABEL[step]}
        </span>
        <span className="font-mono">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} label="Wallet 101 progress" />
    </div>
  );
}

// ─── Step 1 — Welcome ──────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <CardHeader>
        <Badge tone="brand" className="self-start">
          ขั้นที่ 1 / 5
        </Badge>
        <CardTitle>Wallet เหมือนบัญชีธนาคารแต่ไม่มีคนกลาง</CardTitle>
        <CardDescription>
          เริ่ม Web3 ด้วยกัน 5 ขั้นภายใน 5 นาที — ไม่ต้องโหลด app, ไม่ต้องเซฟ
          seed phrase วันนี้.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <FeatureBullet
            title="คุณเป็นเจ้าของ"
            body="Private key อยู่กับคุณ ไม่ใช่ธนาคาร."
          />
          <FeatureBullet
            title="ใช้ได้ทั่วโลก"
            body="ทุกเว็บ Web3 ใช้ wallet เดียวกันได้."
          />
          <FeatureBullet
            title="โปร่งใส"
            body="ทุก tx ตรวจได้บน block explorer."
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button size="lg" onClick={onNext}>
          เริ่มเลย
        </Button>
        <span className="text-xs text-[var(--color-muted)]">
          ทุก asset ในนี้เป็น testnet มูลค่า 0 บาท
        </span>
      </CardFooter>
    </Card>
  );
}

function FeatureBullet({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <p className="text-sm font-semibold mb-1">{title}</p>
      <p className="text-xs leading-relaxed text-[var(--color-muted)]">
        {body}
      </p>
    </div>
  );
}

// ─── Step 2 — Login + embedded wallet ──────────────────────────────────
function LoginStep({ onNext }: { onNext: () => void }) {
  const { ready, authenticated, login, user } = usePrivy();
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const address = embedded?.address ?? user?.wallet?.address;

  return (
    <Card>
      <CardHeader>
        <Badge tone="brand" className="self-start">
          ขั้นที่ 2 / 5
        </Badge>
        <CardTitle>Login แล้วได้ wallet ฟรี</CardTitle>
        <CardDescription>
          กรอก email หรือ login Google. Privy จะสร้าง embedded wallet ให้คุณ
          อัตโนมัติ — ไม่ต้องโหลด MetaMask.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!ready && (
          <div className="rounded-lg bg-[var(--color-brand-light)] p-3 text-sm text-[var(--color-brand)]">
            กำลังเตรียม Privy...
          </div>
        )}
        {ready && !authenticated && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" onClick={login}>
              Login ด้วย email หรือ Google
            </Button>
            <p className="text-xs text-[var(--color-muted)] max-w-xs">
              ใช้ chula email ก็ได้ — ในขั้นถัดไปจะมีให้ verify Vet SBT Card.
            </p>
          </div>
        )}
        {ready && authenticated && address && (
          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
                Your wallet address
              </p>
              <p className="font-mono text-sm break-all">{address}</p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Address นี้เปิดเผยได้ — เหมือนเลขบัญชี. แต่ private key ใต้
                address ห้ามให้ใคร.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          disabled={!authenticated || !address}
          onClick={onNext}
          size="lg"
        >
          ขั้นถัดไป → รับ test ETH
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Step 3 — Faucet drip ──────────────────────────────────────────────
type FaucetResult =
  | { ok: true; txHash: string; explorerUrl: string }
  | { ok: false; message: string; fallback?: string };

function FaucetStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const address = embedded?.address;

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<FaucetResult | null>(null);
  const [wjhOpen, setWjhOpen] = useState(false);

  async function drip() {
    if (!address) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          ok: true,
          txHash: data.txHash,
          explorerUrl: data.explorerUrl,
        });
        setStatus("success");
      } else {
        setResult({
          ok: false,
          message: data.message || data.error || "Faucet failed",
          fallback: data.fallbackFaucet,
        });
        setStatus("error");
      }
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Network error",
      });
      setStatus("error");
    }
  }

  return (
    <Card>
      <CardHeader>
        <Badge tone="brand" className="self-start">
          ขั้นที่ 3 / 5
        </Badge>
        <CardTitle>รับ test ETH 0.001 ETH</CardTitle>
        <CardDescription>
          test ETH ใช้สำหรับจ่าย gas บน Base Sepolia. ไม่มีมูลค่าจริง —
          เอาไว้ฝึก mint, transfer, swap.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!address && (
          <p className="text-sm text-[var(--color-muted)]">
            ยังไม่มี wallet — กลับไป step 2 ก่อน.
          </p>
        )}

        {status === "idle" && address && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" onClick={drip}>
              Drip 0.001 ETH ให้ wallet
            </Button>
            <span className="text-xs text-[var(--color-muted)]">
              จะส่งจาก server wallet ของ CUVETSMO ไปที่ address ของคุณ.
            </span>
          </div>
        )}

        {status === "loading" && (
          <div className="rounded-lg bg-[var(--color-brand-light)] p-3 text-sm text-[var(--color-brand)]">
            กำลังส่ง drip txn ไปที่ wallet ของคุณ...
          </div>
        )}

        {status === "success" && result?.ok && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700 mb-1">
              สำเร็จ — 0.001 ETH ถูกส่งไปแล้ว
            </p>
            <p className="text-xs font-mono break-all text-emerald-800 mb-2">
              {result.txHash}
            </p>
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-brand)] underline"
            >
              ดูบน BaseScan ↗
            </a>
          </div>
        )}

        {status === "error" && result && !result.ok && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
            <p className="text-sm font-semibold text-amber-800">
              Server faucet ยังไม่พร้อม
            </p>
            <p className="text-xs text-amber-700">{result.message}</p>
            {result.fallback && (
              <a
                href={result.fallback}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs underline text-[var(--color-brand)]"
              >
                ใช้ Coinbase public faucet ↗
              </a>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack}>
          ย้อนกลับ
        </Button>
        {status === "error" && (
          <Button variant="outline" onClick={drip}>
            ลองใหม่
          </Button>
        )}
        <Button
          disabled={status !== "success" && status !== "error"}
          onClick={onNext}
        >
          ขั้นถัดไป → Mint ตัวแรก
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Step 4 — First mint (FirstStepsSBT.claim) ─────────────────────────
function MintStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const contract = CONTRACTS.FIRST_STEPS_SBT;
  const ready = isReady(contract);
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const address = embedded?.address;

  const {
    writeContract,
    data: txHash,
    isPending: writing,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  function claim() {
    if (!ready) return;
    reset();
    writeContract({
      address: contract,
      abi: FIRST_STEPS_SBT_ABI,
      functionName: "claim",
      args: [],
    });
  }

  const showReady = ready;
  const showStub = !ready;

  return (
    <Card>
      <CardHeader>
        <Badge tone="brand" className="self-start">
          ขั้นที่ 4 / 5
        </Badge>
        <CardTitle>Mint Soulbound ตัวแรก</CardTitle>
        <CardDescription>
          claim FirstSteps SBT — Soulbound = ย้ายไป wallet อื่นไม่ได้, ใช้แสดง
          milestone ว่าคุณเริ่ม Web3 แล้ว.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {showStub && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm">
            <p className="font-semibold mb-1">Contract กำลังจะ deploy</p>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              FirstStepsSBT ยังไม่ deploy บน Base Sepolia. ขั้นนี้จะ stub —
              กดข้ามไปก่อนได้ แล้วกลับมา claim หลัง Agent A ลง contract.
            </p>
          </div>
        )}

        {showReady && !writing && !txHash && (
          <div className="space-y-3">
            <p className="text-sm">
              Wallet: <span className="font-mono">{shortAddress(address)}</span>
            </p>
            <Button size="lg" onClick={claim} disabled={!address}>
              Claim FirstSteps SBT
            </Button>
          </div>
        )}

        {writing && (
          <div className="rounded-lg bg-[var(--color-brand-light)] p-3 text-sm text-[var(--color-brand)]">
            รอ confirm ใน wallet popup...
          </div>
        )}

        {confirming && txHash && (
          <div className="rounded-lg bg-[var(--color-brand-light)] p-3 text-sm text-[var(--color-brand)]">
            กำลังรอ block confirm — {shortAddress(txHash)}
          </div>
        )}

        {confirmed && txHash && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700 mb-1">
              Mint สำเร็จ
            </p>
            <a
              href={explorerUrl(txHash, "tx")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-brand)] underline"
            >
              ดู tx บน BaseScan ↗
            </a>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            {error.message}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack}>
          ย้อนกลับ
        </Button>
        <Button
          onClick={onNext}
          disabled={showReady && !confirmed && !error}
        >
          {showReady ? "ขั้นถัดไป → เสร็จ" : "ข้ามไปก่อน"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Step 5 — Done ─────────────────────────────────────────────────────
function DoneStep() {
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const address = embedded?.address;

  return (
    <Card>
      <CardHeader>
        <Badge tone="success" className="self-start">
          ยินดีด้วย
        </Badge>
        <CardTitle>คุณเข้า Web3 แล้ว</CardTitle>
        <CardDescription>
          มี wallet, มี test ETH, mint SBT ตัวแรกแล้ว. ก้าวต่อไปได้เลย.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {address && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
              Your wallet
            </p>
            <p className="font-mono break-all">{address}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href="/learn/quests">
          <Button size="lg">ไปต่อที่ Web3 Quests</Button>
        </Link>
        <Link href="/build/card">
          <Button variant="outline" size="lg">
            Claim Vet SBT Card
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// ─── Educational sidebar ───────────────────────────────────────────────
function Sidebar({ step }: { step: Step }) {
  const content = useMemo<{ title: string; lines: string[] }>(() => {
    switch (step) {
      case "welcome":
        return {
          title: "What is a wallet?",
          lines: [
            "Wallet = pair ของ public address + private key.",
            "Address แชร์ได้ — private key ห้ามให้ใคร.",
            "ทุก dApp ใช้ wallet เดียวกันได้.",
          ],
        };
      case "login":
        return {
          title: "Embedded wallet คืออะไร?",
          lines: [
            "Privy เก็บ key แบบ Shamir split + MPC.",
            "ไม่ต้องโหลด MetaMask, ไม่ต้องจำ seed.",
            "ยังเป็น wallet ของคุณ — เปิด export key ได้ทีหลัง.",
          ],
        };
      case "faucet":
        return {
          title: "ทำไมต้องมี ETH?",
          lines: [
            "ETH = น้ำมันของ blockchain. ทุก tx ใช้ gas.",
            "Base Sepolia ETH ไม่มีมูลค่าจริง — ใช้ฝึกฟรี.",
            "1 drip = 0.001 ETH ≈ 50+ ครั้งของ test mint.",
          ],
        };
      case "mint":
        return {
          title: "SBT vs NFT?",
          lines: [
            "NFT ย้ายได้ — ของสะสมที่ขายต่อได้.",
            "SBT = Soulbound, ผูกกับ wallet ตลอด.",
            "ใช้แสดงตัวตน เช่น degree, attendance, badge.",
          ],
        };
      case "done":
        return {
          title: "Next steps",
          lines: [
            "Quests: ทำ 10 ภารกิจ ได้ 10 badges.",
            "Vet SBT Card: ออก credential นิสิตจุฬาฯ.",
            "Profile: โชว์ collection ของคุณ.",
          ],
        };
    }
  }, [step]);

  return (
    <Card>
      <CardHeader>
        <CardDescription className="uppercase tracking-wide text-xs">
          What is...
        </CardDescription>
        <CardTitle className="text-base">{content.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {content.lines.map((line) => (
            <li
              key={line}
              className="flex gap-2 text-[var(--color-muted)] leading-relaxed"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand)]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
