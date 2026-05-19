"use client";

import { usePrivy } from "@privy-io/react-auth";
import { shortAddress } from "@/lib/utils";

/**
 * Wallet connect/disconnect button.
 *
 * Three states:
 *   1. Privy not ready  → "Loading..."
 *   2. Not authenticated → "Connect Wallet"
 *   3. Authenticated     → shows short address + opens account modal on click
 */
export function WalletButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-500 text-sm font-medium"
      >
        Loading...
      </button>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="btn-brand text-sm"
        aria-label="Connect wallet"
      >
        Connect Wallet
      </button>
    );
  }

  const walletAddress = user?.wallet?.address;
  const label = walletAddress
    ? shortAddress(walletAddress)
    : user?.email?.address || "Account";

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline px-3 py-1 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] text-xs font-medium font-mono">
        {label}
      </span>
      <button
        onClick={logout}
        className="btn-outline text-sm"
        aria-label="Disconnect wallet"
      >
        Disconnect
      </button>
    </div>
  );
}
