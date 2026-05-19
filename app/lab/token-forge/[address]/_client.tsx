"use client";

import { useState } from "react";
import Link from "next/link";
import { formatUnits, isAddress as viemIsAddress, parseUnits } from "viem";
import { useAccount, useReadContracts, useWriteContract } from "wagmi";
import { TOKEN_IMPLEMENTATION_ABI } from "../../_lib/abis";
import { useDeployTracker } from "../../_lib/use-deploy-tracker";
import { DeployProgress } from "../../_components/deploy-progress";
import { ConnectGate } from "../../_components/connect-gate";
import { Field, Input } from "../../_components/form-field";
import { Button } from "@/components/ui/button";
import { explorerUrl, shortAddress } from "@/lib/utils";

export function TokenPageClient({ address }: { address: `0x${string}` }) {
  const { address: account } = useAccount();
  const { data, refetch } = useReadContracts({
    contracts: [
      { address, abi: TOKEN_IMPLEMENTATION_ABI, functionName: "name" },
      { address, abi: TOKEN_IMPLEMENTATION_ABI, functionName: "symbol" },
      { address, abi: TOKEN_IMPLEMENTATION_ABI, functionName: "decimals" },
      { address, abi: TOKEN_IMPLEMENTATION_ABI, functionName: "totalSupply" },
      { address, abi: TOKEN_IMPLEMENTATION_ABI, functionName: "owner" },
      account
        ? {
            address,
            abi: TOKEN_IMPLEMENTATION_ABI,
            functionName: "balanceOf",
            args: [account],
          }
        : {
            address,
            abi: TOKEN_IMPLEMENTATION_ABI,
            functionName: "totalSupply",
          },
    ],
  });

  const name = data?.[0]?.result as string | undefined;
  const symbol = data?.[1]?.result as string | undefined;
  const decimals = (data?.[2]?.result as number | undefined) ?? 18;
  const totalSupply = data?.[3]?.result as bigint | undefined;
  const owner = data?.[4]?.result as `0x${string}` | undefined;
  const balance = account ? (data?.[5]?.result as bigint | undefined) : 0n;

  const contractFound = !!name && !!symbol;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <Link
        href="/lab/token-forge"
        className="inline-block text-sm text-[var(--color-brand)] hover:underline mb-4"
      >
        ← back to Token Forge
      </Link>

      {!contractFound ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center">
          <p className="text-base font-medium mb-1">
            กำลังโหลด token data...
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            ถ้าโหลดนานเกิน 30 วินาทีอาจเป็นเพราะ contract ไม่มีจริง หรือยัง
            ไม่ได้ index บน RPC public
          </p>
          <p className="mt-3 font-mono text-xs text-[var(--color-muted)] break-all">
            {address}
          </p>
        </div>
      ) : (
        <>
          <header className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
              {name} <span className="text-[var(--color-muted)]">({symbol})</span>
            </h2>
            <p className="text-sm text-[var(--color-muted)] flex items-center gap-2">
              <span className="font-mono">{shortAddress(address)}</span>
              <a
                href={explorerUrl(address, "address")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-brand)] hover:underline"
              >
                ↗ BaseScan
              </a>
            </p>
          </header>

          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            <StatCard
              label="Total Supply"
              value={
                totalSupply
                  ? formatUnits(totalSupply, decimals).replace(
                      /\.?0+$/,
                      "",
                    ) +
                    " " +
                    symbol
                  : "—"
              }
            />
            <StatCard
              label="Your balance"
              value={
                account
                  ? balance
                    ? formatUnits(balance, decimals).replace(/\.?0+$/, "") +
                      " " +
                      symbol
                    : "0 " + symbol
                  : "(connect wallet)"
              }
            />
            <StatCard
              label="Owner"
              mono
              value={owner ? shortAddress(owner) : "—"}
            />
          </div>

          <TransferCard
            tokenAddress={address}
            symbol={symbol!}
            decimals={decimals}
            balance={balance ?? 0n}
            onSuccess={refetch}
          />

          <ShareCard address={address} symbol={symbol!} />
        </>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-muted)] mb-0.5">
        {label}
      </p>
      <p
        className={`text-base font-semibold text-[var(--color-text)] ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function TransferCard({
  tokenAddress,
  symbol,
  decimals,
  balance,
  onSuccess,
}: {
  tokenAddress: `0x${string}`;
  symbol: string;
  decimals: number;
  balance: bigint;
  onSuccess: () => void;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        // refetch happens after receipt below
      },
    },
  });
  const step = useDeployTracker({ txHash, isPending, writeError });

  // Refetch balances after success
  if (step.kind === "success") {
    onSuccess();
  }

  const toError =
    touched && (!to || !viemIsAddress(to)) ? "ใส่ address ที่ถูกต้อง" : undefined;
  const amountError =
    touched && (!amount || Number(amount) <= 0)
      ? "ใส่จำนวนที่ส่ง"
      : undefined;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!viemIsAddress(to) || Number(amount) <= 0) return;
    try {
      writeContract({
        address: tokenAddress,
        abi: TOKEN_IMPLEMENTATION_ABI,
        functionName: "transfer",
        args: [to as `0x${string}`, parseUnits(amount, decimals)],
      });
    } catch {
      // parseUnits may throw on weird input — validation above should catch
    }
  }

  return (
    <ConnectGate>
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 mb-6">
        <h3 className="text-base font-semibold mb-1">โอนเหรียญ · Transfer</h3>
        <p className="text-xs text-[var(--color-muted)] mb-4">
          คงเหลือ:{" "}
          <span className="font-medium text-[var(--color-text)]">
            {formatUnits(balance, decimals).replace(/\.?0+$/, "")} {symbol}
          </span>
        </p>
        <form onSubmit={onSubmit} className="grid gap-3">
          <Field
            label="Recipient address"
            error={toError}
            htmlFor="tx-to"
            required
          >
            <Input
              id="tx-to"
              type="text"
              placeholder="0x..."
              value={to}
              onChange={(e) => setTo(e.target.value.trim())}
              disabled={isPending || step.kind === "confirming"}
            />
          </Field>
          <Field
            label={`Amount (${symbol})`}
            error={amountError}
            htmlFor="tx-amt"
            required
          >
            <Input
              id="tx-amt"
              type="text"
              inputMode="decimal"
              placeholder="100"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9.]/g, ""))
              }
              disabled={isPending || step.kind === "confirming"}
            />
          </Field>
          <Button
            type="submit"
            variant="brand"
            size="md"
            disabled={isPending || step.kind === "confirming"}
          >
            {isPending || step.kind === "confirming" ? "Sending..." : "Send"}
          </Button>
          {step.kind !== "idle" && step.kind !== "success" && (
            <DeployProgress step={step} />
          )}
          {step.kind === "success" && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
              ✓ ส่งเรียบร้อย ·{" "}
              <a
                href={explorerUrl(step.txHash, "tx")}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                view tx
              </a>
              {" "}·{" "}
              <button
                type="button"
                onClick={() => {
                  reset();
                  setTo("");
                  setAmount("");
                  setTouched(false);
                }}
                className="underline"
              >
                ส่งอีก
              </button>
            </p>
          )}
        </form>
      </section>
    </ConnectGate>
  );
}

function ShareCard({
  address,
  symbol,
}: {
  address: `0x${string}`;
  symbol: string;
}) {
  const [copied, setCopied] = useState(false);

  function onCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/lab/token-forge/${address}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <section className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <h3 className="text-base font-semibold mb-1">📣 Share this token</h3>
      <p className="text-xs text-[var(--color-muted)] mb-3">
        ส่งลิงก์นี้ให้เพื่อน · ใครก็เปิดดู supply + transfer ได้ (ถ้ามี ${symbol}{" "}
        ใน wallet)
      </p>
      <Button variant="outline" size="sm" onClick={onCopy}>
        {copied ? "✓ Copied!" : "Copy share URL"}
      </Button>
    </section>
  );
}
