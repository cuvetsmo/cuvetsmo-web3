import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "Community Board",
  description: "On-chain pinboard — vet students sign messages, write to chain.",
};

export default function BoardPage() {
  return (
    <Placeholder
      agent="Agent C (Play interactives)"
      pillar="Play"
      title="Community Board"
      description="On-chain message board. Each post is a tiny contract write. Demonstrates signing, tx confirmation, event indexing. Mods via badge SBT."
      spec="master plan §5.4 Community Board"
    />
  );
}
