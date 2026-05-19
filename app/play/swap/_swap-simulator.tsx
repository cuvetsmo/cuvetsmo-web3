"use client";

import { useMemo, useState } from "react";

type Direction = "pup-to-meow" | "meow-to-pup";

const INITIAL_PUP = 1000;
const INITIAL_MEOW = 1000;

function fmt(n: number, dp = 4): string {
  if (Math.abs(n) < 0.0001 && n !== 0) return n.toExponential(2);
  return n.toFixed(dp).replace(/\.?0+$/, "");
}

export function SwapSimulator() {
  const [direction, setDirection] = useState<Direction>("pup-to-meow");
  const [amountIn, setAmountIn] = useState<number>(50);

  // Pool reserves stay fixed; we simulate one swap. Swap doesn't mutate state.
  const reserveIn = direction === "pup-to-meow" ? INITIAL_PUP : INITIAL_MEOW;
  const reserveOut = direction === "pup-to-meow" ? INITIAL_MEOW : INITIAL_PUP;

  const { amountOut, newReserveIn, newReserveOut, spotPrice, executionPrice, priceImpact, k } =
    useMemo(() => {
      const k = reserveIn * reserveOut;
      const newReserveIn = reserveIn + amountIn;
      const newReserveOut = k / newReserveIn;
      const amountOut = reserveOut - newReserveOut;
      const spotPrice = reserveOut / reserveIn;
      const executionPrice = amountIn > 0 ? amountOut / amountIn : 0;
      const priceImpact =
        amountIn > 0 ? Math.max(0, (1 - executionPrice / spotPrice) * 100) : 0;
      return {
        amountOut,
        newReserveIn,
        newReserveOut,
        spotPrice,
        executionPrice,
        priceImpact,
        k,
      };
    }, [reserveIn, reserveOut, amountIn]);

  const inLabel = direction === "pup-to-meow" ? "PUP" : "MEOW";
  const outLabel = direction === "pup-to-meow" ? "MEOW" : "PUP";

  return (
    <div className="card space-y-6">
      {/* Direction switcher */}
      <div className="flex items-center justify-between">
        <p className="text-sm">
          You give{" "}
          <span className="font-semibold text-[var(--color-brand)]">
            {inLabel}
          </span>{" "}
          → you get{" "}
          <span className="font-semibold text-[var(--color-brand)]">
            {outLabel}
          </span>
        </p>
        <button
          onClick={() =>
            setDirection((d) =>
              d === "pup-to-meow" ? "meow-to-pup" : "pup-to-meow",
            )
          }
          className="btn-outline text-xs"
        >
          ⇅ flip
        </button>
      </div>

      {/* Pool state */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <PoolBox
          token={direction === "pup-to-meow" ? "PUP" : "MEOW"}
          reserve={reserveIn}
          newReserve={newReserveIn}
          emoji={direction === "pup-to-meow" ? "PUP" : "MEW"}
        />
        <PoolBox
          token={direction === "pup-to-meow" ? "MEOW" : "PUP"}
          reserve={reserveOut}
          newReserve={newReserveOut}
          emoji={direction === "pup-to-meow" ? "MEW" : "PUP"}
        />
      </div>

      {/* Slider */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label htmlFor="swap-amount" className="text-sm font-medium">
            Amount to swap ({inLabel})
          </label>
          <span className="text-sm font-mono">{amountIn}</span>
        </div>
        <input
          id="swap-amount"
          type="range"
          min={1}
          max={500}
          step={1}
          value={amountIn}
          onChange={(e) => setAmountIn(Number(e.target.value))}
          className="w-full accent-[var(--color-brand)]"
        />
        <div className="flex justify-between text-[11px] text-[var(--color-muted)] mt-1">
          <span>1</span>
          <span>50 (typical)</span>
          <span>500 (whale)</span>
        </div>
      </div>

      {/* Receive */}
      <div className="rounded-lg bg-[var(--color-brand-light)]/50 p-4">
        <p className="text-xs text-[var(--color-muted)] mb-1">
          You receive · simulation
        </p>
        <p className="text-2xl font-bold text-[var(--color-brand)] font-mono">
          {fmt(amountOut, 4)} {outLabel}
        </p>
      </div>

      {/* Metrics */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Stat label="Spot price" value={`1 ${inLabel} = ${fmt(spotPrice, 4)} ${outLabel}`} />
        <Stat
          label="Execution price"
          value={`1 ${inLabel} = ${fmt(executionPrice, 4)} ${outLabel}`}
        />
        <Stat label="k (constant)" value={fmt(k, 0)} />
        <Stat
          label="Price impact"
          value={`${fmt(priceImpact, 2)}%`}
          warn={priceImpact > 5}
        />
      </dl>

      {/* Explainer */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-4 text-sm leading-relaxed">
        <p className="font-semibold mb-1.5">Why doesn&apos;t price stay 1:1?</p>
        <p className="text-[var(--color-muted)]">
          เพราะ pool บังคับ <span className="font-mono">x · y = k</span>{" "}
          ตลอด · เมื่อคุณดึง {outLabel} ออก, ราคามันก็แพงขึ้นตามสัดส่วน. ยิ่ง
          swap เยอะ → ยิ่ง slippage แรง. นี่คือสาเหตุที่ DeFi traders
          ใช้ split swap หรือ aggregator.
        </p>
      </div>
    </div>
  );
}

function PoolBox({
  token,
  reserve,
  newReserve,
  emoji,
}: {
  token: string;
  reserve: number;
  newReserve: number;
  emoji: string;
}) {
  const delta = newReserve - reserve;
  const sign = delta >= 0 ? "+" : "";
  return (
    <div className="rounded-lg border border-[var(--color-border)] p-3">
      <p className="text-xs text-[var(--color-muted)] mb-1">
        <span className="font-mono mr-1">{emoji}</span>
        {token} reserve
      </p>
      <p className="font-mono text-lg font-bold">{fmt(reserve, 0)}</p>
      <p
        className={`text-xs font-mono mt-0.5 ${
          delta >= 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        → {fmt(newReserve, 2)} ({sign}
        {fmt(delta, 2)})
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-md border border-[var(--color-border)] p-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-[var(--color-muted)] font-semibold">
        {label}
      </dt>
      <dd
        className={`font-mono text-sm mt-0.5 ${
          warn ? "text-amber-600 dark:text-amber-400 font-semibold" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
