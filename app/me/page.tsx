import type { Metadata } from "next";

import { MeDashboard } from "./_components/me-dashboard";

export const metadata: Metadata = {
  title: "Dashboard — /me",
  description:
    "Your CUVETSMO Web3 dashboard · Vet SBT Card · Quest XP · Badges · wallet addresses · quick actions in one place.",
};

export default function MePage() {
  return <MeDashboard />;
}
