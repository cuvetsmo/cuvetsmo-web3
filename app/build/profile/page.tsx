import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "Profile Builder",
  description: "Build your public Web3 profile — Vet Card + badges + activity.",
};

export default function ProfilePage() {
  return (
    <Placeholder
      agent="Agent B (Learn/Build content)"
      pillar="Build"
      title="Profile Builder"
      description="Public profile page composed of Vet SBT Card + earned badges + on-chain activity feed. Shareable URL: web3.cuvetsmo.com/u/<handle>."
      spec="master plan §5.7 Profile Builder"
    />
  );
}
