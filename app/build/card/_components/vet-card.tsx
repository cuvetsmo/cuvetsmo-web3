"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, stringToHex } from "viem";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTRACTS, VET_SBT_CARD_ABI, isReady } from "@/lib/contracts";
import { shortAddress, explorerUrl } from "@/lib/utils";
import { useSponsoredWrite } from "@/lib/use-sponsored-write";
import { useUserAddresses } from "@/lib/use-user-addresses";
import { WhatJustHappened } from "@/components/what-just-happened";

/**
 * Vet SBT Card — claim + view.
 *
 * Two states (UI controlled by `view`):
 *   - "claim": no card yet → form + claim button (with Chula email gate)
 *   - "show": has card → visual card + download + share buttons
 *
 * For Day 1, claim status is derived from cardOf() returning tokenId > 0.
 * If contract not deployed yet, defaults to "claim" state and shows
 * "deploy pending" notice.
 */

const ORG_ID_CUVET = 1n;
const FACULTY_CODE_VET = 1;
const DEPT_CODE_DEFAULT = 1;
const CURRENT_YEAR = new Date().getFullYear();
// VetSBTCard.claim() enforces yearAdmitted ∈ [2500, 2700] (Buddhist Era /
// พ.ศ.). Frontend stores + sends BE throughout — never the Gregorian year.
// e.g. Vet 86 cohort = พ.ศ. 2566 = AD 2023 = (CURRENT_YEAR - 3) + 543.
const BE_OFFSET = 543;
const CURRENT_YEAR_BE = CURRENT_YEAR + BE_OFFSET;

interface CardData {
  studentName: string;
  studentId: string;
  yearAdmitted: number;
  cohort: number; // Vet generation number (e.g. 86)
}

export function VetCardPanel() {
  const { authenticated, login, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const address = embedded?.address ?? user?.wallet?.address;
  const email = user?.email?.address ?? user?.google?.email;

  // C2 (gasless mint) introduced a second address — the Coinbase Smart
  // Account derived from the Privy EOA. If a user claimed via the
  // gasless path, the card lives on the Smart Account, not the EOA.
  // Read BOTH addresses and pick whichever actually holds the card.
  const { smartAccount } = useUserAddresses();

  const contract = CONTRACTS.VET_SBT_CARD;
  const contractReady = isReady(contract);

  const { data: cardOnEoa, refetch: refetchEoa } = useReadContract({
    address: contract,
    abi: VET_SBT_CARD_ABI,
    functionName: "cardOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address && contractReady },
  });

  const { data: cardOnSmartAccount, refetch: refetchSmartAccount } =
    useReadContract({
      address: contract,
      abi: VET_SBT_CARD_ABI,
      functionName: "cardOf",
      args: smartAccount ? [smartAccount] : undefined,
      query: { enabled: !!smartAccount && contractReady },
    });

  function hasCardAt(card: unknown): card is ContractCard {
    return (
      !!card &&
      typeof card === "object" &&
      "tokenId" in card &&
      (card as ContractCard).tokenId !== 0n
    );
  }

  // EOA card wins if present (legacy users with non-gasless claims).
  // Otherwise fall back to the Smart Account card from gasless flows.
  const cardEoaPresent = hasCardAt(cardOnEoa);
  const cardSmartPresent = hasCardAt(cardOnSmartAccount);
  const hasCard = cardEoaPresent || cardSmartPresent;
  const onChainCard = cardEoaPresent ? cardOnEoa : cardOnSmartAccount;
  const cardHolderAddress = cardEoaPresent
    ? (address as string | undefined)
    : (smartAccount as string | undefined);
  const refetch = () => {
    refetchEoa();
    refetchSmartAccount();
  };

  if (!ready) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-[var(--color-muted)]">
          กำลังโหลด Privy...
        </CardContent>
      </Card>
    );
  }

  if (!authenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login ก่อน claim Vet SBT Card</CardTitle>
          <CardDescription>
            ใช้ chula email (@chula.ac.th หรือ @student.chula.ac.th) เพื่อ
            verify นิสิตจุฬาฯ.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={login}>Login ด้วย chula email</Button>
        </CardFooter>
      </Card>
    );
  }

  return hasCard && onChainCard ? (
    <ShowCardView
      address={cardHolderAddress!}
      email={email}
      cardOnChain={onChainCard as ContractCard}
      heldBySmartAccount={!cardEoaPresent && cardSmartPresent}
    />
  ) : (
    <ClaimCardView
      address={address}
      email={email}
      contract={contract}
      contractReady={contractReady}
      onClaimed={() => refetch()}
    />
  );
}

interface ContractCard {
  tokenId: bigint;
  orgId: bigint;
  yearAdmitted: number;
  studentIdHash: `0x${string}`;
  facultyCode: number;
  departmentCode: number;
  mintedAt: bigint;
}

// ─── Claim view ────────────────────────────────────────────────────────
function ClaimCardView({
  address,
  email,
  contract,
  contractReady,
  onClaimed,
}: {
  address: string | undefined;
  email: string | undefined;
  contract: `0x${string}`;
  contractReady: boolean;
  onClaimed: () => void;
}) {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [cohort, setCohort] = useState("86");
  // Buddhist Era · Vet 86 admitted พ.ศ. 2566 (= AD 2023 + 543).
  // Contract reverts InvalidYear() if year is outside [2500, 2700].
  const [yearAdmitted, setYearAdmitted] = useState(
    String(CURRENT_YEAR_BE - 3),
  );

  const emailOk = useMemo(() => {
    if (!email) return false;
    return (
      email.endsWith("@chula.ac.th") ||
      email.endsWith("@student.chula.ac.th")
    );
  }, [email]);

  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Opt-in gas-sponsored mint via Pimlico Smart Account — for first-time
  // users with $0 ETH. When ON, msg.sender becomes the Smart Account, so
  // the card lives at the Smart Account address (not the Privy EOA).
  // The existing panel-level `cardOf(eoa)` read won't see it — we surface
  // the result inline in this view instead.
  const [gaslessMode, setGaslessMode] = useState(false);
  const sponsored = useSponsoredWrite();
  const gaslessBusy =
    sponsored.status === "preparing" ||
    sponsored.status === "signing" ||
    sponsored.status === "confirming";

  const [wjhOpen, setWjhOpen] = useState(false);
  useEffect(() => {
    if (confirmed && txHash) setWjhOpen(true);
  }, [confirmed, txHash]);

  useEffect(() => {
    if (confirmed && typeof window !== "undefined") {
      // Stash local card fields for the SVG renderer once on-chain confirms.
      const cardData: CardData = {
        studentName,
        studentId,
        yearAdmitted: Number(yearAdmitted),
        cohort: Number(cohort),
      };
      try {
        window.localStorage.setItem(
          `cuvetsmo:vetcard:${address?.toLowerCase()}`,
          JSON.stringify(cardData),
        );
      } catch {
        /* quota – ignore */
      }
      onClaimed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed]);

  async function claimGasless() {
    if (!contractReady || !address) return;
    if (!studentName.trim() || !studentId.trim()) return;
    if (!sponsored.available) return;
    sponsored.reset();
    const studentIdHash = keccak256(stringToHex(studentId.trim()));
    try {
      const result = await sponsored.send({
        address: contract,
        abi: VET_SBT_CARD_ABI,
        functionName: "claim",
        args: [
          ORG_ID_CUVET,
          Number(yearAdmitted),
          studentIdHash,
          FACULTY_CODE_VET,
          DEPT_CODE_DEFAULT,
        ],
      });
      // Stash card data keyed by the Smart Account address so a future
      // smart-account-aware reader can render the SVG card without
      // re-prompting the form.
      try {
        window.localStorage.setItem(
          `cuvetsmo:vetcard:${result.smartAccountAddress.toLowerCase()}`,
          JSON.stringify({
            studentName,
            studentId,
            yearAdmitted: Number(yearAdmitted),
            cohort: Number(cohort),
          }),
        );
      } catch {
        /* quota — ignore */
      }
    } catch {
      /* error surfaces via sponsored.error */
    }
  }

  function claim() {
    if (!contractReady || !address) return;
    if (!studentName.trim() || !studentId.trim()) return;
    reset();
    const studentIdHash = keccak256(stringToHex(studentId.trim()));
    writeContract({
      address: contract,
      abi: VET_SBT_CARD_ABI,
      functionName: "claim",
      args: [
        ORG_ID_CUVET,
        Number(yearAdmitted),
        studentIdHash,
        FACULTY_CODE_VET,
        DEPT_CODE_DEFAULT,
      ],
    });
  }

  const formValid = !!studentName.trim() && !!studentId.trim() && emailOk;

  return (
    <Card>
      <CardHeader>
        <Badge tone="brand" className="self-start">
          Claim your Card
        </Badge>
        <CardTitle>Vet SBT Card</CardTitle>
        <CardDescription>
          Soulbound credential ที่พิสูจน์ว่าคุณเป็นนิสิตสัตวแพทย์จุฬาฯ. ย้ายไป
          wallet อื่นไม่ได้ — แต่ไอจีโพสได้.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!contractReady && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs">
            <p className="font-semibold mb-1">Contract deploy pending</p>
            <p className="text-[var(--color-muted)] leading-relaxed">
              VetSBTCard ยังไม่ deploy บน Base Sepolia. กรอกฟอร์มเตรียมไว้ —
              ปุ่ม claim จะ enable หลัง Agent A ลง contract.
            </p>
          </div>
        )}

        <div className="rounded-lg bg-[var(--color-brand-light)] p-3 text-xs">
          <p className="font-semibold mb-1 text-[var(--color-brand)]">
            Chula email gate
          </p>
          {emailOk ? (
            <p className="text-[var(--color-brand)]">
              ✓ Verified: <span className="font-mono">{email}</span>
            </p>
          ) : (
            <p className="text-amber-700">
              ต้อง login ด้วย @chula.ac.th หรือ @student.chula.ac.th —
              ปัจจุบัน:{" "}
              <span className="font-mono">{email ?? "(no email)"}</span>
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="ชื่อ-สกุล / Name"
            id="vet-name"
            value={studentName}
            onChange={setStudentName}
            placeholder="ปาล์ม ดาน้อย"
          />
          <Field
            label="รหัสนิสิต / Student ID"
            id="vet-sid"
            value={studentId}
            onChange={setStudentId}
            placeholder="65XXXXXX21"
            mono
          />
          <Field
            label="รุ่น Vet / Cohort"
            id="vet-cohort"
            value={cohort}
            onChange={setCohort}
            placeholder="86"
            mono
          />
          <Field
            label="ปีที่เข้า / Year admitted (พ.ศ.)"
            id="vet-year"
            value={yearAdmitted}
            onChange={setYearAdmitted}
            placeholder={String(CURRENT_YEAR_BE - 3)}
            mono
          />
        </div>

        <p className="text-xs text-[var(--color-muted)] leading-relaxed">
          Student ID จะถูก hash ก่อนเก็บบน-chain — เลขจริงไม่เปิดเผย, แต่
          verifier เทียบ hash ได้.
        </p>

        {sponsored.available && (
          <label className="flex items-start gap-2 text-xs cursor-pointer select-none rounded-lg border border-dashed border-[var(--color-brand)]/40 bg-[var(--color-brand-light)]/60 p-3">
            <input
              type="checkbox"
              checked={gaslessMode}
              onChange={(e) => setGaslessMode(e.target.checked)}
              disabled={isPending || confirming || gaslessBusy}
              className="mt-0.5 accent-[var(--color-brand)]"
            />
            <span>
              <span className="font-semibold text-[var(--color-brand)]">
                🎁 Gasless mode — claim ฟรี, $0 ETH
              </span>
              <span className="block mt-0.5 text-[var(--color-muted)]">
                Mint ผ่าน Smart Wallet (Pimlico-sponsored) — เหมาะกับนิสิตที่เพิ่งสมัคร wallet ครั้งแรก. การ์ดจะอยู่ใน Smart Account address (ต่างจาก Privy EOA).
              </span>
            </span>
          </label>
        )}
        {isPending && (
          <div className="rounded-lg bg-[var(--color-brand-light)] p-3 text-sm text-[var(--color-brand)]">
            รอ confirm ใน wallet popup...
          </div>
        )}
        {confirming && txHash && (
          <div className="rounded-lg bg-[var(--color-brand-light)] p-3 text-sm text-[var(--color-brand)]">
            รอ block confirm... ({shortAddress(txHash)})
          </div>
        )}
        {gaslessBusy && (
          <div className="rounded-lg bg-[var(--color-brand-light)] p-3 text-sm text-[var(--color-brand)]">
            {sponsored.status === "signing" && "เซ็น UserOp ใน wallet popup..."}
            {sponsored.status === "confirming" && "Pimlico sponsoring + waiting block..."}
            {sponsored.status === "preparing" && "Preparing sponsored userOp..."}
          </div>
        )}
        {sponsored.status === "success" && sponsored.result && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-3 text-sm text-emerald-900 dark:text-emerald-200">
            <p className="font-semibold mb-1">✅ Card minted (gasless)</p>
            <ul className="space-y-1 text-xs">
              <li>
                <span className="text-[var(--color-muted)]">Smart Account:</span>{" "}
                <a
                  href={explorerUrl(sponsored.result.smartAccountAddress, "address")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono underline"
                >
                  {shortAddress(sponsored.result.smartAccountAddress)}
                </a>
              </li>
              <li>
                <span className="text-[var(--color-muted)]">Transaction:</span>{" "}
                <a
                  href={explorerUrl(sponsored.result.txHash, "tx")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono underline"
                >
                  {shortAddress(sponsored.result.txHash)}
                </a>
              </li>
              <li>
                <span className="text-[var(--color-muted)]">Gas paid by you:</span>{" "}
                <span className="font-mono">$0 (Pimlico paymaster)</span>
              </li>
            </ul>
            <p className="mt-2 text-xs leading-snug">
              ✓ การ์ดจะปรากฏใน view ถัดไปอัตโนมัติ (panel จะ refetch จาก Smart Account address).
            </p>
          </div>
        )}
        {sponsored.error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Gasless claim failed: {sponsored.error.message}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            {error.message}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {gaslessMode ? (
          <Button
            onClick={claimGasless}
            disabled={
              !contractReady || !formValid || gaslessBusy || !sponsored.available
            }
            size="lg"
          >
            🎁 Claim FREE (Smart Wallet)
          </Button>
        ) : (
          <Button
            onClick={claim}
            disabled={!contractReady || !formValid || isPending || confirming}
            size="lg"
          >
            Claim my Vet SBT Card
          </Button>
        )}
        {!emailOk && (
          <span className="text-xs text-[var(--color-muted)]">
            Need chula email to claim.
          </span>
        )}
      </CardFooter>
      {confirmed && txHash && (
        <WhatJustHappened
          open={wjhOpen}
          onClose={() => setWjhOpen(false)}
          action="claim"
          txHash={txHash}
          chainId={84532}
          summary="Claim Vet SBT Card สำเร็จ"
        />
      )}
    </Card>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] " +
          (mono ? "font-mono" : "")
        }
      />
    </div>
  );
}

// ─── Show card view ────────────────────────────────────────────────────
function ShowCardView({
  address,
  email,
  cardOnChain,
  heldBySmartAccount,
}: {
  address: string;
  email: string | undefined;
  cardOnChain: ContractCard;
  /** True when this card lives at the user's Smart Account (gasless mint),
   *  not their Privy EOA. Adds a small badge so the user understands why
   *  the displayed wallet differs from their normal connect address. */
  heldBySmartAccount?: boolean;
}) {
  const local = useMemo<CardData | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(
        `cuvetsmo:vetcard:${address.toLowerCase()}`,
      );
      if (!raw) return null;
      return JSON.parse(raw) as CardData;
    } catch {
      return null;
    }
  }, [address]);

  const cardView = {
    studentName: local?.studentName ?? "Vet Student",
    studentId: local?.studentId ?? "—",
    cohort: local?.cohort ?? 86,
    yearAdmitted:
      cardOnChain.yearAdmitted || local?.yearAdmitted || CURRENT_YEAR_BE - 3,
    tokenId: cardOnChain.tokenId,
    mintedAt: cardOnChain.mintedAt,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 self-start">
            <Badge tone="success">Active Card</Badge>
            {heldBySmartAccount && (
              <Badge tone="brand">🎁 Smart Wallet (gasless)</Badge>
            )}
          </div>
          <CardTitle>Vet SBT Card #{cardView.tokenId.toString()}</CardTitle>
          <CardDescription>
            Soulbound — ผูกกับ wallet ของคุณตลอดไป. โชว์ใน IG/LINE ได้เลย.
            {heldBySmartAccount && (
              <span className="block mt-1 text-xs text-[var(--color-muted)]">
                การ์ดนี้อยู่ใน Smart Account address (gasless mint) ไม่ใช่ Privy EOA ของคุณ — นี่คือ wallet
                ที่ Pimlico paymaster ใช้แทนคุณ.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VetCardSvg
            studentName={cardView.studentName}
            cohort={cardView.cohort}
            yearAdmitted={cardView.yearAdmitted}
            tokenId={cardView.tokenId}
            address={address}
          />
        </CardContent>
        <CardFooter>
          <DownloadButton
            studentName={cardView.studentName}
            cohort={cardView.cohort}
            yearAdmitted={cardView.yearAdmitted}
            tokenId={cardView.tokenId}
            address={address}
          />
          <ShareButtons
            studentName={cardView.studentName}
            cohort={cardView.cohort}
          />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">On-chain metadata</CardTitle>
          <CardDescription>
            ตรวจสอบเองได้ผ่าน BaseScan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <KV label="Token ID" value={cardView.tokenId.toString()} mono />
          <KV label="Owner" value={address} mono break />
          <KV
            label="Email"
            value={email ?? "—"}
            mono
          />
          <KV
            label="Year admitted"
            value={String(cardView.yearAdmitted)}
            mono
          />
          <KV
            label="Faculty code"
            value={String(cardOnChain.facultyCode)}
            mono
          />
          <KV
            label="Department code"
            value={String(cardOnChain.departmentCode)}
            mono
          />
          <KV
            label="Minted at"
            value={
              cardView.mintedAt > 0n
                ? new Date(Number(cardView.mintedAt) * 1000).toISOString()
                : "—"
            }
            mono
          />
          <a
            href={explorerUrl(address, "address")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--color-brand)] underline"
          >
            ดู wallet บน BaseScan ↗
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

function KV({
  label,
  value,
  mono,
  break: brk,
}: {
  label: string;
  value: string;
  mono?: boolean;
  break?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
      <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </span>
      <span
        className={
          (mono ? "font-mono " : "") +
          (brk ? "break-all " : "") +
          "text-[var(--color-text)]"
        }
      >
        {value}
      </span>
    </div>
  );
}

// ─── Card SVG (the "อวด IG ได้" moment) ─────────────────────────────────
const CARD_W = 720;
const CARD_H = 440;

interface SvgCardProps {
  studentName: string;
  cohort: number;
  yearAdmitted: number;
  tokenId: bigint;
  address: string;
}

function VetCardSvg(props: SvgCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="rounded-xl overflow-hidden shadow-lg"
        style={{ aspectRatio: `${CARD_W} / ${CARD_H}` }}
      >
        <svg
          viewBox={`0 0 ${CARD_W} ${CARD_H}`}
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-full"
        >
          <VetCardSvgInner {...props} />
        </svg>
      </div>
    </div>
  );
}

function VetCardSvgInner({
  studentName,
  cohort,
  yearAdmitted,
  tokenId,
  address,
}: SvgCardProps) {
  return (
    <>
      <defs>
        <linearGradient id="vetcard-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id="vetcard-stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={CARD_W} height={CARD_H} fill="url(#vetcard-bg)" />
      <rect y={CARD_H - 120} width={CARD_W} height="120" fill="url(#vetcard-stripe)" />

      {/* Brand strip */}
      <text x="40" y="58" fill="#e0f2fe" fontSize="14" letterSpacing="2.4">
        CUVETSMO · WEB3
      </text>
      <text x="40" y="86" fill="#ffffff" fontSize="22" fontWeight="600">
        VET SBT CARD
      </text>

      {/* Token id */}
      <text
        x={CARD_W - 40}
        y="58"
        fill="#e0f2fe"
        fontSize="12"
        letterSpacing="2"
        textAnchor="end"
      >
        TOKEN
      </text>
      <text
        x={CARD_W - 40}
        y="86"
        fill="#ffffff"
        fontSize="22"
        fontFamily="monospace"
        textAnchor="end"
      >
        #{tokenId.toString().padStart(4, "0")}
      </text>

      {/* Name */}
      <text x="40" y="220" fill="#e0f2fe" fontSize="14" letterSpacing="2">
        STUDENT
      </text>
      <text
        x="40"
        y="262"
        fill="#ffffff"
        fontSize="36"
        fontWeight="600"
      >
        {clipText(studentName, 26)}
      </text>

      {/* Stats row */}
      <text x="40" y="320" fill="#e0f2fe" fontSize="12" letterSpacing="2">
        VET {cohort} · FACULTY OF VETERINARY SCIENCE
      </text>
      <text x="40" y="346" fill="#bae6fd" fontSize="12">
        ADMITTED {yearAdmitted} · CHULALONGKORN UNIVERSITY
      </text>

      {/* Wallet */}
      <text x="40" y={CARD_H - 36} fill="#bae6fd" fontSize="11" letterSpacing="1.5">
        WALLET
      </text>
      <text
        x="40"
        y={CARD_H - 18}
        fill="#ffffff"
        fontSize="13"
        fontFamily="monospace"
      >
        {shortAddress(address)}
      </text>

      {/* Footer */}
      <text
        x={CARD_W - 40}
        y={CARD_H - 18}
        fill="#bae6fd"
        fontSize="11"
        textAnchor="end"
        letterSpacing="1.5"
      >
        BASE SEPOLIA · SOULBOUND
      </text>
    </>
  );
}

function clipText(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

// ─── Download as PNG ───────────────────────────────────────────────────
function DownloadButton(props: SvgCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [busy, setBusy] = useState(false);

  async function makePng() {
    setBusy(true);
    try {
      const svgString = buildSvgString(props);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("svg load failed"));
        img.src = svgUrl;
      });

      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = CARD_W * scale;
      canvas.height = CARD_H * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas ctx");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL("image/png");
      URL.revokeObjectURL(svgUrl);

      const a = ref.current ?? document.createElement("a");
      a.href = pngUrl;
      a.download = `vet-sbt-card-${props.tokenId.toString()}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button onClick={makePng} disabled={busy}>
        {busy ? "Generating..." : "Download PNG"}
      </Button>
      <a ref={ref} className="hidden" />
    </>
  );
}

function buildSvgString(props: SvgCardProps): string {
  // Hand-built SVG string (mirrors VetCardSvgInner) so we can rasterize.
  const tokenLabel = `#${props.tokenId.toString().padStart(4, "0")}`;
  const wallet = shortAddress(props.address);
  const name = escapeXml(clipText(props.studentName, 26));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" width="${CARD_W}" height="${CARD_H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </linearGradient>
  </defs>
  <rect width="${CARD_W}" height="${CARD_H}" fill="url(#bg)"/>
  <text x="40" y="58" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="14" letter-spacing="2.4">CUVETSMO · WEB3</text>
  <text x="40" y="86" fill="#ffffff" font-family="system-ui, sans-serif" font-size="22" font-weight="600">VET SBT CARD</text>
  <text x="${CARD_W - 40}" y="58" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="12" text-anchor="end" letter-spacing="2">TOKEN</text>
  <text x="${CARD_W - 40}" y="86" fill="#ffffff" font-family="monospace" font-size="22" text-anchor="end">${tokenLabel}</text>
  <text x="40" y="220" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="14" letter-spacing="2">STUDENT</text>
  <text x="40" y="262" fill="#ffffff" font-family="system-ui, sans-serif" font-size="36" font-weight="600">${name}</text>
  <text x="40" y="320" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="12" letter-spacing="2">VET ${props.cohort} · FACULTY OF VETERINARY SCIENCE</text>
  <text x="40" y="346" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="12">ADMITTED ${props.yearAdmitted} · CHULALONGKORN UNIVERSITY</text>
  <text x="40" y="${CARD_H - 36}" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="11" letter-spacing="1.5">WALLET</text>
  <text x="40" y="${CARD_H - 18}" fill="#ffffff" font-family="monospace" font-size="13">${wallet}</text>
  <text x="${CARD_W - 40}" y="${CARD_H - 18}" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="11" text-anchor="end" letter-spacing="1.5">BASE SEPOLIA · SOULBOUND</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─── Share ─────────────────────────────────────────────────────────────
function ShareButtons({
  studentName,
  cohort,
}: {
  studentName: string;
  cohort: number;
}) {
  const text = `เพิ่งได้ Vet SBT Card 🎓 ${studentName} · Vet ${cohort} · CU. ลอง mint ของคุณที่ CUVETSMO Web3`;

  function shareNative() {
    if (typeof navigator === "undefined" || !navigator.share) {
      // fallback: copy
      navigator.clipboard?.writeText(text);
      return;
    }
    navigator.share({
      title: "Vet SBT Card",
      text,
      url:
        typeof window !== "undefined"
          ? `${window.location.origin}/build/card`
          : "https://web3.cuvetsmo.com/build/card",
    });
  }

  const lineUrl = encodeURIComponent(
    typeof window !== "undefined"
      ? `${window.location.origin}/build/card`
      : "https://web3.cuvetsmo.com/build/card",
  );
  const lineText = encodeURIComponent(text);

  return (
    <>
      <Button variant="outline" onClick={shareNative}>
        Share to IG
      </Button>
      <a
        href={`https://line.me/R/msg/text/?${lineText}%20${lineUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline">Share to LINE</Button>
      </a>
    </>
  );
}
