"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useSignTypedData } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import type { Address } from "viem";
import { shortAddress } from "@/lib/utils";

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

interface PollVote {
  voter: Address;
  optionId: string;
  signature: string;
  signedAt: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: Address | "system";
  createdAt: number;
  votes: PollVote[];
}

const STORAGE_KEY = "cuvetsmo:play:polls:v1";

const SEED_POLLS: Poll[] = [
  {
    id: "p1",
    question: "ปี 4 วิชาไหนหนักที่สุด?",
    createdBy: "system",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    votes: [],
    options: [
      { id: "p1-a", label: "Pharmacology", votes: 0 },
      { id: "p1-b", label: "Repro", votes: 0 },
      { id: "p1-c", label: "Pathology", votes: 0 },
      { id: "p1-d", label: "Internal Medicine", votes: 0 },
    ],
  },
  {
    id: "p2",
    question: "อยากเห็น feature ไหนใน web3.cuvetsmo เพิ่ม?",
    createdBy: "system",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    votes: [],
    options: [
      { id: "p2-a", label: "Quest ผ่าน 5 ปี crew", votes: 0 },
      { id: "p2-b", label: "ตลาด NFT case studies", votes: 0 },
      { id: "p2-c", label: "DAO โหวตงบกิจกรรม", votes: 0 },
      { id: "p2-d", label: "POAP ทุกกิจกรรม SMO", votes: 0 },
    ],
  },
];

const POLL_DOMAIN = {
  name: "web3.cuvetsmo",
  version: "1",
  chainId: baseSepolia.id,
} as const;

const POLL_TYPES = {
  Vote: [
    { name: "pollId", type: "string" },
    { name: "optionId", type: "string" },
    { name: "voter", type: "address" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

function loadPolls(): Poll[] {
  if (typeof window === "undefined") return SEED_POLLS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_POLLS;
    const parsed = JSON.parse(raw) as Poll[];
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_POLLS;
    return parsed;
  } catch {
    return SEED_POLLS;
  }
}

function savePolls(polls: Poll[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
  } catch {
    // best-effort
  }
}

export function Polls() {
  const { ready, authenticated, login } = usePrivy();
  const { address: walletAddress } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const [polls, setPolls] = useState<Poll[]>(() =>
    typeof window === "undefined" ? SEED_POLLS : loadPolls(),
  );
  const [showCreate, setShowCreate] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPolls(loadPolls());
  }, []);

  useEffect(() => {
    savePolls(polls);
  }, [polls]);

  async function castVote(pollId: string, optionId: string) {
    if (!walletAddress) return;
    if (!authenticated) {
      login();
      return;
    }
    setSigningId(`${pollId}:${optionId}`);
    setError(null);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await signTypedDataAsync({
        domain: POLL_DOMAIN,
        types: POLL_TYPES,
        primaryType: "Vote",
        message: {
          pollId,
          optionId,
          voter: walletAddress,
          timestamp: BigInt(timestamp),
        },
      });

      setPolls((prev) =>
        prev.map((poll) => {
          if (poll.id !== pollId) return poll;
          // Remove previous vote from same voter, if any
          const cleaned = poll.votes.filter(
            (v) => v.voter.toLowerCase() !== walletAddress.toLowerCase(),
          );
          const newVote: PollVote = {
            voter: walletAddress,
            optionId,
            signature,
            signedAt: Date.now(),
          };
          const nextVotes = [...cleaned, newVote];
          // Recompute counts from scratch
          const optionCounts = new Map<string, number>();
          for (const v of nextVotes) {
            optionCounts.set(v.optionId, (optionCounts.get(v.optionId) ?? 0) + 1);
          }
          return {
            ...poll,
            votes: nextVotes,
            options: poll.options.map((o) => ({
              ...o,
              votes: optionCounts.get(o.id) ?? 0,
            })),
          };
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setSigningId(null);
    }
  }

  function addPoll(poll: Poll) {
    setPolls((prev) => [poll, ...prev]);
    setShowCreate(false);
  }

  if (!ready) {
    return (
      <p className="text-sm text-[var(--color-muted)]">Loading wallet...</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--color-muted)]">
          Polls signed off-chain (EIP-712) · ไม่เสีย gas · vote ของคุณยืนยันได้
          cryptographically.
        </p>
        <button
          type="button"
          onClick={() => {
            if (!authenticated) {
              login();
              return;
            }
            setShowCreate((v) => !v);
          }}
          className="btn-outline text-sm shrink-0"
        >
          {showCreate ? "Cancel" : "Create poll"}
        </button>
      </div>

      {showCreate && walletAddress && (
        <CreatePollForm
          creator={walletAddress}
          onCreate={addPoll}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 font-mono">
          {error}
        </p>
      )}

      <ul className="space-y-4">
        {polls.map((poll) => (
          <li key={poll.id}>
            <PollCard
              poll={poll}
              walletAddress={walletAddress}
              authenticated={authenticated}
              busyKey={signingId}
              onVote={castVote}
              onLogin={login}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PollCard({
  poll,
  walletAddress,
  authenticated,
  busyKey,
  onVote,
  onLogin,
}: {
  poll: Poll;
  walletAddress: Address | undefined;
  authenticated: boolean;
  busyKey: string | null;
  onVote: (pollId: string, optionId: string) => void;
  onLogin: () => void;
}) {
  const totalVotes = useMemo(
    () => poll.options.reduce((sum, o) => sum + o.votes, 0),
    [poll.options],
  );
  const myVote = useMemo(
    () =>
      walletAddress
        ? poll.votes.find(
            (v) => v.voter.toLowerCase() === walletAddress.toLowerCase(),
          )?.optionId
        : undefined,
    [poll.votes, walletAddress],
  );

  return (
    <div className="card !p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug">
          {poll.question}
        </h3>
        <span className="text-[11px] text-[var(--color-muted)] font-mono shrink-0">
          {totalVotes} votes
        </span>
      </div>

      <ul className="space-y-2">
        {poll.options.map((option) => {
          const pct =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isMine = myVote === option.id;
          const busy = busyKey === `${poll.id}:${option.id}`;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => {
                  if (!authenticated) onLogin();
                  else onVote(poll.id, option.id);
                }}
                disabled={busy}
                className={`relative w-full text-left rounded-lg border transition-colors overflow-hidden ${
                  isMine
                    ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]/40"
                    : "border-[var(--color-border)] hover:border-[var(--color-brand)]/60"
                } ${busy ? "opacity-60" : ""}`}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-[var(--color-brand)]/10"
                  style={{ width: `${pct}%` }}
                />
                <span className="relative flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    {isMine && (
                      <span className="text-[var(--color-brand)]" aria-hidden>
                        ✓
                      </span>
                    )}
                    <span>{option.label}</span>
                  </span>
                  <span className="font-mono text-xs text-[var(--color-muted)]">
                    {pct}% · {option.votes}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-[var(--color-muted)]">
        Created by{" "}
        {poll.createdBy === "system"
          ? "CUVETSMO"
          : shortAddress(poll.createdBy as string)}{" "}
        · {new Date(poll.createdAt).toLocaleDateString("th-TH")}
        {myVote && " · คุณโหวตแล้ว · เปลี่ยนใจได้โดยคลิก option ใหม่"}
      </p>
    </div>
  );
}

function CreatePollForm({
  creator,
  onCreate,
  onCancel,
}: {
  creator: Address;
  onCreate: (poll: Poll) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [opts, setOpts] = useState<string[]>(["", ""]);

  const valid =
    question.trim().length > 0 &&
    opts.filter((o) => o.trim().length > 0).length >= 2;

  function submit() {
    if (!valid) return;
    const cleanOpts = opts
      .map((o, i) => ({ id: `o${i}-${Date.now()}`, label: o.trim(), votes: 0 }))
      .filter((o) => o.label.length > 0);
    onCreate({
      id: `p-${Date.now()}`,
      question: question.trim(),
      options: cleanOpts,
      createdBy: creator,
      createdAt: Date.now(),
      votes: [],
    });
  }

  return (
    <div className="card !p-4 space-y-3 border-2 border-[var(--color-brand)]/50">
      <h4 className="text-sm font-semibold">Create a poll</h4>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value.slice(0, 140))}
        placeholder="คำถาม..."
        className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-light)]"
      />
      <div className="space-y-2">
        {opts.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const v = e.target.value.slice(0, 80);
                setOpts((prev) => prev.map((o, idx) => (idx === i ? v : o)));
              }}
              placeholder={`Option ${i + 1}`}
              className="flex-1 px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-light)]"
            />
            {opts.length > 2 && (
              <button
                type="button"
                onClick={() =>
                  setOpts((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="text-xs text-red-600 dark:text-red-400 px-2"
              >
                ลบ
              </button>
            )}
          </div>
        ))}
        {opts.length < 8 && (
          <button
            type="button"
            onClick={() => setOpts((prev) => [...prev, ""])}
            className="text-xs text-[var(--color-brand)] hover:underline"
          >
            + เพิ่ม option
          </button>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onCancel} className="btn-outline text-sm">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!valid}
          className="btn-brand text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publish poll
        </button>
      </div>
      <p className="text-[11px] text-[var(--color-muted)]">
        Day 1: polls เก็บใน browser localStorage · Phase 2 จะย้ายไป Supabase
        + cross-device sync.
      </p>
    </div>
  );
}
