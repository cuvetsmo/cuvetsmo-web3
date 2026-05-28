import type { Metadata } from "next";
import { MintForm } from "./_mint-form";
import { RecentMints } from "./_recent-mints";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "Mint Playground — สร้าง NFT/SBT แรกของคุณ",
  description:
    "Mint NFT หรือ SBT แรกของคุณบน Base Sepolia testnet — อัปโหลดรูป, ตั้งชื่อ, sign tx, ฟรีและปลอดภัย",
};

export default function MintPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <Reveal>
            <span className="inline-block px-2 py-0.5 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)] text-[11px] font-semibold uppercase tracking-wider mb-3">
              Play — Mint Playground
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              สร้าง NFT/SBT แรกของคุณ
            </h1>
            <p className="text-[var(--color-muted)] leading-relaxed max-w-2xl">
              อัปโหลดรูป · ตั้งชื่อ · กด mint แล้วได้ token จริงบน Base Sepolia
              testnet ฟรี ไม่มีค่าใช้จ่าย.
            </p>
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Testnet only, not curated — ผลงานทุกคนเห็นได้สาธารณะ.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <MintForm />

      <section className="mt-12">
        <header className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Recent mints
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              ผลงาน 20 ชิ้นล่าสุดของคนในชุมชน
            </p>
          </div>
        </header>
        <RecentMints />
      </section>
      </div>
    </main>
  );
}
