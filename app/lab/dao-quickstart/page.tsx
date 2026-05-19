import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "DAO Quickstart",
  description: "Spin up a Governor + voting token in minutes.",
};

export default function DaoQuickstartPage() {
  return (
    <Placeholder
      agent="Agent D (The Lab factories)"
      pillar="The Lab"
      title="DAO Quickstart"
      description="Spin up an OpenZeppelin Governor + ERC-20Votes voting token. Choose quorum, voting period, timelock delay. Deployed via GovernorFactory."
      spec="master plan §7.4 DAO Quickstart"
    />
  );
}
