import type { Metadata } from "next";

import { QuestGrid } from "./_components/quest-grid";
import { Badge } from "@/components/ui/badge";
import { QUESTS, TOTAL_XP_AVAILABLE } from "@/lib/quests";

export const metadata: Metadata = {
  title: "Web3 Quests",
  description:
    "10 ภารกิจ Web3 — sign, mint, vote, transfer, approve. ทำเสร็จได้ badge SBT.",
};

export default function QuestsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-12">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="brand">Learn</Badge>
          <Badge tone="muted">
            {QUESTS.length} quests · {TOTAL_XP_AVAILABLE} XP
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Web3 Quests
        </h1>
        <p className="text-base text-[var(--color-muted)] max-w-2xl leading-relaxed">
          10 ภารกิจ hands-on — sign, mint, vote, transfer, approve, อ่าน
          explorer. ทำเสร็จได้ Badge SBT + XP. ใช้ทำ portfolio Web3 ตั้งแต่
          วันแรก.
        </p>
      </header>

      <QuestGrid />
    </main>
  );
}
