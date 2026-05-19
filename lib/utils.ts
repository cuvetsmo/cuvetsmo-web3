/**
 * Shared utility functions.
 *
 * Keep this file dependency-free (no clsx / tailwind-merge) — Wave 1 stays lean.
 * Agent B/C/D/E may add `cn()` via clsx if they need it.
 */

import type { Address } from "viem";

/**
 * cn — lightweight class joiner. Drop-in replacement until someone
 * needs the full clsx + tailwind-merge dance.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Truncate an Ethereum address: 0x1234...abcd
 */
export function shortAddress(addr: Address | string | undefined): string {
  if (!addr) return "";
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/**
 * Format a number of wei as ETH with up to N decimals.
 * Returns string with trailing zeros stripped.
 */
export function formatEth(wei: bigint, decimals: number = 4): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(decimals).replace(/\.?0+$/, "");
}

/**
 * Block explorer URL for Base Sepolia.
 */
export function explorerUrl(
  hashOrAddress: string,
  kind: "tx" | "address" = "address",
): string {
  return `https://sepolia.basescan.org/${kind}/${hashOrAddress}`;
}

/**
 * Type guard — string is a hex address.
 */
export function isAddress(v: unknown): v is Address {
  return typeof v === "string" && /^0x[0-9a-fA-F]{40}$/.test(v);
}
