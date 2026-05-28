import type { Metadata } from "next";

import { VetCardPanel } from "./_components/vet-card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "Vet SBT Card",
  description:
    "Claim soulbound credential card — proves you are a CU Vet student. Share to IG/LINE.",
};

export default function CardPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <Reveal>
            <div className="mb-3 flex items-center gap-2">
              <Badge tone="brand">Build</Badge>
              <Badge tone="muted">Soulbound · Base Sepolia</Badge>
              <Badge tone="success">Gasless</Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">
              Vet SBT Card
            </h1>
            <p className="text-base text-[var(--color-muted)] max-w-2xl leading-relaxed">
              Credential SBT ที่บอกว่าคุณเป็นนิสิตสัตวแพทย์จุฬาฯ · โอนไม่ได้ ·
              ปลอมไม่ได้ · แต่โพส IG อวดได้ · gasless mint ผ่าน Pimlico.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <VetCardPanel />
      </div>
    </main>
  );
}
