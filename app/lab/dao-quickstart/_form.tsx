"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { isAddress as viemIsAddress } from "viem";
import { CONTRACTS } from "@/lib/contracts";
import { GOVERNOR_FACTORY_ABI } from "../_lib/abis";
import { useDeployTracker } from "../_lib/use-deploy-tracker";
import { DeployProgress } from "../_components/deploy-progress";
import { ConnectGate } from "../_components/connect-gate";
import { Field, Input } from "../_components/form-field";
import { Button } from "@/components/ui/button";

type Mode = "snapshot" | "onchain";

const ZERO = "0x0000000000000000000000000000000000000000";

export function DaoQuickstartForm() {
  const [mode, setMode] = useState<Mode>("snapshot");

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-2 mb-6">
        <ModeCard
          active={mode === "snapshot"}
          onClick={() => setMode("snapshot")}
          title="Snapshot mode"
          tag="Recommended"
          tagTone="success"
          description="Off-chain voting, ฟรี, ไม่ต้อง deploy contract, เหมาะกับชมรม"
        />
        <ModeCard
          active={mode === "onchain"}
          onClick={() => setMode("onchain")}
          title="On-chain Governor"
          tag="Advanced"
          tagTone="warning"
          description="Deploy OZ Governor contract — ใช้ token voting, ต้องมี voting token"
        />
      </div>

      {mode === "snapshot" ? <SnapshotPanel /> : <GovernorPanel />}
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  title,
  description,
  tag,
  tagTone,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
  tag?: string;
  tagTone?: "success" | "warning";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border p-4 transition-colors ${
        active
          ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]"
          : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-brand)]"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold">{title}</span>
        {tag && (
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
              tagTone === "warning"
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {tag}
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--color-muted)] leading-relaxed">
        {description}
      </p>
    </button>
  );
}

function SnapshotPanel() {
  const [spaceName, setSpaceName] = useState("");
  const [groupHandle, setGroupHandle] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const slugged = (spaceName || "your-dao")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <div className="grid gap-4 sm:gap-5">
      <Field
        label="DAO / Space name"
        hint="ชื่อที่ใช้บน Snapshot (เช่น CUVET DAO, JohnJud DAO)"
        htmlFor="snap-name"
      >
        <Input
          id="snap-name"
          type="text"
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
          placeholder="CUVET DAO"
        />
      </Field>

      <Field
        label="Group/club handle (optional)"
        hint="Twitter หรือ IG handle (จะใส่ใน space metadata ได้)"
        htmlFor="snap-handle"
      >
        <Input
          id="snap-handle"
          type="text"
          value={groupHandle}
          onChange={(e) => setGroupHandle(e.target.value)}
          placeholder="@cuvetsmo"
        />
      </Field>

      <Field
        label="First proposal title (optional)"
        hint="ลองคิด proposal แรก · เช่น 'เลือก theme งาน Vet to Be 2026'"
        htmlFor="snap-prop"
      >
        <Input
          id="snap-prop"
          type="text"
          value={proposalTitle}
          onChange={(e) => setProposalTitle(e.target.value)}
          placeholder="ลองคิดดู..."
        />
      </Field>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <h3 className="text-base font-semibold mb-3">
          🚀 ขั้นตอน (3 ขั้น)
        </h3>
        <ol className="space-y-3 text-sm text-[var(--color-text)] leading-relaxed">
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-brand)] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span>
              เปิด{" "}
              <a
                href="https://snapshot.box"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-brand)] hover:underline font-medium"
              >
                snapshot.box ↗
              </a>{" "}
              · เชื่อม wallet ของกลุ่ม
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-brand)] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>
              สร้าง space ใหม่ · ใส่ slug{" "}
              <code className="px-1 py-0.5 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)] font-mono text-xs">
                {slugged}.eth
              </code>{" "}
              (ต้องมี ENS — หรือใช้แบบ ipfs hash)
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-brand)] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span>
              ตั้ง voting strategy เป็น{" "}
              <code className="px-1 py-0.5 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)] font-mono text-xs">
                whitelist
              </code>{" "}
              สำหรับ members ของชมรม หรือ{" "}
              <code className="px-1 py-0.5 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)] font-mono text-xs">
                erc721-balance
              </code>{" "}
              ถ้าใช้ Vet SBT Card เป็น token เกณฑ์การ vote
            </span>
          </li>
        </ol>
      </section>

      <a
        href="https://snapshot.box"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-brand text-sm text-center"
      >
        เปิด Snapshot ↗
      </a>

      <p className="text-xs text-[var(--color-muted)] leading-relaxed">
        🛈 Snapshot เป็น signature-based voting (gasless) · ทำงานบน mainnet
        เก็บ proposal ลง IPFS · vote ไม่ใช้แก๊ส. เหมาะมากกับชมรมที่อยากให้
        สมาชิกทุกคน vote ได้โดยไม่ต้องจ่ายค่า tx.
      </p>
    </div>
  );
}

function GovernorPanel() {
  const { address } = useAccount();
  const [daoName, setDaoName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [thresholdPct, setThresholdPct] = useState("4");
  const [votingPeriodDays, setVotingPeriodDays] = useState("3");
  const [touched, setTouched] = useState(false);

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();
  const step = useDeployTracker({ txHash, isPending, writeError });

  const factoryReady = CONTRACTS.GOVERNOR_FACTORY !== ZERO;

  const tokenError =
    touched && !viemIsAddress(tokenAddress)
      ? "ใส่ address ของ voting token (ERC-20Votes ที่มีอยู่ หรือสร้างก่อนจาก Token Forge)"
      : undefined;
  const nameError = touched && !daoName.trim() ? "ต้องใส่ชื่อ DAO" : undefined;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!viemIsAddress(tokenAddress) || !daoName.trim() || !address) return;

    writeContract({
      address: CONTRACTS.GOVERNOR_FACTORY,
      abi: GOVERNOR_FACTORY_ABI,
      functionName: "createGovernor",
      args: [tokenAddress as `0x${string}`, daoName.trim()],
    });
  }

  return (
    <ConnectGate>
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 p-3 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
        ⚠️ <span className="font-semibold">Advanced + unaudited</span> ·
        Governor contracts ยังไม่ผ่าน audit · production deploy มีความเสี่ยง ·
        แนะนำให้ใช้ Snapshot mode ก่อน. การ submit ฟอร์มนี้ส่ง request ไปที่
        GovernorFactory stub (ยังไม่ deploy contract จริงในเฟส 1 — Wave 3
        จะ wire ของจริง).
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:gap-5">
        <Field label="DAO name" required error={nameError} htmlFor="gov-name">
          <Input
            id="gov-name"
            type="text"
            value={daoName}
            onChange={(e) => setDaoName(e.target.value)}
            placeholder="CUVET Governance DAO"
            disabled={isPending}
          />
        </Field>

        <Field
          label="Voting token address"
          hint="ต้องเป็น ERC-20Votes · สร้างใหม่ที่ Token Forge หรือใส่ existing"
          required
          error={tokenError}
          htmlFor="gov-token"
        >
          <Input
            id="gov-token"
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value.trim())}
            placeholder="0x..."
            className="font-mono text-xs"
            disabled={isPending}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <Field
            label="Proposal threshold %"
            hint="ต้องถือ token ≥ % นี้ของ supply ถึงจะเปิด proposal ได้"
            htmlFor="gov-thresh"
          >
            <Input
              id="gov-thresh"
              type="number"
              min={0}
              max={100}
              value={thresholdPct}
              onChange={(e) => setThresholdPct(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field
            label="Voting period (days)"
            hint="แต่ละ proposal โหวตได้กี่วัน"
            htmlFor="gov-period"
          >
            <Input
              id="gov-period"
              type="number"
              min={1}
              max={30}
              value={votingPeriodDays}
              onChange={(e) => setVotingPeriodDays(e.target.value)}
              disabled={isPending}
            />
          </Field>
        </div>

        {!factoryReady && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
            ⏳ GovernorFactory ยังไม่ deploy · ปุ่ม submit จะปิดไว้.
          </p>
        )}

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={!factoryReady || isPending || step.kind === "confirming"}
        >
          {isPending || step.kind === "confirming"
            ? "Submitting request..."
            : "Submit Governor request"}
        </Button>

        {step.kind !== "idle" && <DeployProgress step={step} />}

        {step.kind === "success" && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-3 text-sm text-emerald-900 dark:text-emerald-200">
            <p className="font-semibold mb-1">✓ Request submitted</p>
            <p className="text-xs leading-relaxed">
              GovernorFactory บันทึก request ของคุณแล้ว · Wave 3 จะ batch
              deploy Governor contracts จาก request queue. Snapshot ใช้ได้
              เลยระหว่างรอ.
            </p>
            <button
              type="button"
              onClick={() => {
                reset();
                setDaoName("");
                setTokenAddress("");
                setTouched(false);
              }}
              className="mt-2 text-xs underline"
            >
              ส่ง request อีก
            </button>
          </div>
        )}
      </form>
    </ConnectGate>
  );
}
