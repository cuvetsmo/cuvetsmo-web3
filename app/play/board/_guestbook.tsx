"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import type { Address, Hash } from "viem";
import { explorerUrl, shortAddress } from "@/lib/utils";
import { ContractPending } from "../_components/contract-pending";
import { PLAY_ADDRESSES, isLive } from "../_lib/addresses";
import { GUESTBOOK_ABI } from "../_lib/abis";

interface Entry {
  sender: Address;
  message: string;
  timestamp: number;
  txHash?: string;
}

const MESSAGE_MAX = 280;
const HISTORY_LIMIT = 50;
const LOOKBACK_BLOCKS = BigInt(10_000);
const ZERO_BIG = BigInt(0);

export function Guestbook() {
  const { ready, authenticated, login } = usePrivy();
  const { address: walletAddress } = useAccount();
  const publicClient = usePublicClient();

  const [draft, setDraft] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | undefined>(undefined);

  const live = isLive(PLAY_ADDRESSES.GUESTBOOK);

  const { writeContractAsync, isPending: signing } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: txHash });

  // Initial history fetch
  useEffect(() => {
    if (!publicClient || !live) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const latest = await publicClient.getBlockNumber();
        const fromBlock =
          latest > LOOKBACK_BLOCKS ? latest - LOOKBACK_BLOCKS : ZERO_BIG;

        const logs = await publicClient.getContractEvents({
          address: PLAY_ADDRESSES.GUESTBOOK,
          abi: GUESTBOOK_ABI,
          eventName: "MessagePosted",
          fromBlock,
          toBlock: latest,
        });

        const list: Entry[] = logs
          .map((l) => {
            const args = l.args as {
              sender?: Address;
              message?: string;
              timestamp?: bigint;
            };
            return {
              sender: args.sender as Address,
              message: args.message ?? "",
              timestamp: Number(args.timestamp ?? ZERO_BIG) * 1000,
              txHash: l.transactionHash,
            };
          })
          .reverse()
          .slice(0, HISTORY_LIMIT);

        if (!cancelled) {
          setEntries(list);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load guestbook",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, live]);

  // Live watch
  useWatchContractEvent({
    address: live ? PLAY_ADDRESSES.GUESTBOOK : undefined,
    abi: GUESTBOOK_ABI,
    eventName: "MessagePosted",
    onLogs: (logs) => {
      const incoming: Entry[] = logs.map((l) => {
        const args = l.args as {
          sender?: Address;
          message?: string;
          timestamp?: bigint;
        };
        return {
          sender: args.sender as Address,
          message: args.message ?? "",
          timestamp: Number(args.timestamp ?? ZERO_BIG) * 1000,
          txHash: l.transactionHash,
        };
      });
      setEntries((prev) => {
        const merged = [...incoming.reverse(), ...prev];
        // Dedupe by txHash
        const seen = new Set<string>();
        return merged
          .filter((e) => {
            const key = e.txHash || `${e.sender}-${e.timestamp}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, HISTORY_LIMIT);
      });
    },
  });

  useEffect(() => {
    if (receipt.isSuccess) {
      setDraft("");
      setTxHash(undefined);
    }
  }, [receipt.isSuccess]);

  const canSubmit = useMemo(
    () =>
      ready &&
      authenticated &&
      live &&
      draft.trim().length > 0 &&
      draft.length <= MESSAGE_MAX &&
      !signing &&
      !receipt.isLoading,
    [
      ready,
      authenticated,
      live,
      draft,
      signing,
      receipt.isLoading,
    ],
  );

  async function handlePost() {
    if (!canSubmit) return;
    setError(null);
    try {
      const hash = await writeContractAsync({
        address: PLAY_ADDRESSES.GUESTBOOK,
        abi: GUESTBOOK_ABI,
        functionName: "post",
        args: [draft.trim()],
      });
      setTxHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Post failed");
    }
  }

  return (
    <div className="space-y-6">
      {/* Composer */}
      <div className="card space-y-3">
        {!live && <ContractPending contractName="Guestbook" />}

        <label htmlFor="gb-msg" className="sr-only">
          Message
        </label>
        <textarea
          id="gb-msg"
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MESSAGE_MAX))}
          maxLength={MESSAGE_MAX}
          rows={3}
          placeholder="ทักทายชุมชน · 280 ตัวอักษร · ไม่มีการแก้ไขหลังโพสต์"
          disabled={!ready || !live}
          className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] resize-none focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-light)] disabled:opacity-50"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[var(--color-muted)]">
            {draft.length} / {MESSAGE_MAX} ·{" "}
            {walletAddress && (
              <span className="font-mono">{shortAddress(walletAddress)}</span>
            )}
          </p>
          {!authenticated ? (
            <button onClick={login} className="btn-brand text-sm">
              Connect to sign
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePost}
              disabled={!canSubmit}
              className="btn-brand text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signing && "Sign in wallet..."}
              {!signing && receipt.isLoading && "Mining..."}
              {!signing && !receipt.isLoading && "Sign + Post"}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-mono">
            {error}
          </p>
        )}
        {receipt.isSuccess && (
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            โพสต์สำเร็จ! ข้อความถูกบันทึก on-chain ถาวร.
          </p>
        )}
      </div>

      {/* Counter */}
      <p className="text-sm text-[var(--color-muted)]">
        <span className="font-semibold text-[var(--color-text)]">
          {entries.length}
        </span>{" "}
        ข้อความบน Base Sepolia.
      </p>

      {/* Wall */}
      {!live ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-muted)]">
          Guestbook contract กำลังถูก deploy.
        </div>
      ) : loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="h-20 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] animate-pulse"
            />
          ))}
        </ul>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-muted)]">
          ยังไม่มีข้อความ · เป็นคนแรกที่เซ็น!
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry, idx) => (
            <li
              key={`${entry.txHash || idx}-${entry.timestamp}`}
              className="card !p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5 text-xs text-[var(--color-muted)]">
                <span className="font-mono">
                  {shortAddress(entry.sender)}
                </span>
                <span>{formatTime(entry.timestamp)}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {entry.message}
              </p>
              {entry.txHash && (
                <a
                  href={explorerUrl(entry.txHash, "tx")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-[11px] font-mono text-[var(--color-brand)] hover:underline"
                >
                  ↗ view on BaseScan
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatTime(ms: number): string {
  if (!ms) return "";
  const date = new Date(ms);
  const now = Date.now();
  const diffMin = Math.round((now - ms) / 60_000);
  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffMin < 60 * 24) return `${Math.round(diffMin / 60)} ชั่วโมงที่แล้ว`;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
