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
 *
 * 2026-05-20 — explicit walletChainType: 'ethereum-only'
 * -----------------------------------------------------------------
 * Why this is mandatory even though the docs say it's the default:
 *
 * OKX (and several other multi-chain wallets) announce themselves via
 * EIP-6963 with BOTH eip155 (EVM) and solana chain support. Without an
 * explicit walletChainType the Privy modal would render OKX twice — one
 * EVM entry, one Solana entry — and pick whichever the wallet adapter
 * returned first. After the dashboard SVM toggle was turned off, that
 * fallback path stopped returning an EVM session and clicking either
 * OKX entry surfaced the generic "Could not log in with wallet" error.
 *
 * Locking walletChainType to ethereum-only makes the choice explicit at
 * the client layer (independent of whatever the dashboard SVM toggle is
 * set to), so multi-chain wallets always resolve to their EVM provider
 * and the modal only lists each wallet once.
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
    logo: "/web3-logo-mark.png",
    showWalletLoginFirst: false,
    walletChainType: "ethereum-only",
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
