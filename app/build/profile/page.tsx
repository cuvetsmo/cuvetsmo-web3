import type { Metadata } from "next";

import { ProfilePanel } from "./_components/profile-panel";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Your CUVETSMO Web3 profile — Vet SBT Card, badges, XP, login methods.",
};

export default function ProfilePage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <Reveal>
            <div className="mb-3 flex items-center gap-2">
              <Badge tone="brand">Build</Badge>
              <Badge tone="muted">Public profile</Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">
              Profile
            </h1>
            <p className="text-base text-[var(--color-muted)] max-w-2xl leading-relaxed">
              ของสะสมของคุณในที่เดียว — wallet · Vet SBT Card · badge collection ·
              XP · login methods · ดู dashboard เต็มที่ <a href="/me" className="text-[var(--color-brand)] underline">/me</a>.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ProfilePanel />
      </div>
    </main>
  );
}
