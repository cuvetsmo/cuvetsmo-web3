import type { Metadata } from "next";
import { BoardTabs } from "./_board-tabs";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "Community Board — กระดานชุมชน",
  description:
    "On-chain guestbook + off-chain polls สำหรับนิสิตสัตวแพทย์ CU. Signed message + signed vote — ทุกคนยืนยันได้ว่าใครส่ง.",
};

export default function BoardPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <Reveal>
            <span className="inline-block px-2 py-0.5 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)] text-[11px] font-semibold uppercase tracking-wider mb-3">
              Play — Community Board
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              กระดานชุมชน — Community Board
            </h1>
            <p className="text-[var(--color-muted)] leading-relaxed max-w-2xl">
              เขียนข้อความ on-chain · โหวต poll · ทุกข้อความเซ็นด้วย wallet
              และเก็บถาวรบน Base Sepolia.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <BoardTabs />
      </div>
    </main>
  );
}
