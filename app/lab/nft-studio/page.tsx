import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "NFT Studio",
  description: "No-code ERC-721 collection deployer.",
};

export default function NftStudioPage() {
  return (
    <Placeholder
      agent="Agent D (The Lab factories)"
      pillar="The Lab"
      title="NFT Studio"
      description="Deploy an ERC-721 collection. Upload images, set name/symbol/supply cap, configure mint price + allowlist. IPFS pin via Pinata, deployment via NFTFactory."
      spec="master plan §7.2 NFT Studio"
    />
  );
}
