import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "Page Builder",
  description: "Build a custom DApp landing page with drag-and-drop blocks.",
};

export default function PageBuilderPage() {
  return (
    <Placeholder
      agent="Agent D (The Lab factories)"
      pillar="The Lab"
      title="Page Builder"
      description="Drag-and-drop landing page builder for DApps deployed via The Lab. Pick blocks (hero, mint button, swap widget, leaderboard) and publish to web3.cuvetsmo.com/p/<slug>."
      spec="master plan §7.5 Page Builder"
    />
  );
}
