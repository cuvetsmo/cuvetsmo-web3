/**
 * Privy EOA + Coinbase Smart Account address resolver — React hook.
 *
 * After Account Abstraction landed (C2), every "Where does this user's
 * stuff live on chain?" question has TWO answers:
 *
 *   - EOA (Privy embedded wallet address) — when the user paid their own
 *     gas via wagmi `useWriteContract`.
 *   - Smart Account (Coinbase Smart Account derived from the EOA owner) —
 *     when the user clicked any "🎁 Gasless" flow and Pimlico sponsored
 *     the tx. msg.sender on chain = Smart Account, not EOA.
 *
 * Reads that target only one of those addresses miss assets the user
 * minted via the other path. This hook gives components both at once so
 * they can render the right state regardless of which gas path was used.
 *
 * Usage:
 *   const { eoa, smartAccount, ready } = useUserAddresses();
 *   // Read at BOTH addresses, merge results.
 */
"use client";

import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import type { Address } from "viem";

import { getSmartAccountAddressFor, aaSponsorshipReady } from "./aa-client";

export interface UserAddresses {
  /** Privy embedded wallet address (EOA · pays gas if not gasless). */
  eoa: Address | undefined;
  /** Coinbase Smart Account derived from the EOA · receives gasless mints. */
  smartAccount: Address | undefined;
  /** True once the EOA address is known. Smart Account may still be resolving. */
  ready: boolean;
  /** True once the Smart Account address has been deterministically computed. */
  smartAccountResolved: boolean;
}

export function useUserAddresses(): UserAddresses {
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const eoa = embedded?.address as Address | undefined;

  const [smartAccount, setSmartAccount] = useState<Address | undefined>();
  const [smartAccountResolved, setSmartAccountResolved] = useState(false);

  useEffect(() => {
    if (!embedded || !aaSponsorshipReady()) {
      setSmartAccount(undefined);
      setSmartAccountResolved(false);
      return;
    }
    let cancelled = false;
    setSmartAccountResolved(false);
    getSmartAccountAddressFor(embedded)
      .then((addr) => {
        if (cancelled) return;
        setSmartAccount(addr);
        setSmartAccountResolved(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSmartAccount(undefined);
        setSmartAccountResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [embedded]);

  return {
    eoa,
    smartAccount,
    ready: !!eoa,
    smartAccountResolved,
  };
}
