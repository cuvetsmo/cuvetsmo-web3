"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem, type Address } from "viem";
import { explorerUrl, shortAddress } from "@/lib/utils";
import { PLAY_ADDRESSES, isLive } from "../_lib/addresses";

interface MintEntry {
  contract: Address;
  to: Address;
  tokenId: string;
  tokenURI?: string;
  blockNumber: bigint;
  txHash: string;
}

const MINTED_EVENT = parseAbiItem(
  "event Minted(address indexed to, uint256 indexed tokenId, string tokenURI)",
);

const SOULBOUND_EVENT = parseAbiItem(
  "event SoulboundMinted(address indexed to, uint256 indexed tokenId, string tokenURI)",
);

const RECENT_LIMIT = 20;
// 5000-block lookback ≈ ~2.5h on Base (2s blocks). Adjust if traffic grows.
const LOOKBACK_BLOCKS = BigInt(5000);
const ZERO_BIG = BigInt(0);

/**
 * Gallery of the most-recent public mints from both factories.
 *
 * Uses viem `getLogs` against the public RPC. Stays static until the
 * user reloads — wagmi `useWatchContractEvent` could push real-time
 * but burns RPC quota for low-volume gallery.
 */
export function RecentMints() {
  const publicClient = usePublicClient();
  const [entries, setEntries] = useState<MintEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nftLive = isLive(PLAY_ADDRESSES.NFT_FACTORY);
  const sbtLive = isLive(PLAY_ADDRESSES.SBT_FACTORY);

  useEffect(() => {
    if (!publicClient) return;
    if (!nftLive && !sbtLive) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const latest = await publicClient.getBlockNumber();
        const fromBlock =
          latest > LOOKBACK_BLOCKS ? latest - LOOKBACK_BLOCKS : ZERO_BIG;

        const promises: Promise<MintEntry[]>[] = [];

        if (nftLive) {
          promises.push(
            publicClient
              .getLogs({
                address: PLAY_ADDRESSES.NFT_FACTORY,
                event: MINTED_EVENT,
                fromBlock,
                toBlock: latest,
              })
              .then((logs) =>
                logs.map((l) => ({
                  contract: PLAY_ADDRESSES.NFT_FACTORY,
                  to: l.args.to as Address,
                  tokenId: (l.args.tokenId ?? ZERO_BIG).toString(),
                  tokenURI: l.args.tokenURI as string | undefined,
                  blockNumber: l.blockNumber!,
                  txHash: l.transactionHash!,
                })),
              ),
          );
        }
        if (sbtLive) {
          promises.push(
            publicClient
              .getLogs({
                address: PLAY_ADDRESSES.SBT_FACTORY,
                event: SOULBOUND_EVENT,
                fromBlock,
                toBlock: latest,
              })
              .then((logs) =>
                logs.map((l) => ({
                  contract: PLAY_ADDRESSES.SBT_FACTORY,
                  to: l.args.to as Address,
                  tokenId: (l.args.tokenId ?? ZERO_BIG).toString(),
                  tokenURI: l.args.tokenURI as string | undefined,
                  blockNumber: l.blockNumber!,
                  txHash: l.transactionHash!,
                })),
              ),
          );
        }

        const all = (await Promise.all(promises)).flat();
        all.sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1));
        if (!cancelled) setEntries(all.slice(0, RECENT_LIMIT));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load recent mints",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, nftLive, sbtLive]);

  if (!nftLive && !sbtLive) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          ยังไม่มีคนเริ่ม mint · contracts กำลังถูก deploy.
          <br />
          เร็วๆ นี้.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400 font-mono">
        {error}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          ยังไม่มีคนเริ่ม mint · เป็นคนแรก!
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {entries.map((entry) => (
        <MintCard
          key={`${entry.contract}-${entry.tokenId}`}
          entry={entry}
          gateway={
            process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud"
          }
        />
      ))}
    </ul>
  );
}

function MintCard({
  entry,
  gateway,
}: {
  entry: MintEntry;
  gateway: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState<string | null>(null);

  useEffect(() => {
    if (!entry.tokenURI) return;
    const cid = entry.tokenURI.replace(/^ipfs:\/\//, "");
    const gw = gateway.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const metadataUrl = `https://${gw}/ipfs/${cid}`;
    let cancelled = false;

    fetch(metadataUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { name?: string; image?: string } | null) => {
        if (cancelled || !json) return;
        if (json.name) setTokenName(json.name);
        if (json.image) {
          const imgCid = json.image.replace(/^ipfs:\/\//, "");
          setImageUrl(`https://${gw}/ipfs/${imgCid}`);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [entry.tokenURI, gateway]);

  const isSbt =
    entry.contract.toLowerCase() ===
    PLAY_ADDRESSES.SBT_FACTORY.toLowerCase();

  return (
    <li>
      <a
        href={explorerUrl(entry.txHash, "tx")}
        target="_blank"
        rel="noopener noreferrer"
        className="block group rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-brand)] transition-colors"
      >
        <div className="aspect-square bg-[var(--color-brand-light)]/30 relative overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={tokenName || `Token #${entry.tokenId}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-xs">
              loading metadata...
            </div>
          )}
          <span
            className={`absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
              isSbt
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200"
                : "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200"
            }`}
          >
            {isSbt ? "SBT" : "NFT"}
          </span>
        </div>
        <div className="p-2.5">
          <p className="text-sm font-medium truncate">
            {tokenName || `Token #${entry.tokenId}`}
          </p>
          <p className="text-xs text-[var(--color-muted)] font-mono">
            by {shortAddress(entry.to)}
          </p>
        </div>
      </a>
    </li>
  );
}
