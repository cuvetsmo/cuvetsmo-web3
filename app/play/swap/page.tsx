import type { Metadata } from "next";
import { SwapSimulator } from "./_swap-simulator";
import { IlSimulator } from "./_il-simulator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Swap Sandbox — เรียนรู้ DeFi แบบไม่เสี่ยง",
  description:
    "Teaching demo สำหรับ constant product AMM + impermanent loss. ไม่มีธุรกรรมจริง ไม่ต้องใช้ wallet — ปลอดภัย 100%",
};

export default function SwapPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <span className="inline-block px-2 py-0.5 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)] text-[11px] font-semibold uppercase tracking-wider mb-3">
          Play — Swap & Stake Demo
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Swap Sandbox — เรียนรู้ DeFi
        </h1>
        <p className="text-[var(--color-muted)] leading-relaxed">
          เข้าใจ AMM (Automated Market Maker) + impermanent loss
          แบบ interactive ก่อนแตะ DeFi จริง.
        </p>
      </header>

      <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4 mb-8">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
          Teaching demo only — ไม่มีการแลกจริง
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
          ไม่มี contract, ไม่ต้องใช้ wallet, ทุกตัวเลขคำนวณ in-browser
          เพื่อให้คุณเข้าใจ mechanics. หลังเรียนแล้วลอง Quest #8 บน Base
          Sepolia testnet.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
          Constant Product — x · y = k
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          กลไกของ Uniswap v2 — สูตรเดียวคุม pool ทั้งระบบ. ลองดึง slider
          ดู price impact.
        </p>
        <SwapSimulator />
      </section>

      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
          Impermanent Loss
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          ทำไม LP บางครั้งเสียเงิน แม้ราคารวมขึ้น? ลองเปลี่ยนราคา PUP
          ดู IL คำนวณสด.
        </p>
        <IlSimulator />
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
        <h3 className="font-semibold text-base mb-2">
          พร้อมลองของจริง?
        </h3>
        <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
          เมื่อเข้าใจ AMM แล้ว ลอง Quest #8 บน Learn pillar · swap testnet
          tokens จริงบน Base Sepolia · ใช้ของจาก faucet ฟรี.
        </p>
        <Link
          href="/learn/quests"
          className="btn-brand text-sm inline-block"
        >
          ดู Quest #8 →
        </Link>
      </section>
    </main>
  );
}
