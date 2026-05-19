"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import type { Address, Hash } from "viem";
import { isAddress, shortAddress } from "@/lib/utils";
import { DropZone } from "../_components/drop-zone";
import { ContractPending } from "../_components/contract-pending";
import { TxReceiptPanel } from "../_components/tx-receipt-panel";
import { WhatJustHappened } from "@/components/what-just-happened";
import { PLAY_ADDRESSES, isLive } from "../_lib/addresses";
import { NFT_FACTORY_ABI, SBT_FACTORY_ABI } from "../_lib/abis";
import {
  DAILY_MINT_LIMIT,
  recordMint,
  remainingMints,
} from "../_lib/daily-quota";

type MintType = "nft" | "sbt";

interface MintMetadata {
  cid: string;
  url: string;
  ipfs: string;
}

const NAME_MAX = 50;
const DESC_MAX = 280;

export function MintForm() {
  const { ready, authenticated, login, user } = usePrivy();
  const { address: walletAddress } = useAccount();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MintType>("nft");
  const [recipientMode, setRecipientMode] = useState<"self" | "other">("self");
  const [customRecipient, setCustomRecipient] = useState("");

  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "uploading" }
    | { kind: "signing" }
    | { kind: "mining"; hash: Hash }
    | { kind: "done"; hash: Hash; contract: Address; tokenId?: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const [remaining, setRemaining] = useState<number>(DAILY_MINT_LIMIT);
  const [wjhOpen, setWjhOpen] = useState(false);

  const userAddress = (user?.wallet?.address || walletAddress) as
    | Address
    | undefined;

  useEffect(() => {
    if (userAddress) setRemaining(remainingMints(userAddress));
  }, [userAddress, status]);

  // Preview URL lifecycle
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const targetContract = type === "nft" ? PLAY_ADDRESSES.NFT_FACTORY : PLAY_ADDRESSES.SBT_FACTORY;
  const contractName = type === "nft" ? "NFTFactory" : "SBTFactory";
  const contractLive = isLive(targetContract);

  const recipient: Address | undefined = useMemo(() => {
    if (recipientMode === "self") return userAddress;
    if (isAddress(customRecipient)) return customRecipient;
    return undefined;
  }, [recipientMode, customRecipient, userAddress]);

  const { writeContractAsync } = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash: status.kind === "mining" ? status.hash : undefined,
  });

  useEffect(() => {
    if (status.kind !== "mining") return;
    if (receipt.isSuccess && receipt.data) {
      // Look for Minted/SoulboundMinted log to extract tokenId
      let tokenId: string | undefined;
      try {
        const log = receipt.data.logs.find(
          (l) => l.address.toLowerCase() === targetContract.toLowerCase(),
        );
        if (log && log.topics?.[2]) {
          tokenId = BigInt(log.topics[2]).toString();
        }
      } catch {
        // ignore — tokenId is best-effort decode
      }
      if (userAddress) recordMint(userAddress);
      setStatus({
        kind: "done",
        hash: status.hash,
        contract: targetContract,
        tokenId,
      });
      setWjhOpen(true);
    } else if (receipt.isError) {
      setStatus({
        kind: "error",
        message: receipt.error?.message || "Transaction reverted",
      });
    }
  }, [receipt.isSuccess, receipt.isError, receipt.data, receipt.error, status, targetContract, userAddress]);

  const canSubmit =
    ready &&
    authenticated &&
    !!file &&
    name.trim().length > 0 &&
    name.length <= NAME_MAX &&
    description.length <= DESC_MAX &&
    !!recipient &&
    contractLive &&
    remaining > 0 &&
    (status.kind === "idle" || status.kind === "done" || status.kind === "error");

  const onFile = useCallback((f: File) => {
    setFile(f);
    setStatus({ kind: "idle" });
  }, []);

  async function uploadToPinata(): Promise<MintMetadata> {
    if (!file) throw new Error("No file");

    // 1. Upload image
    const form = new FormData();
    form.append("file", file);
    const imgRes = await fetch("/api/pinata/upload", {
      method: "POST",
      body: form,
    });
    if (!imgRes.ok) {
      const j = (await imgRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(j.error || "Image upload failed");
    }
    const img = (await imgRes.json()) as MintMetadata;

    // 2. Upload metadata JSON pointing to image
    const metadata = {
      name: name.trim(),
      description: description.trim(),
      image: img.ipfs,
      attributes: [
        { trait_type: "Type", value: type === "nft" ? "NFT" : "Soulbound" },
        { trait_type: "Minted on", value: "web3.cuvetsmo.com" },
        { trait_type: "Network", value: "Base Sepolia" },
      ],
    };
    const metaRes = await fetch("/api/pinata/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    });
    if (!metaRes.ok) {
      const j = (await metaRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(j.error || "Metadata upload failed");
    }
    return (await metaRes.json()) as MintMetadata;
  }

  async function handleMint() {
    if (!canSubmit || !recipient) return;
    try {
      setStatus({ kind: "uploading" });
      const metadata = await uploadToPinata();

      setStatus({ kind: "signing" });
      const hash = await writeContractAsync({
        address: targetContract,
        abi: type === "nft" ? NFT_FACTORY_ABI : SBT_FACTORY_ABI,
        functionName: type === "nft" ? "mintTo" : "mintSoulboundTo",
        args: [recipient, metadata.ipfs],
      });
      setStatus({ kind: "mining", hash });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error during mint";
      setStatus({ kind: "error", message });
    }
  }

  // ─────────── Render ───────────

  if (!ready) {
    return (
      <div className="card text-center text-sm text-[var(--color-muted)]">
        Loading wallet...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="card text-center">
        <p className="font-semibold mb-1">Connect wallet เพื่อเริ่ม mint</p>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          ใช้อีเมล chula.ac.th หรือ wallet ที่มีอยู่ · เริ่ม mint ได้ฟรี
        </p>
        <button onClick={login} className="btn-brand">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quota badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] font-medium">
          เหลือ mint วันนี้: {remaining} / {DAILY_MINT_LIMIT}
        </span>
        {userAddress && (
          <span className="font-mono text-[var(--color-muted)]">
            {shortAddress(userAddress)}
          </span>
        )}
      </div>

      {/* Contract pending state */}
      {!contractLive && <ContractPending contractName={contractName} />}

      {/* Drop zone */}
      <DropZone onFile={onFile} previewUrl={previewUrl} disabled={!contractLive} />

      {/* Form fields */}
      {file && (
        <div className="card space-y-5">
          <div>
            <label
              htmlFor="mint-name"
              className="block text-sm font-medium mb-1.5"
            >
              ชื่อ · Name <span className="text-red-500">*</span>
            </label>
            <input
              id="mint-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
              maxLength={NAME_MAX}
              placeholder="My first NFT"
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-light)]"
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {name.length} / {NAME_MAX}
            </p>
          </div>

          <div>
            <label
              htmlFor="mint-desc"
              className="block text-sm font-medium mb-1.5"
            >
              คำอธิบาย · Description{" "}
              <span className="text-[var(--color-muted)] text-xs">(optional)</span>
            </label>
            <textarea
              id="mint-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
              maxLength={DESC_MAX}
              rows={3}
              placeholder="เรื่องราวเบื้องหลังผลงานนี้..."
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-light)] resize-none"
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {description.length} / {DESC_MAX}
            </p>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium mb-2">
              ประเภท · Type
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <RadioCard
                checked={type === "nft"}
                onClick={() => setType("nft")}
                title="NFT"
                subtitle="โอนได้ · transferable"
                hint="ERC-721 · ส่งต่อ/ขายได้"
              />
              <RadioCard
                checked={type === "sbt"}
                onClick={() => setType("sbt")}
                title="SBT"
                subtitle="ห้ามโอน · soulbound"
                hint="ติด wallet ตลอดไป · เช่น ประกาศนียบัตร"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="block text-sm font-medium mb-2">
              ผู้รับ · Recipient
            </legend>
            <div className="space-y-2">
              <RadioRow
                checked={recipientMode === "self"}
                onChange={() => setRecipientMode("self")}
                label={
                  <>
                    ส่งให้ตัวเอง ·{" "}
                    <span className="font-mono text-xs">
                      {userAddress ? shortAddress(userAddress) : ""}
                    </span>
                  </>
                }
              />
              <RadioRow
                checked={recipientMode === "other"}
                onChange={() => setRecipientMode("other")}
                label="ส่งให้คนอื่น"
              />
              {recipientMode === "other" && (
                <input
                  type="text"
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value.trim())}
                  placeholder="0x..."
                  className="w-full mt-1 px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] font-mono text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-light)]"
                  aria-invalid={
                    customRecipient.length > 0 && !isAddress(customRecipient)
                  }
                />
              )}
              {recipientMode === "other" &&
                customRecipient.length > 0 &&
                !isAddress(customRecipient) && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Address ไม่ถูกต้อง (ต้องขึ้น 0x และยาว 42 ตัวอักษร)
                  </p>
                )}
            </div>
          </fieldset>
        </div>
      )}

      {/* Status messages */}
      {status.kind === "uploading" && (
        <p className="text-sm text-[var(--color-muted)] flex items-center gap-2">
          <Spinner />
          กำลังอัปโหลดรูปขึ้น IPFS...
        </p>
      )}
      {status.kind === "signing" && (
        <p className="text-sm text-[var(--color-muted)] flex items-center gap-2">
          <Spinner />
          กรุณา confirm transaction ใน wallet...
        </p>
      )}
      {status.kind === "mining" && (
        <p className="text-sm text-[var(--color-muted)] flex items-center gap-2">
          <Spinner />
          รอ block confirm...{" "}
          <a
            href={`https://sepolia.basescan.org/tx/${status.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brand)] hover:underline font-mono text-xs"
          >
            view tx
          </a>
        </p>
      )}
      {status.kind === "error" && (
        <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 p-4">
          <p className="font-medium text-red-700 dark:text-red-300 text-sm mb-1">
            Mint failed
          </p>
          <p className="text-xs text-red-700/80 dark:text-red-300/80 font-mono break-words">
            {status.message}
          </p>
        </div>
      )}

      {/* Submit */}
      {file && (
        <button
          type="button"
          onClick={handleMint}
          disabled={!canSubmit}
          className="btn-brand w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {status.kind === "uploading" && "Uploading..."}
          {status.kind === "signing" && "Confirm in wallet..."}
          {status.kind === "mining" && "Mining..."}
          {(status.kind === "idle" ||
            status.kind === "done" ||
            status.kind === "error") &&
            `Mint ${type === "nft" ? "NFT" : "SBT"}`}
        </button>
      )}

      {/* Done receipt */}
      {status.kind === "done" && (
        <TxReceiptPanel
          txHash={status.hash}
          contractAddress={status.contract}
          tokenId={status.tokenId}
        />
      )}

      {/* Educational overlay — explains what just happened on chain */}
      {status.kind === "done" && (
        <WhatJustHappened
          open={wjhOpen}
          onClose={() => setWjhOpen(false)}
          action="mint"
          txHash={status.hash}
          chainId={84532}
        />
      )}
    </div>
  );
}

function RadioCard({
  checked,
  onClick,
  title,
  subtitle,
  hint,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={`text-left p-3 rounded-lg border-2 transition-all ${
        checked
          ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]/60"
          : "border-[var(--color-border)] hover:border-[var(--color-brand)]/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{title}</span>
        {checked && (
          <span
            aria-hidden
            className="w-4 h-4 rounded-full bg-[var(--color-brand)]"
          />
        )}
      </div>
      <p className="text-sm text-[var(--color-muted)] mt-0.5">{subtitle}</p>
      <p className="text-xs text-[var(--color-muted)] mt-1">{hint}</p>
    </button>
  );
}

function RadioRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="accent-[var(--color-brand)]"
      />
      <span>{label}</span>
    </label>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[var(--color-brand)] border-t-transparent animate-spin"
    />
  );
}
