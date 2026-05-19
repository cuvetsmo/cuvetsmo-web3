"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { TOKEN_FACTORY_ABI } from "../_lib/abis";
import { useDeployTracker } from "../_lib/use-deploy-tracker";
import { DeployProgress } from "../_components/deploy-progress";
import { ConnectGate } from "../_components/connect-gate";
import { Field, Input, Toggle } from "../_components/form-field";
import { Button } from "@/components/ui/button";
import { WhatJustHappened } from "@/components/what-just-happened";

const ZERO = "0x0000000000000000000000000000000000000000";

interface FormState {
  name: string;
  symbol: string;
  supply: string;
  decimals: string;
  mintable: boolean;
  burnable: boolean;
}

const DEFAULTS: FormState = {
  name: "",
  symbol: "",
  supply: "1000000",
  decimals: "18",
  mintable: true,
  burnable: true,
};

export function TokenForgeForm() {
  const { address } = useAccount();
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [touched, setTouched] = useState(false);
  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const step = useDeployTracker({ txHash, isPending, writeError });

  const [wjhOpen, setWjhOpen] = useState(false);
  useEffect(() => {
    if (step.kind === "success" && txHash) setWjhOpen(true);
  }, [step.kind, txHash]);

  const factoryAddress = CONTRACTS.TOKEN_FACTORY;
  const factoryReady = factoryAddress !== ZERO;

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || !factoryReady || !address) return;

    const decimals = Number(form.decimals);
    const supplyWei = parseUnits(form.supply.replace(/,/g, ""), decimals);

    writeContract({
      address: factoryAddress,
      abi: TOKEN_FACTORY_ABI,
      functionName: "createToken",
      args: [form.name.trim(), form.symbol.trim().toUpperCase(), supplyWei],
    });
  }

  // Render result after success
  if (step.kind === "success" && step.deployedAddress) {
    return (
      <>
        <SuccessPanel
          deployedAddress={step.deployedAddress}
          tokenName={form.name}
          tokenSymbol={form.symbol.toUpperCase()}
          supply={form.supply}
          onReset={() => {
            reset();
            setForm(DEFAULTS);
            setTouched(false);
            setWjhOpen(false);
          }}
        />
        {txHash && (
          <WhatJustHappened
            open={wjhOpen}
            onClose={() => setWjhOpen(false)}
            action="deploy"
            txHash={txHash}
            chainId={84532}
            summary={`Deploy ${form.symbol.toUpperCase()} token สำเร็จ`}
          />
        )}
      </>
    );
  }

  return (
    <ConnectGate>
      <form onSubmit={onSubmit} className="grid gap-4 sm:gap-5">
        <Field
          label="Token name · ชื่อเหรียญ"
          required
          hint="เช่น PupCoin, CUVET Reward, GreenPaws Token (สูงสุด 50 ตัวอักษร)"
          error={touched ? errors.name : undefined}
          htmlFor="tf-name"
        >
          <Input
            id="tf-name"
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="PupCoin"
            maxLength={50}
            disabled={isPending || step.kind === "confirming"}
          />
        </Field>

        <Field
          label="Symbol · ticker"
          required
          hint="3-10 ตัวอักษร ใหญ่ทั้งหมด เช่น PUP, CVET"
          error={touched ? errors.symbol : undefined}
          htmlFor="tf-symbol"
        >
          <Input
            id="tf-symbol"
            type="text"
            value={form.symbol}
            onChange={(e) =>
              set("symbol", e.target.value.toUpperCase().slice(0, 10))
            }
            placeholder="PUP"
            maxLength={10}
            disabled={isPending || step.kind === "confirming"}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <Field
            label="Total supply · จำนวนทั้งหมด"
            required
            hint="default 1,000,000 (1 ล้าน)"
            error={touched ? errors.supply : undefined}
            htmlFor="tf-supply"
          >
            <Input
              id="tf-supply"
              type="text"
              inputMode="numeric"
              value={form.supply}
              onChange={(e) =>
                set("supply", e.target.value.replace(/[^0-9,]/g, ""))
              }
              placeholder="1000000"
              disabled={isPending || step.kind === "confirming"}
            />
          </Field>

          <Field
            label="Decimals"
            hint="default 18 (เหมือน ETH/USDC ส่วนใหญ่)"
            error={touched ? errors.decimals : undefined}
            htmlFor="tf-decimals"
          >
            <Input
              id="tf-decimals"
              type="number"
              min={0}
              max={18}
              value={form.decimals}
              onChange={(e) => set("decimals", e.target.value)}
              disabled={isPending || step.kind === "confirming"}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Toggle
            checked={form.mintable}
            onChange={(v) => set("mintable", v)}
            label="Mintable later"
            description="ออก token เพิ่มได้ภายหลัง (ต้องเป็น owner)"
            disabled={isPending || step.kind === "confirming"}
          />
          <Toggle
            checked={form.burnable}
            onChange={(v) => set("burnable", v)}
            label="Burnable"
            description="โทเค็นนี้เผาทิ้งได้ (lower supply)"
            disabled={isPending || step.kind === "confirming"}
          />
        </div>

        <p className="text-xs text-[var(--color-muted)] leading-relaxed -mt-1">
          🛈 Note: implementation ปัจจุบัน mint supply ครั้งเดียวให้คุณ + burn
          เปิดใช้งานอัตโนมัติ. Flags อื่นๆ จะเปิดใช้ในเวอร์ชัน v2.
        </p>

        {!factoryReady && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
            ⏳ TokenFactory ยังไม่ deploy — ปุ่ม Deploy จะปิดไว้จนกว่า Agent A
            จะ wire address.
          </p>
        )}

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={
            !factoryReady ||
            isPending ||
            step.kind === "confirming" ||
            (touched && hasErrors)
          }
        >
          {isPending || step.kind === "confirming"
            ? "Deploying..."
            : "🚀 Deploy token"}
        </Button>

        {step.kind !== "idle" && <DeployProgress step={step} />}

        <p className="text-xs text-center text-[var(--color-muted)] mt-1">
          ก่อน deploy ดูข้อมูลให้แน่ใจ — ทำซ้ำหรือเปลี่ยนไม่ได้หลัง deploy.
        </p>
      </form>
    </ConnectGate>
  );
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!form.name.trim()) e.name = "ต้องใส่ชื่อ token";
  if (form.name.length > 50) e.name = "ยาวเกินไป (สูงสุด 50)";
  if (!form.symbol.trim()) e.symbol = "ต้องใส่ symbol";
  if (form.symbol.length < 3) e.symbol = "อย่างน้อย 3 ตัวอักษร";
  if (!/^[A-Z0-9]+$/.test(form.symbol))
    e.symbol = "ใช้ได้เฉพาะตัวอักษรอังกฤษใหญ่ + ตัวเลข";
  const supplyNum = Number(form.supply.replace(/,/g, ""));
  if (!form.supply || !Number.isFinite(supplyNum) || supplyNum <= 0)
    e.supply = "supply ต้องเป็นจำนวนเต็มบวก";
  const dec = Number(form.decimals);
  if (!Number.isFinite(dec) || dec < 0 || dec > 18)
    e.decimals = "decimals ต้องอยู่ระหว่าง 0-18";
  return e;
}

function SuccessPanel({
  deployedAddress,
  tokenName,
  tokenSymbol,
  supply,
  onReset,
}: {
  deployedAddress: `0x${string}`;
  tokenName: string;
  tokenSymbol: string;
  supply: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-800 p-6 sm:p-7">
      <p className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wide mb-4">
        ✓ Deployed — Live
      </p>
      <h3 className="text-2xl font-bold tracking-tight mb-2">
        {tokenName} ({tokenSymbol})
      </h3>
      <p className="text-sm text-[var(--color-muted)] mb-5">
        Supply เริ่มต้น {Number(supply.replace(/,/g, "")).toLocaleString()}{" "}
        {tokenSymbol} อยู่ใน wallet ของคุณแล้ว.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <Stat label="Contract" mono value={short(deployedAddress)} />
        <Stat label="Holders" value="1" />
        <Stat label="Network" value="Base Sepolia" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/lab/token-forge/${deployedAddress}`}
          className="btn-brand text-sm inline-flex items-center"
        >
          เปิด token page (share URL) →
        </Link>
        <a
          href={`https://sepolia.basescan.org/address/${deployedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline text-sm"
        >
          View on BaseScan ↗
        </a>
        <Button variant="ghost" size="md" onClick={onReset}>
          Deploy another
        </Button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm font-medium text-[var(--color-text)] ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function short(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
