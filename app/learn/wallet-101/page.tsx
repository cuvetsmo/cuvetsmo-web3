import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "Wallet 101",
  description: "Wallet onboarding for absolute beginners — Thai-first.",
};

export default function Wallet101Page() {
  return (
    <Placeholder
      agent="Agent B (Learn/Build content)"
      pillar="Learn"
      title="Wallet 101"
      description="Hands-on wallet onboarding. Step 1: what is a wallet. Step 2: create your first embedded wallet via Privy. Step 3: claim testnet ETH via /api/faucet. Step 4: send your first transaction."
      spec="master plan §5.1 Wallet 101"
    />
  );
}
