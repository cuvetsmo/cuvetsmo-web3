import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "Mint Playground",
  description: "Mint your first NFT on Base Sepolia testnet.",
};

export default function MintPage() {
  return (
    <Placeholder
      agent="Agent C (Play interactives)"
      pillar="Play"
      title="Mint Playground"
      description="Demo NFT minter. User picks image + name, signs tx, receives ERC-721 on Base Sepolia. Free (gas sponsored via Pimlico)."
      spec="master plan §5.3 Mint Playground"
    />
  );
}
