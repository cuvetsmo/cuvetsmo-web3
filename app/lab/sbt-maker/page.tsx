import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "SBT Maker",
  description: "Soulbound token issuer for clubs and committees.",
};

export default function SbtMakerPage() {
  return (
    <Placeholder
      agent="Agent D (The Lab factories)"
      pillar="The Lab"
      title="SBT Maker"
      description="Issue soulbound (non-transferable) tokens for memberships, attendance, credentials. Set issuer org, revocation rules, off-chain metadata schema. Deployed via SBTFactory."
      spec="master plan §7.3 SBT Maker"
    />
  );
}
