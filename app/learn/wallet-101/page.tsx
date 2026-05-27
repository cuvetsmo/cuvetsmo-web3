import type { Metadata } from "next";
import Link from "next/link";

import { Wallet101Wizard } from "./_components/wallet-101-wizard";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "Wallet 101",
  description:
    "เริ่ม Web3 ใน 5 ขั้น 5 นาที — login, รับ test ETH, mint SBT ตัวแรก.",
};

export default function Wallet101Page() {
  return (
    <main>
      {/* Hero · cloud-bg */}
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <Reveal>
            <div className="mb-3 flex items-center gap-2">
              <Badge tone="brand">Learn</Badge>
              <Badge tone="muted">5 steps · 5 min</Badge>
              <Badge tone="success">Gasless</Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 max-w-3xl">
              Wallet 101
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed">
              จากศูนย์ถึง wallet ใบแรก ใน 5 นาที · ไม่ต้องโหลด MetaMask ·
              ไม่ต้องเซฟ seed phrase · Embedded wallet by Privy + Smart Account
              บน Base Sepolia testnet
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Reveal>
          <Wallet101Wizard />
        </Reveal>

        <div className="mt-12 border-t border-[var(--color-border)] pt-6">
          <Link
            href="/learn"
            className="text-sm text-[var(--color-brand)] hover:underline"
          >
            ← กลับ Learn hub
          </Link>
        </div>
      </div>
    </main>
  );
}
