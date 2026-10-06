import type { Metadata } from "next";

import { QuestGrid } from "./_components/quest-grid";
import { Badge } from "@/components/ui/badge";
import { QUESTS, TOTAL_XP_AVAILABLE } from "@/lib/quests";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "Web3 Quests",
  description:
    "10 ภารกิจ Web3 — sign, mint, vote, transfer, approve. ทำเสร็จได้ badge SBT.",
};

export default async function QuestsPage({ searchParams }: { searchParams: Promise<{ quest?: string }> }) {
  const { quest } = await searchParams
  const selected = typeof quest === 'string' && /^\d{1,2}$/.test(quest) ? QUESTS.find((row) => row.id === Number(quest)) : undefined
  return (
    <main>
      {/* Hero · cloud-bg */}
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <Reveal>
            <div className="mb-3 flex items-center gap-2">
              <Badge tone="brand">Learn</Badge>
              <Badge tone="muted">
                {QUESTS.length} quests · {TOTAL_XP_AVAILABLE} XP
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 max-w-3xl">
              Web3 Quests
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed">
              10 ภารกิจ hands-on · sign · mint · vote · transfer · approve ·
              อ่าน explorer · ทำเสร็จได้ Badge SBT + XP · ใช้ทำ portfolio Web3
              ตั้งแต่วันแรก · gasless ผ่าน Pimlico paymaster
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <QuestGrid initialQuestId={selected?.id} />
      </div>
    </main>
  );
}
