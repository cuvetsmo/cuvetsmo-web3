import type { Metadata } from "next";
import Link from "next/link";

import { Wallet101Wizard } from "./_components/wallet-101-wizard";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Wallet 101",
  description:
    "เริ่ม Web3 ใน 5 ขั้น 5 นาที — login, รับ test ETH, mint SBT ตัวแรก.",
};

export default function Wallet101Page() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-12">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="brand">Learn</Badge>
          <Badge tone="muted">5 steps · 5 min</Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Wallet 101
        </h1>
        <p className="text-base text-[var(--color-muted)] max-w-2xl leading-relaxed">
          จากศูนย์ถึง wallet ใบแรก ใน 5 นาที. ไม่ต้องโหลด MetaMask, ไม่ต้อง
          เซฟ seed phrase. Embedded wallet by Privy + Base Sepolia testnet.
        </p>
      </header>

      <Wallet101Wizard />

      <div className="mt-12 border-t border-[var(--color-border)] pt-6">
        <Link
          href="/"
          className="text-sm text-[var(--color-brand)] hover:underline"
        >
          ← กลับหน้าแรก
        </Link>
      </div>
    </main>
  );
}
