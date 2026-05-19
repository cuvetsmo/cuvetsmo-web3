/**
 * Contract addresses + ABI registry for web3.cuvetsmo.com
 *
 * Agent A (smart contract agent) populates this after deploying to Base Sepolia.
 * Address values are read from NEXT_PUBLIC_* env vars at build time.
 *
 * NEVER hardcode addresses here — always read from env so we can rotate
 * across testnet redeploys without touching code.
 */

import type { Address } from "viem";

const z = "0x0000000000000000000000000000000000000000" as Address;

const asAddress = (v: string | undefined): Address =>
  v && v.startsWith("0x") && v.length === 42 ? (v as Address) : z;

export const CONTRACTS = {
  // Core registries — Build pillar
  ORG_REGISTRY: asAddress(process.env.NEXT_PUBLIC_ORG_REGISTRY_ADDRESS),
  VET_SBT_CARD: asAddress(process.env.NEXT_PUBLIC_VET_SBT_CARD_ADDRESS),
  BADGE_REGISTRY: asAddress(process.env.NEXT_PUBLIC_BADGE_REGISTRY_ADDRESS),

  // The Lab factories
  TOKEN_FACTORY: asAddress(process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS),
  NFT_FACTORY: asAddress(process.env.NEXT_PUBLIC_NFT_FACTORY_ADDRESS),
  SBT_FACTORY: asAddress(process.env.NEXT_PUBLIC_SBT_FACTORY_ADDRESS),
  GOVERNOR_FACTORY: asAddress(process.env.NEXT_PUBLIC_GOVERNOR_FACTORY_ADDRESS),
} as const;

/**
 * Returns true when every contract address has been wired.
 * Agent A's deploy script writes the env vars + this becomes true on next build.
 */
export function contractsReady(): boolean {
  return Object.values(CONTRACTS).every((addr) => addr !== z);
}

/**
 * ABI registry — Agent A appends as contracts are deployed.
 * Keep ABIs as `const` arrays so viem/wagmi can infer types.
 *
 * Convention:
 *   export const ORG_REGISTRY_ABI = [...] as const;
 *   export const VET_SBT_CARD_ABI = [...] as const;
 */
export {};
