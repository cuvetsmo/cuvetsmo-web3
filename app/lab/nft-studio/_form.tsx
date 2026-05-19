"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { NFT_FACTORY_ABI } from "../_lib/abis";
import { pinFile, pinJSON } from "../_lib/pinata";
import { useDeployTracker } from "../_lib/use-deploy-tracker";
import { DeployProgress } from "../_components/deploy-progress";
import { ConnectGate } from "../_components/connect-gate";
import { Field, Input, Textarea } from "../_components/form-field";
import { Button } from "@/components/ui/button";
import { explorerUrl } from "@/lib/utils";

const ZERO = "0x0000000000000000000000000000000000000000";

type Mode = "1of1" | "collection";

interface FormState {
  mode: Mode;
  name: string;
  symbol: string;
  description: string;
  maxSupply: string;
  maxPerWallet: string;
  royaltyPct: string;
  files: File[];
}

const DEFAULTS: FormState = {
  mode: "1of1",
  name: "",
  symbol: "",
  description: "",
  maxSupply: "1",
  maxPerWallet: "1",
  royaltyPct: "5",
  files: [],
};

export function NftStudioForm() {
  const { address } = useAccount();
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [uploadProgress, setUploadProgress] = useState<string | undefined>();
  const [deployed, setDeployed] =
    useState<{ address: `0x${string}`; baseURI: string } | null>(null);

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();
  const step = useDeployTracker({ txHash, isPending, writeError });

  const factoryReady = CONTRACTS.NFT_FACTORY !== ZERO;
  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    const filtered = list.filter((f) =>
      ["image/png", "image/jpeg", "image/webp"].includes(f.type),
    );
    if (form.mode === "1of1" && filtered.length > 0) {
      set("files", filtered.slice(0, 1));
    } else {
      set("files", filtered);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || !factoryReady || !address) return;

    setUploading(true);
    setUploadError(undefined);

    try {
      setUploadProgress("📤 Pinning images to IPFS...");
      const imageResults: { cid: string; url: string; ipfs: string }[] = [];
      for (let i = 0; i < form.files.length; i++) {
        setUploadProgress(
          `📤 Pinning image ${i + 1}/${form.files.length} to IPFS...`,
        );
        const r = await pinFile(form.files[i]);
        imageResults.push({ cid: r.cid, url: r.url, ipfs: r.ipfs });
      }

      setUploadProgress("📝 Pinning metadata JSON...");
      // Pin per-token metadata. We pin each token's JSON individually then
      // use the first metadata's CID as a single-file base + tokenId convention.
      // For day-1 simple flow: pin one collection-metadata JSON that includes
      // an `images[]` array, set baseURI to its CID + "/" + tokenId convention.
      const metas: string[] = [];
      for (let i = 0; i < imageResults.length; i++) {
        const meta = {
          name: form.mode === "1of1" ? form.name : `${form.name} #${i + 1}`,
          description: form.description,
          image: imageResults[i].ipfs,
          attributes: [
            { trait_type: "Collection", value: form.name },
            { trait_type: "Created via", value: "CUVETSMO Web3 — The Lab" },
          ],
        };
        const r = await pinJSON(meta);
        metas.push(r.cid);
      }

      // For tokenURI we need baseURI such that `<baseURI><tokenId>` resolves.
      // We pin a small manifest that lists the per-token metadata CIDs and
      // use ipfs:// + manifestCid + "/" as the baseURI when the implementation
      // appends tokenId. To keep day-1 minimal: pin a directory-style JSON map.
      const manifest = {
        name: form.name,
        symbol: form.symbol,
        description: form.description,
        royaltyPct: Number(form.royaltyPct),
        items: metas.map((cid, i) => ({
          tokenId: i + 1,
          metadataCid: cid,
          image: imageResults[i]?.ipfs,
        })),
      };
      const manifestPin = await pinJSON(manifest);

      // Note: NFTImplementation tokenURI = baseURI + tokenId. Without a true
      // IPFS directory we pass a gateway-prefixed baseURI that points to the
      // manifest. Marketplaces may not resolve perfectly — Lab v2 will pin a
      // proper directory CID.
      const baseURI = `ipfs://${manifestPin.cid}/`;

      setUploadProgress("🚀 Submitting deploy tx...");
      const maxSupply = BigInt(Number(form.maxSupply));

      writeContract({
        address: CONTRACTS.NFT_FACTORY,
        abi: NFT_FACTORY_ABI,
        functionName: "createCollection",
        args: [form.name.trim(), form.symbol.trim().toUpperCase(), baseURI, maxSupply],
      });

      // Stash baseURI for the success panel; actual deployed address arrives
      // through useDeployTracker via the event log topic.
      setDeployed({ address: ZERO as `0x${string}`, baseURI });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      setUploadProgress(undefined);
    }
  }

  if (step.kind === "success" && step.deployedAddress) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-800 p-6 sm:p-7">
        <p className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wide mb-4">
          ✓ Collection Live!
        </p>
        <h3 className="text-2xl font-bold tracking-tight mb-2">
          {form.name} ({form.symbol})
        </h3>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          {form.mode === "1of1"
            ? "1/1 NFT deployed."
            : `Collection of up to ${form.maxSupply} NFTs deployed.`}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <a
            href={explorerUrl(step.deployedAddress, "address")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand text-sm text-center"
          >
            View on BaseScan ↗
          </a>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              reset();
              setForm(DEFAULTS);
              setTouched(false);
              setDeployed(null);
            }}
          >
            Deploy another
          </Button>
        </div>
        {deployed && (
          <p className="text-xs text-[var(--color-muted)] font-mono break-all">
            baseURI: {deployed.baseURI}
          </p>
        )}
        <p className="mt-3 text-xs text-[var(--color-muted)] leading-relaxed">
          🛈 Royalty {form.royaltyPct}% เป็นข้อมูล metadata (EIP-2981
          enforcement ขึ้นกับ marketplace) · Lab v2 จะ deploy contract
          ที่ enforce royalty บน-chain.
        </p>
      </div>
    );
  }

  return (
    <ConnectGate>
      <form onSubmit={onSubmit} className="grid gap-4 sm:gap-5">
        <Field label="Mode" required hint="เลือกประเภท drop">
          <div className="grid sm:grid-cols-2 gap-2">
            <ModeOption
              value="1of1"
              current={form.mode}
              onClick={(v) => set("mode", v)}
              title="1/1 Art"
              description="NFT ชิ้นเดียว · mint ทันทีลง wallet ของคุณ"
            />
            <ModeOption
              value="collection"
              current={form.mode}
              onClick={(v) => set("mode", v)}
              title="Quick collection"
              description="หลายรูปขึ้นเป็น collection · เลือก max supply"
            />
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <Field
            label="Collection name"
            required
            error={touched ? errors.name : undefined}
            htmlFor="nft-name"
          >
            <Input
              id="nft-name"
              type="text"
              maxLength={50}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="My Cool NFTs"
              disabled={uploading || isPending}
            />
          </Field>
          <Field
            label="Symbol"
            required
            error={touched ? errors.symbol : undefined}
            htmlFor="nft-symbol"
          >
            <Input
              id="nft-symbol"
              type="text"
              maxLength={10}
              value={form.symbol}
              onChange={(e) =>
                set("symbol", e.target.value.toUpperCase().slice(0, 10))
              }
              placeholder="MCN"
              disabled={uploading || isPending}
            />
          </Field>
        </div>

        <Field
          label="Description"
          hint="คำอธิบาย collection (optional)"
          htmlFor="nft-desc"
        >
          <Textarea
            id="nft-desc"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A series of..."
            disabled={uploading || isPending}
          />
        </Field>

        <Field
          label={form.mode === "1of1" ? "Image (jpg/png/webp)" : "Images (multi)"}
          required
          error={touched ? errors.files : undefined}
          hint={
            form.mode === "1of1"
              ? "1 รูป · สูงสุด 5 MB"
              : `${form.files.length} รูป pinned · เปลี่ยน max supply ให้ตรง`
          }
          htmlFor="nft-files"
        >
          <input
            id="nft-files"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple={form.mode === "collection"}
            onChange={onFilesChange}
            disabled={uploading || isPending}
            className="block w-full text-sm text-[var(--color-muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-brand-light)] file:text-[var(--color-brand)] file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer disabled:cursor-not-allowed"
          />
        </Field>

        {form.files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.files.slice(0, 8).map((f) => (
              <span
                key={f.name + f.size}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)] text-xs"
              >
                🖼 {f.name}
              </span>
            ))}
            {form.files.length > 8 && (
              <span className="px-2 py-1 rounded bg-[var(--color-border)] text-xs text-[var(--color-muted)]">
                +{form.files.length - 8} more
              </span>
            )}
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
          <Field
            label="Max supply"
            required
            error={touched ? errors.maxSupply : undefined}
            htmlFor="nft-max"
            hint="0 = unlimited"
          >
            <Input
              id="nft-max"
              type="number"
              min={0}
              value={form.maxSupply}
              onChange={(e) => set("maxSupply", e.target.value)}
              disabled={uploading || isPending}
            />
          </Field>
          <Field label="Max per wallet" htmlFor="nft-perwallet">
            <Input
              id="nft-perwallet"
              type="number"
              min={1}
              value={form.maxPerWallet}
              onChange={(e) => set("maxPerWallet", e.target.value)}
              disabled={uploading || isPending}
            />
          </Field>
          <Field
            label="Royalty %"
            hint="EIP-2981 metadata"
            htmlFor="nft-royalty"
          >
            <Input
              id="nft-royalty"
              type="number"
              min={0}
              max={20}
              value={form.royaltyPct}
              onChange={(e) => set("royaltyPct", e.target.value)}
              disabled={uploading || isPending}
            />
          </Field>
        </div>

        <p className="text-xs text-[var(--color-muted)] leading-relaxed">
          🛈 Note: implementation v1 รองรับ name/symbol/baseURI/maxSupply ·
          max-per-wallet + royalty enforce ใน v2.
        </p>

        {!factoryReady && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
            ⏳ NFTFactory ยังไม่ deploy · ปุ่ม Deploy จะปิดไว้.
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
            ? uploadProgress ?? "Pinning to IPFS..."
            : isPending || step.kind === "confirming"
              ? "Deploying..."
              : "🚀 Pin to IPFS + Deploy"}
        </Button>

        {step.kind !== "idle" && <DeployProgress step={step} />}
      </form>
    </ConnectGate>
  );
}

function ModeOption({
  value,
  current,
  onClick,
  title,
  description,
}: {
  value: Mode;
  current: Mode;
  onClick: (v: Mode) => void;
  title: string;
  description: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`rounded-lg border p-3 text-left transition-colors ${
        active
          ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]"
          : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-brand)]"
      }`}
    >
      <span className="block text-sm font-semibold mb-0.5">{title}</span>
      <span className="block text-xs text-[var(--color-muted)] leading-relaxed">
        {description}
      </span>
    </button>
  );
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!form.name.trim()) e.name = "ต้องใส่ชื่อ";
  if (!form.symbol.trim() || form.symbol.length < 3) e.symbol = "อย่างน้อย 3 ตัว";
  if (form.files.length === 0) e.files = "อัปโหลดอย่างน้อย 1 รูป";
  if (form.mode === "1of1" && form.files.length > 1)
    e.files = "1/1 mode รับแค่ 1 รูป";
  const max = Number(form.maxSupply);
  if (!Number.isFinite(max) || max < 0) e.maxSupply = "ตัวเลข ≥ 0";
  if (form.mode === "collection" && max > 0 && form.files.length > max)
    e.files = `รูปเกิน max supply (${max})`;
  return e;
}
