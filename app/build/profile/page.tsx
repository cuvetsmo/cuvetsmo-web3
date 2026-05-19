import type { Metadata } from "next";

import { ProfilePanel } from "./_components/profile-panel";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Your CUVETSMO Web3 profile — Vet SBT Card, badges, XP, login methods.",
};

export default function ProfilePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-12">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="brand">Build</Badge>
          <Badge tone="muted">Public profile</Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Profile
        </h1>
        <p className="text-base text-[var(--color-muted)] max-w-2xl leading-relaxed">
          ของสะสมของคุณในที่เดียว — wallet, Vet SBT Card, badge collection,
          XP, login methods.
        </p>
      </header>

      <ProfilePanel />
    </main>
  );
}
