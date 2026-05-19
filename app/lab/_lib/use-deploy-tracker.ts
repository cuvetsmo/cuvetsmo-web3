"use client";

import { useMemo } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import type { DeployStep } from "../_components/deploy-progress";

/**
 * Translates a wagmi `useWriteContract` + receipt watcher into a
 * `DeployStep` discriminated union, plus extracts the deployed clone
 * address from a known event topic (factories emit indexed `*Created`
 * events with the clone address as topic[2]).
 *
 * Pure derivation via useMemo — no setState in an effect, so the
 * react-compiler lint is happy.
 *
 * Usage:
 *   const { writeContract, data: txHash, isPending, error } = useWriteContract();
 *   const step = useDeployTracker({ txHash, isPending, writeError: error });
 *   <DeployProgress step={step} />
 */
export function useDeployTracker(opts: {
  txHash?: `0x${string}`;
  isPending: boolean;
  writeError?: Error | null;
}): DeployStep {
  const receipt = useWaitForTransactionReceipt({ hash: opts.txHash });

  const deployedAddress = useMemo<`0x${string}` | undefined>(() => {
    if (!receipt.data || receipt.data.status !== "success") return undefined;
    for (const log of receipt.data.logs) {
      if (log.topics.length >= 3 && log.topics[2]) {
        const topic = log.topics[2];
        if (topic.length >= 42) {
          return ("0x" + topic.slice(-40)) as `0x${string}`;
        }
      }
    }
    return undefined;
  }, [receipt.data]);

  return useMemo<DeployStep>(() => {
    if (opts.writeError) {
      const message = opts.writeError.message ?? "Transaction rejected";
      return {
        kind: "error",
        message: message.length > 240 ? message.slice(0, 240) + "..." : message,
      };
    }
    if (opts.isPending) {
      return { kind: "submitting" };
    }
    if (!opts.txHash) {
      return { kind: "idle" };
    }
    if (receipt.isLoading) {
      return { kind: "confirming", txHash: opts.txHash };
    }
    if (receipt.isError) {
      return {
        kind: "error",
        message: receipt.error?.message?.slice(0, 240) ?? "Tx failed to confirm",
      };
    }
    if (receipt.data) {
      if (receipt.data.status === "success") {
        return {
          kind: "success",
          txHash: opts.txHash,
          deployedAddress,
        };
      }
      return { kind: "error", message: "Transaction reverted" };
    }
    return { kind: "pending", txHash: opts.txHash };
  }, [
    opts.isPending,
    opts.txHash,
    opts.writeError,
    receipt.isLoading,
    receipt.isError,
    receipt.error,
    receipt.data,
    deployedAddress,
  ]);
}
