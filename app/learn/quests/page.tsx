import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "Quests",
  description: "Gamified learning quests — earn badges as you learn Web3.",
};

export default function QuestsPage() {
  return (
    <Placeholder
      agent="Agent B (Learn/Build content)"
      pillar="Learn"
      title="Quests"
      description="Quest list: each quest = small on-chain action that mints a badge SBT to your profile. Track progress, see leaderboard, claim rewards."
      spec="master plan §5.2 Quests"
    />
  );
}
