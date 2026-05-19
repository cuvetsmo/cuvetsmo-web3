import type { PrivyClientConfig } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

/**
 * Privy configuration for CUVETSMO Web3
 *
 * - Embedded wallets created automatically for users-without-wallets
 *   so a vet student can sign in with email + immediately have a wallet.
 * - Login methods kept minimal (email, google, wallet) — Wave 2 may add
 *   LINE / Apple after wave-1 ship.
 * - Brand color matches cuvetsmo.com (#0369a1).
 */
export const privyConfig: PrivyClientConfig = {
  loginMethods: ["email", "google", "wallet"],
  embeddedWallets: {
    ethereum: {
      createOnLogin: "users-without-wallets",
    },
  },
  appearance: {
    theme: "light",
    accentColor: "#0369a1",
    logo: "/smo-logo.png",
    showWalletLoginFirst: false,
  },
  defaultChain: baseSepolia,
  supportedChains: [baseSepolia],
};

/**
 * Placeholder app ID used when NEXT_PUBLIC_PRIVY_APP_ID is unset.
 * Privy will warn in console but the app still renders (auth disabled).
 * Replace with real app ID from https://dashboard.privy.io
 */
export const PRIVY_PLACEHOLDER_APP_ID = "clpispdty00ycl80fpueukbhl";
