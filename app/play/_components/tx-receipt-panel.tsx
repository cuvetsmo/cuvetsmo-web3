"use client";

import { explorerUrl, shortAddress } from "@/lib/utils";

interface TxReceiptPanelProps {
  txHash: string;
  contractAddress?: string;
  tokenId?: string;
  gasUsed?: string;
  blockNumber?: string;
}

/**
 * "What just happened?" educational panel shown after a successful mint.
 *
 * Surfaces tx hash, contract, token id, gas, with BaseScan link.
 */
export function TxReceiptPanel({
  txHash,
  contractAddress,
  tokenId,
  gasUsed,
  blockNumber,
}: TxReceiptPanelProps) {
  return (
    <div className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 text-base mb-1">
          เกิดอะไรขึ้น? · What just happened?
        </h3>
        <p className="text-sm text-emerald-700/90 dark:text-emerald-300/90 leading-relaxed">
          คุณได้ส่ง transaction ไปยัง Base Sepolia · มันถูก confirm + บันทึกถาวร
          on-chain. ไม่มีใครลบได้.
        </p>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <ReceiptRow
          label="Tx hash"
          value={shortAddress(txHash)}
          href={explorerUrl(txHash, "tx")}
        />
        {contractAddress && (
          <ReceiptRow
            label="Contract"
            value={shortAddress(contractAddress)}
            href={explorerUrl(contractAddress, "address")}
          />
        )}
        {tokenId && <ReceiptRow label="Token ID" value={`#${tokenId}`} />}
        {blockNumber && <ReceiptRow label="Block" value={`#${blockNumber}`} />}
        {gasUsed && <ReceiptRow label="Gas used" value={gasUsed} />}
      </dl>

      <a
        href={explorerUrl(txHash, "tx")}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 dark:text-emerald-200 hover:underline"
      >
        View source on BaseScan ↗
      </a>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70 font-medium">
        {label}
      </dt>
      <dd className="font-mono text-sm text-emerald-900 dark:text-emerald-100">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
