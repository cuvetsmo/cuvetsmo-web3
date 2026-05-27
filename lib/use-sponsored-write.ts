/**
 * React hook · gas-sponsored contract writes via Privy + Pimlico.
 *
 * Drop-in alternative to wagmi's `useWriteContract` for cases where you
 * want the user to pay $0 gas. End user signs the UserOp digest with their
 * Privy embedded wallet; Pimlico's paymaster covers the on-chain cost.
 *
 * Usage:
 *   const { send, status, result, error, reset } = useSponsoredWrite();
 *   await send({
 *     abi: GUESTBOOK_ABI,
 *     address: CONTRACTS.GUESTBOOK,
 *     functionName: "post",
 *     args: [message],
 *   });
 *
 * The hook only mints from the connected Privy *embedded* wallet — it
 * intentionally skips external wallets (MetaMask, OKX, etc.) because those
 * users already have their own gas funding model. UI should fall back to
 * wagmi's `useWriteContract` for non-embedded wallets.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import {
  encodeFunctionData,
  type Abi,
  type Address,
  type Hex,
} from "viem";

import {
  aaSponsorshipReady,
  sendSponsoredCall,
  type SponsoredResult,
} from "./aa-client";

export type SponsoredStatus =
  | "idle"
  | "preparing"
  | "signing"
  | "sponsoring"
  | "confirming"
  | "success"
  | "error";

/**
 * Args for a sponsored write. Two equivalent forms:
 *   - Convenience: pass `abi` + `functionName` + `args` (will be encoded
 *     internally — same shape as wagmi's `useWriteContract`).
 *   - Direct: pass pre-encoded `data` (skip encoding · useful for batched
 *     calls or non-standard ABIs).
 */
export type SponsoredWriteArgs =
  | {
      address: Address;
      abi: Abi;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      functionName: string;
      args: readonly unknown[];
      value?: bigint;
      data?: never;
    }
  | {
      address: Address;
      data: Hex;
      abi?: never;
      functionName?: never;
      args?: never;
      value?: bigint;
    };

export interface UseSponsoredWrite {
  status: SponsoredStatus;
  result: SponsoredResult | null;
  error: Error | null;
  embeddedWalletReady: boolean;
  pimlicoReady: boolean;
  /** True when both prerequisites are met — caller should show the gasless option. */
  available: boolean;
  /**
   * Send a sponsored contract call. Resolves with the receipt on success.
   * Throws on any failure (Privy missing · Pimlico missing · UserOp revert).
   */
  send: (args: SponsoredWriteArgs) => Promise<SponsoredResult>;
  reset: () => void;
}

export function useSponsoredWrite(): UseSponsoredWrite {
  const { wallets } = useWallets();
  const [status, setStatus] = useState<SponsoredStatus>("idle");
  const [result, setResult] = useState<SponsoredResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const embedded = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy"),
    [wallets],
  );

  const pimlicoReady = aaSponsorshipReady();
  const embeddedWalletReady = !!embedded;
  const available = embeddedWalletReady && pimlicoReady;

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  const send = useCallback(
    async (args: SponsoredWriteArgs): Promise<SponsoredResult> => {
      reset();
      if (!embedded) {
        const e = new Error(
          "Sponsored write requires a Privy embedded wallet (login with email or social).",
        );
        setStatus("error");
        setError(e);
        throw e;
      }
      if (!pimlicoReady) {
        const e = new Error(
          "Sponsored write unavailable — NEXT_PUBLIC_PIMLICO_BUNDLER_URL is not configured.",
        );
        setStatus("error");
        setError(e);
        throw e;
      }

      try {
        setStatus("preparing");
        // Caller passed either pre-encoded data OR abi+functionName+args.
        // Encode locally when needed — relax viem's strict generics with a
        // structural cast since the encoder is happy with runtime values.
        const data =
          "data" in args && args.data
            ? args.data
            : encodeFunctionData({
                abi: args.abi as Abi,
                functionName: args.functionName as string,
                args: (args.args ?? []) as readonly unknown[],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any);

        setStatus("signing");
        // sendSponsoredCall transitions through sign → sponsor → bundle →
        // wait internally. We surface a coarse "confirming" state once the
        // bundler accepts the userOp so the UI can show a spinner.
        const promise = sendSponsoredCall(embedded, {
          to: args.address,
          data,
          value: args.value,
        });
        // Optimistically flip to "confirming" — the dominant time cost is
        // waiting for the bundler receipt, not signing.
        queueMicrotask(() => setStatus("confirming"));

        const receipt = await promise;
        setResult(receipt);
        setStatus("success");
        return receipt;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        setStatus("error");
        throw e;
      }
    },
    [embedded, pimlicoReady, reset],
  );

  return {
    status,
    result,
    error,
    embeddedWalletReady,
    pimlicoReady,
    available,
    send,
    reset,
  };
}
