"use client";

import { useMemo, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { isAddress as viemIsAddress } from "viem";
import { CONTRACTS } from "@/lib/contracts";
import { SBT_FACTORY_ABI, NFT_IMPLEMENTATION_ABI } from "../_lib/abis";
import { pinFile, pinJSON } from "../_lib/pinata";
import { useDeployTracker } from "../_lib/use-deploy-tracker";
import { DeployProgress } from "../_components/deploy-progress";
import { ConnectGate } from "../_components/connect-gate";
import { Field, Input, Textarea, Toggle } from "../_components/form-field";
import { Button } from "@/components/ui/button";
import { explorerUrl } from "@/lib/utils";

const ZERO = "0x0000000000000000000000000000000000000000";

interface FormState {
  name: string;
  symbol: string;
  description: string;
  image: File | null;
  maxSupply: string;
  recipients: string;
}

const DEFAULTS: FormState = {
  name: "",
  symbol: "",
  description: "",
  image: null,
  maxSupply: "100",
  recipients: "",
};

export function SbtMakerForm() {
  const { address } = useAccount();
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [progressLabel, setProgressLabel] = useState<string>();
  const [deployedAddress, setDeployedAddress] =
    useState<`0x${string}` | null>(null);
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>();
  const [mintProgress, setMintProgress] = useState<string | null>(null);

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();
  const step = useDeployTracker({ txHash, isPending, writeError });

  const mintWrite = useWriteContract();
  const mintTracker = useDeployTracker({
    txHash: mintTxHash,
    isPending: mintWrite.isPending,
    writeError: mintWrite.error,
  });

  const factoryReady = CONTRACTS.SBT_FACTORY !== ZERO;
  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  const parsedRecipients = useMemo(
    () => parseCsv(form.recipients),
    [form.recipients],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || !factoryReady || !address) return;

    setUploading(true);
    setUploadError(undefined);
    try {
      let imageIpfs = "";
      if (form.image) {
        setProgressLabel("📤 Pinning badge image to IPFS...");
        const imgPin = await pinFile(form.image);
        imageIpfs = imgPin.ipfs;
      }

      setProgressLabel("📝 Pinning badge metadata...");
      const metadata = {
        name: form.name,
        description: form.description,
        image: imageIpfs,
        attributes: [
          { trait_type: "Type", value: "Soulbound" },
          { trait_type: "Issued via", value: "web3.cuvetsmo.com — SBT Maker" },
        ],
      };
      const metaPin = await pinJSON(metadata);
      const baseURI = `ipfs://${metaPin.cid}/`;
      const maxSupply = BigInt(Number(form.maxSupply));

      setProgressLabel("🚀 Deploying SBT contract...");
      writeContract({
        address: CONTRACTS.SBT_FACTORY,
        abi: SBT_FACTORY_ABI,
        functionName: "createSBTCollection",
        args: [form.name.trim(), form.symbol.trim().toUpperCase(), baseURI, maxSupply],
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      setProgressLabel(undefined);
    }
  }

  // Capture deployed address from step (success path)
  if (step.kind === "success" && step.deployedAddress && !deployedAddress) {
    setDeployedAddress(step.deployedAddress);
  }

  async function onBulkMint() {
    if (!deployedAddress) return;
    const valid = parsedRecipients.filter((r) => r.valid).map((r) => r.address!);
    if (valid.length === 0) return;

    setMintProgress(`Minting to ${valid.length} addresses... (1/${valid.length})`);
    // Sequential mints — owner only. For day-1 we do it one tx at a time so
    // we get clean per-tx UX. v2 will batch via a mintBatch helper.
    for (let i = 0; i < valid.length; i++) {
      setMintProgress(`Minting to ${valid.length} addresses... (${i + 1}/${valid.length})`);
      try {
        const hash = await mintWrite.writeContractAsync({
          address: deployedAddress,
          abi: NFT_IMPLEMENTATION_ABI,
          functionName: "mint",
          args: [valid[i]],
        });
        setMintTxHash(hash);
      } catch {
        setMintProgress(`❌ หยุดที่ #${i + 1} · user reject หรือ tx fail`);
        return;
      }
    }
    setMintProgress(`✅ Minted ${valid.length} badges!`);
  }

  // Render success / mint phase
  if (step.kind === "success" && deployedAddress) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-800 p-6 sm:p-7">
        <p className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wide mb-4">
          ✓ SBT contract deployed
        </p>
        <h3 className="text-2xl font-bold tracking-tight mb-1">
          {form.name} ({form.symbol})
        </h3>
        <p className="text-sm text-[var(--color-muted)] mb-5 font-mono break-all">
          {deployedAddress}{" "}
          <a
            href={explorerUrl(deployedAddress, "address")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brand)] hover:underline"
          >
            ↗
          </a>
        </p>

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 mb-4">
          <h4 className="text-sm font-semibold mb-1">
            Mint to recipients ({parsedRecipients.filter((r) => r.valid).length}{" "}
            valid)
          </h4>
          <p className="text-xs text-[var(--color-muted)] mb-3">
            Mint สำเร็จแล้วจะติด wallet ผู้รับถาวร (โอนไม่ได้)
          </p>
          <Button
            type="button"
            variant="brand"
            size="md"
            onClick={onBulkMint}
            disabled={
              parsedRecipients.filter((r) => r.valid).length === 0 ||
              mintWrite.isPending
            }
          >
            {mintWrite.isPending
              ? "Minting..."
              : `🎖️ Mint ${parsedRecipients.filter((r) => r.valid).length} badges`}
          </Button>
          {mintProgress && (
            <p className="mt-3 text-xs text-[var(--color-brand)]">
              {mintProgress}
            </p>
          )}
          {mintTracker.kind !== "idle" && mintTracker.kind !== "success" && (
            <div className="mt-3">
              <DeployProgress step={mintTracker} />
            </div>
          )}
        </section>

        <Button
          variant="outline"
          size="md"
          onClick={() => {
            reset();
            setForm(DEFAULTS);
            setTouched(false);
            setDeployedAddress(null);
            setMintProgress(null);
          }}
        >
          Deploy another SBT
        </Button>
      </div>
    );
  }

  return (
    <ConnectGate>
      <form onSubmit={onSubmit} className="grid gap-4 sm:gap-5">
        <Toggle
          checked
          onChange={() => {}}
          label="Soulbound · transfer ห้าม"
          description="คุณกำลังออก SBT · โทเค็นจะ lock กับ wallet ผู้รับถาวร (toggle นี้ล็อกไว้สำหรับ SBT Maker)"
          disabled
        />

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <Field
            label="SBT name"
            required
            error={touched ? errors.name : undefined}
            htmlFor="sbt-name"
          >
            <Input
              id="sbt-name"
              type="text"
              maxLength={50}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="CUVET Hackathon 2025"
              disabled={uploading || isPending}
            />
          </Field>
          <Field
            label="Symbol"
            required
            error={touched ? errors.symbol : undefined}
            htmlFor="sbt-sym"
          >
            <Input
              id="sbt-sym"
              type="text"
              maxLength={10}
              value={form.symbol}
              onChange={(e) =>
                set("symbol", e.target.value.toUpperCase().slice(0, 10))
              }
              placeholder="CHACK25"
              disabled={uploading || isPending}
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="sbt-desc">
          <Textarea
            id="sbt-desc"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="ออกให้ผู้เข้าร่วม Hackathon 2025..."
            disabled={uploading || isPending}
          />
        </Field>

        <Field
          label="Badge image (jpg/png/webp)"
          hint="1 รูป ใช้กับทุก SBT ใน collection · สูงสุด 5 MB"
          htmlFor="sbt-img"
        >
          <input
            id="sbt-img"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => set("image", e.target.files?.[0] ?? null)}
            disabled={uploading || isPending}
            className="block w-full text-sm text-[var(--color-muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-brand-light)] file:text-[var(--color-brand)] file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer"
          />
          {form.image && (
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              🖼 {form.image.name}
            </p>
          )}
        </Field>

        <Field
          label="Max supply"
          hint="จำนวนผู้รับสูงสุด (0 = unlimited)"
          error={touched ? errors.maxSupply : undefined}
          htmlFor="sbt-max"
        >
          <Input
            id="sbt-max"
            type="number"
            min={0}
            value={form.maxSupply}
            onChange={(e) => set("maxSupply", e.target.value)}
            disabled={uploading || isPending}
          />
        </Field>

        <Field
          label="Recipient wallets (CSV)"
          hint={`วาง wallet addresses 1 ต่อบรรทัด หรือคั่นด้วย comma · ${parsedRecipients.filter((r) => r.valid).length} valid / ${parsedRecipients.length} total`}
          error={touched ? errors.recipients : undefined}
          htmlFor="sbt-rec"
        >
          <Textarea
            id="sbt-rec"
            className="font-mono text-xs"
            placeholder={"0xabc123...\n0xdef456..."}
            value={form.recipients}
            onChange={(e) => set("recipients", e.target.value)}
            disabled={uploading || isPending}
          />
        </Field>

        {parsedRecipients.length > 0 && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 max-h-32 overflow-auto text-xs font-mono">
            {parsedRecipients.slice(0, 50).map((r, i) => (
              <p
                key={i}
                className={
                  r.valid ? "text-[var(--color-text)]" : "text-red-500"
                }
              >
                {r.valid ? "✓" : "✗"} {r.raw}
              </p>
            ))}
            {parsedRecipients.length > 50 && (
              <p className="text-[var(--color-muted)]">
                ...และอีก {parsedRecipients.length - 50} แถว
              </p>
            )}
          </div>
        )}

        {!factoryReady && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
            ⏳ SBTFactory ยังไม่ deploy · ปุ่ม Deploy จะปิดไว้.
          </p>
        )}

        {uploadError && (
          <p className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 px-3 py-2 text-xs text-red-800 dark:text-red-300">
            ⚠️ {uploadError}
          </p>
        )}

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={
            !factoryReady ||
            uploading ||
            isPending ||
            step.kind === "confirming" ||
            (touched && hasErrors)
          }
        >
          {uploading
            ? progressLabel ?? "Pinning..."
            : isPending || step.kind === "confirming"
              ? "Deploying..."
              : "🚀 Deploy SBT contract"}
        </Button>

        <p className="text-xs text-[var(--color-muted)] -mt-1">
          🛈 หลัง deploy แล้วจะมีปุ่ม &ldquo;Mint to recipients&rdquo; เพื่อ
          bulk-mint ตาม CSV (sequential tx · คุณยืนยันต่อรายการใน wallet)
        </p>

        {step.kind !== "idle" && <DeployProgress step={step} />}
      </form>
    </ConnectGate>
  );
}

function parseCsv(
  s: string,
): { raw: string; valid: boolean; address?: `0x${string}` }[] {
  if (!s.trim()) return [];
  const tokens = s
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return tokens.map((raw) => {
    if (viemIsAddress(raw)) {
      return { raw, valid: true, address: raw as `0x${string}` };
    }
    return { raw, valid: false };
  });
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!form.name.trim()) e.name = "ต้องใส่ชื่อ";
  if (!form.symbol.trim() || form.symbol.length < 3) e.symbol = "อย่างน้อย 3 ตัว";
  const max = Number(form.maxSupply);
  if (!Number.isFinite(max) || max < 0) e.maxSupply = "ตัวเลข ≥ 0";
  return e;
}
