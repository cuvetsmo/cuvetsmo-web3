"use client";

import { cn } from "@/lib/utils";
import { explorerUrl } from "@/lib/utils";

export type DeployStep =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "pending"; txHash: `0x${string}` }
  | { kind: "confirming"; txHash: `0x${string}` }
  | {
      kind: "success";
      txHash: `0x${string}`;
      deployedAddress?: `0x${string}`;
      message?: string;
    }
  | { kind: "error"; message: string };

/**
 * Vertical progress panel showing 3 deploy stages.
 * Plug in `step` from a wagmi `useWriteContract` + `useWaitForTransactionReceipt`.
 */
export function DeployProgress({ step }: { step: DeployStep }) {
  const stages: Array<{
    key: string;
    label: string;
    active: boolean;
    done: boolean;
  }> = [
    {
      key: "submit",
      label: "ส่ง transaction ไปยัง wallet",
      active: step.kind === "submitting",
      done: ["pending", "confirming", "success"].includes(step.kind),
    },
    {
      key: "mine",
      label: "Deploy ลง Base Sepolia · รอ block",
      active: step.kind === "pending" || step.kind === "confirming",
      done: step.kind === "success",
    },
    {
      key: "live",
      label: "Live!",
      active: false,
      done: step.kind === "success",
    },
  ];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <ol className="space-y-3">
        {stages.map((stage) => (
          <li key={stage.key} className="flex items-start gap-3">
            <span
              className={cn(
                "shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold",
                stage.done
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : stage.active
                    ? "border-[var(--color-brand)] text-[var(--color-brand)] animate-pulse"
                    : "border-[var(--color-border)] text-[var(--color-muted)]",
              )}
            >
              {stage.done ? "✓" : ""}
            </span>
            <span
              className={cn(
                "text-sm",
                stage.done
                  ? "text-[var(--color-text)] font-medium"
                  : stage.active
                    ? "text-[var(--color-brand)] font-medium"
                    : "text-[var(--color-muted)]",
              )}
            >
              {stage.label}
            </span>
          </li>
        ))}
      </ol>

      {(step.kind === "pending" ||
        step.kind === "confirming" ||
        step.kind === "success") &&
        "txHash" in step && (
          <p className="mt-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]">
            tx:{" "}
            <a
              href={explorerUrl(step.txHash, "tx")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[var(--color-brand)] hover:underline break-all"
            >
              {step.txHash.slice(0, 10)}...{step.txHash.slice(-8)}
            </a>
          </p>
        )}

      {step.kind === "success" && step.deployedAddress && (
        <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3">
          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
            ✅ Deployed at
          </p>
          <a
            href={explorerUrl(step.deployedAddress, "address")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-emerald-700 dark:text-emerald-300 hover:underline break-all"
          >
            {step.deployedAddress}
          </a>
        </div>
      )}

      {step.kind === "error" && (
        <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-xs text-red-800 dark:text-red-300 leading-relaxed">
          ⚠️ {step.message}
        </div>
      )}
    </div>
  );
}
