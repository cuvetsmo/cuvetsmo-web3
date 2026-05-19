import type { Metadata } from "next";
import { BoardTabs } from "./_board-tabs";

export const metadata: Metadata = {
  title: "Community Board · กระดานชุมชน",
  description:
    "On-chain guestbook + off-chain polls สำหรับนิสิตสัตวแพทย์ CU. signed message + signed vote · ทุกคนยืนยันได้ว่าใครส่ง",
};

export default function BoardPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <span className="inline-block px-2 py-0.5 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)] text-[11px] font-semibold uppercase tracking-wider mb-3">
          Play · Community Board
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          กระดานชุมชน · Community Board
        </h1>
        <p className="text-[var(--color-muted)] leading-relaxed">
          เขียนข้อความ on-chain · โหวต poll · ทุกข้อความเซ็นด้วย wallet
          และเก็บถาวรบน Base Sepolia.
        </p>
      </header>

      <BoardTabs />
    </main>
  );
}
