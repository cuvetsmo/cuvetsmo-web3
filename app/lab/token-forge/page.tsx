import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "Token Forge",
  description: "No-code ERC-20 token deployer.",
};

export default function TokenForgePage() {
  return (
    <Placeholder
      agent="Agent D (The Lab factories)"
      pillar="The Lab"
      title="Token Forge"
      description="Deploy an ERC-20 token in 60 seconds. Name, symbol, supply, optional mint/burn/pause. Deployed via TokenFactory (CREATE2) so contract address is deterministic and bytecode pre-verified on basescan."
      spec="master plan §7.1 Token Forge, Appendix A §A.3"
    />
  );
}
