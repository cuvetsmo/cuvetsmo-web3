import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "Vet SBT Card",
  description: "Claim your soulbound Vet Card — student credential on-chain.",
};

export default function CardPage() {
  return (
    <Placeholder
      agent="Agent B (Learn/Build content)"
      pillar="Build"
      title="Vet SBT Card"
      description="Claim a soulbound (non-transferable) credential card that proves you are a CU Vet student. Fields: name, year, faculty, badges. Verified via OrgRegistry signature."
      spec="master plan §5.6 Vet SBT Card"
    />
  );
}
