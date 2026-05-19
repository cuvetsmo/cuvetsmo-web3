import type { Metadata } from "next";
import Link from "next/link";

import { ZeroToHeroFlow } from "./_components/zth-flow";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Zero to Hero — เริ่ม Web3 จาก 0",
  description:
    "5 ขั้นสั้นๆ สำหรับคนที่ไม่เคยรู้จัก crypto, blockchain, หรือ web3 — เข้าใจได้ใน 3 นาที, ไม่มีปุ่มที่เสียเงิน.",
};

export default function ZeroToHeroPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-12">
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="brand">Learn</Badge>
          <Badge tone="muted">5 ขั้น · 3 นาที</Badge>
          <Badge tone="success">ไม่ต้องมี wallet</Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Zero to Hero
        </h1>
        <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed">
          ไม่เคยได้ยินคำว่า blockchain เลยก็เริ่มที่นี่ได้.
          ทั้งหน้านี้อ่านอย่างเดียว ไม่มีปุ่มที่กระทบ chain — พร้อมแล้วค่อยไปทำ Wallet 101 ต่อ.
        </p>
      </header>

      <ZeroToHeroFlow />

      <section className="mt-10 grid sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          href="/learn/wallet-101"
          className="card hover:border-[var(--color-brand)] transition-colors group"
        >
          <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wider mb-1">
            ถัดไป
          </p>
          <h3 className="font-bold mb-1">Wallet 101 — สร้าง wallet แรก</h3>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-3">
            5 นาที — login ด้วย CU email, รับ test ETH, mint SBT แรก
          </p>
          <span className="text-sm font-medium text-[var(--color-brand)] group-hover:underline">
            เริ่มทำ →
          </span>
        </Link>
        <Link
          href="/glossary"
          className="card hover:border-[var(--color-brand)] transition-colors group"
        >
          <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
            ดูศัพท์ที่เจอใน 5 ขั้น
          </p>
          <h3 className="font-bold mb-1">Glossary TH/EN — 68 คำพื้นฐาน</h3>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-3">
            พจนานุกรมสองภาษา พร้อมตัวอย่างบริบทสัตวแพทย์
          </p>
          <span className="text-sm font-medium text-[var(--color-brand)] group-hover:underline">
            เปิดดู →
          </span>
        </Link>
      </section>

      <div className="mt-10 border-t border-[var(--color-border)] pt-6">
        <Link
          href="/learn"
          className="text-sm text-[var(--color-brand)] hover:underline"
        >
          ← กลับ Learn hub
        </Link>
      </div>
    </main>
  );
}
