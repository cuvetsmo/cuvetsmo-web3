/**
 * Play-pillar contract address helpers.
 *
 * Re-exports from `lib/contracts.ts` plus the Guestbook address that
 * Agent A will publish (currently lives only in `.env.local` until
 * Agent A inlines it into `CONTRACTS`).
 *
 * Once Agent A merges Guestbook into `CONTRACTS`, this file can be
 * thinned to just the env reads it still needs.
 */

import type { Address } from "viem";
import { CONTRACTS } from "@/lib/contracts";

const ZERO = "0x0000000000000000000000000000000000000000" as Address;

const asAddress = (v: string | undefined): Address =>
  v && v.startsWith("0x") && v.length === 42 ? (v as Address) : ZERO;

export const PLAY_ADDRESSES = {
  NFT_FACTORY: CONTRACTS.NFT_FACTORY,
  SBT_FACTORY: CONTRACTS.SBT_FACTORY,
  GUESTBOOK: asAddress(process.env.NEXT_PUBLIC_GUESTBOOK_ADDRESS),
} as const;

export function isLive(addr: Address): boolean {
  return addr !== ZERO;
}

export { ZERO };
