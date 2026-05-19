"use client";

import { useMemo, useState } from "react";

const INITIAL_PUP = 100; // tokens deposited
const INITIAL_MEOW = 100;
const INITIAL_PRICE = 1; // 1 PUP = 1 MEOW at deposit
const HODL_VALUE = INITIAL_PUP * INITIAL_PRICE + INITIAL_MEOW;

function fmt(n: number, dp = 2): string {
  return n.toFixed(dp);
}

export function IlSimulator() {
  // newPrice = current PUP price (in MEOW)
  const [pricePct, setPricePct] = useState<number>(100); // 100% = same price

  const newPriceMultiplier = pricePct / 100;

  const calc = useMemo(() => {
    const k = INITIAL_PUP * INITIAL_MEOW;
    // After price change to `newPriceMultiplier`, pool rebalances to keep:
    //   newMEOW / newPUP = newPriceMultiplier
    //   newPUP * newMEOW = k
    // => newPUP = sqrt(k / newPriceMultiplier)
    const newPup = Math.sqrt(k / newPriceMultiplier);
    const newMeow = Math.sqrt(k * newPriceMultiplier);

    // Value of LP position (denominated in MEOW)
    const lpValue = newPup * newPriceMultiplier + newMeow;
    // Value if HODL'd (just held initial tokens)
    const hodlValue = INITIAL_PUP * newPriceMultiplier + INITIAL_MEOW;
    const impermanentLoss = lpValue - hodlValue;
    const ilPct = hodlValue > 0 ? (impermanentLoss / hodlValue) * 100 : 0;
    return {
      newPup,
      newMeow,
      lpValue,
      hodlValue,
      impermanentLoss,
      ilPct,
    };
  }, [newPriceMultiplier]);

  return (
    <div className="card space-y-6">
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label htmlFor="il-price" className="text-sm font-medium">
            PUP price change
          </label>
          <span className="text-sm font-mono">
            {fmt(newPriceMultiplier, 2)}× ({pricePct}%)
          </span>
        </div>
        <input
          id="il-price"
          type="range"
          min={25}
          max={500}
          step={5}
          value={pricePct}
          onChange={(e) => setPricePct(Number(e.target.value))}
          className="w-full accent-[var(--color-brand)]"
        />
        <div className="flex justify-between text-[11px] text-[var(--color-muted)] mt-1">
          <span>0.25×</span>
          <span>1× (same)</span>
          <span>5×</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Card
          title="If you HODL"
          subtitle="ถือเฉยๆ ไม่ deposit เข้า pool"
          value={`${fmt(calc.hodlValue, 2)} MEOW`}
          tone="neutral"
        />
        <Card
          title="If you LP"
          subtitle="deposit เข้า PUP/MEOW pool"
          value={`${fmt(calc.lpValue, 2)} MEOW`}
          tone="brand"
        />
      </div>

      <div
        className={`rounded-lg border-2 p-4 ${
          calc.ilPct < -0.5
            ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
            : "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
          Impermanent loss
        </p>
        <p
          className={`text-3xl font-bold font-mono ${
            calc.ilPct < -0.5
              ? "text-amber-700 dark:text-amber-300"
              : "text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {fmt(calc.ilPct, 2)}%
        </p>
        <p className="text-xs mt-1 text-[var(--color-muted)]">
          ({fmt(calc.impermanentLoss, 2)} MEOW เทียบกับ HODL)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-[var(--color-muted)]">
        <div>
          <p className="font-semibold text-[var(--color-text)]">Initial deposit</p>
          <p className="font-mono">
            {INITIAL_PUP} PUP + {INITIAL_MEOW} MEOW
          </p>
          <p className="font-mono">@ 1 PUP = 1 MEOW</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text)]">After price move</p>
          <p className="font-mono">
            {fmt(calc.newPup, 2)} PUP + {fmt(calc.newMeow, 2)} MEOW
          </p>
          <p className="font-mono">
            @ 1 PUP = {fmt(newPriceMultiplier, 2)} MEOW
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-4 text-sm leading-relaxed">
        <p className="font-semibold mb-1.5">
          ทำไม LP ขาดทุนตอนราคาวิ่ง?
        </p>
        <p className="text-[var(--color-muted)]">
          AMM rebalance pool อัตโนมัติ — เมื่อ PUP แพงขึ้น arbitrageur มาดึง PUP
          ออก ทิ้ง MEOW ไว้. คุณจึงมี PUP น้อยลงเทียบกับตอนที่ HODL.
          IL จะ &quot;impermanent&quot; ก็ต่อเมื่อราคากลับมาเท่าเดิม.
        </p>
        <p className="mt-2 text-[var(--color-muted)]">
          IL ที่ {HODL_VALUE} MEOW เริ่ม: ที่ 2× ราคา ≈ -5.7%, ที่ 4× ≈ -20%,
          ที่ 0.5× ≈ -5.7%.
        </p>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  value,
  tone,
}: {
  title: string;
  subtitle: string;
  value: string;
  tone: "neutral" | "brand";
}) {
  return (
    <div
      className={`rounded-lg p-4 border ${
        tone === "brand"
          ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]/30"
          : "border-[var(--color-border)]"
      }`}
    >
      <p className="text-xs uppercase tracking-wide font-semibold text-[var(--color-muted)]">
        {title}
      </p>
      <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
        {subtitle}
      </p>
      <p className="font-mono text-xl font-bold mt-2">{value}</p>
    </div>
  );
}
