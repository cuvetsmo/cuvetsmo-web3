import { Placeholder } from "@/components/ui/placeholder";

export const metadata = {
  title: "Swap Sandbox",
  description: "Token swap demo on Base Sepolia — see liquidity pools in action.",
};

export default function SwapPage() {
  return (
    <Placeholder
      agent="Agent C (Play interactives)"
      pillar="Play"
      title="Swap Sandbox"
      description="Educational AMM swap. Two faucet tokens (e.g. mVET / mBKK), constant-product pool, slippage slider. User sees price impact before signing."
      spec="master plan §5.5 Swap Sandbox"
    />
  );
}
