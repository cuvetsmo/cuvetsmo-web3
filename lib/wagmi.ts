import { http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { createConfig } from "@privy-io/wagmi";

/**
 * wagmi configuration for web3.cuvetsmo.com
 *
 * Network: Base Sepolia (testnet) only.
 * RPC: defaults to public Base Sepolia endpoint. Override via
 *      NEXT_PUBLIC_BASE_SEPOLIA_RPC for Alchemy/Infura when traffic warrants.
 *
 * IMPORTANT: this uses createConfig from @privy-io/wagmi (NOT raw wagmi)
 * because PrivyProvider needs to inject embedded wallet connectors.
 */
const rpcUrl =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
});

export { baseSepolia };
