"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { wagmiConfig } from "@/lib/wagmi";
import { privyConfig, PRIVY_PLACEHOLDER_APP_ID } from "@/lib/privy";

/**
 * Client provider tree.
 *
 * Order: PrivyProvider > QueryClientProvider > WagmiProvider (from @privy-io/wagmi)
 *
 * - PrivyProvider must wrap WagmiProvider so embedded-wallet connectors
 *   are registered before wagmi resolves them.
 * - QueryClient lives inside Privy but outside Wagmi (per Privy docs).
 * - useState ensures QueryClient is stable across hot reloads.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const appId =
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || PRIVY_PLACEHOLDER_APP_ID;

  return (
    <PrivyProvider appId={appId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
