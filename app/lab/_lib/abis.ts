/**
 * Lab-local ABI snippets for factory contracts.
 *
 * Agent A owns `lib/contracts.ts` (addresses + canonical ABI registry). To
 * avoid a write-conflict while Agent A is still iterating, we keep the
 * minimum ABIs The Lab pages need in this pillar-private file. When Agent A
 * publishes the final ABIs the pages can switch imports.
 *
 * These ABI fragments are intentionally minimal: just the function
 * signatures + the events the UI watches.
 */

export const TOKEN_FACTORY_ABI = [
  {
    type: "function",
    name: "createToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "supply", type: "uint256" },
    ],
    outputs: [{ name: "token", type: "address" }],
  },
  {
    type: "function",
    name: "tokensByCreator",
    stateMutability: "view",
    inputs: [
      { name: "creator", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "token", type: "address" }],
  },
  {
    type: "function",
    name: "tokensCountOf",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "TokenCreated",
    inputs: [
      { name: "creator", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "symbol", type: "string", indexed: false },
      { name: "supply", type: "uint256", indexed: false },
    ],
  },
] as const;

export const NFT_FACTORY_ABI = [
  {
    type: "function",
    name: "createCollection",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "baseURI", type: "string" },
      { name: "maxSupply", type: "uint256" },
    ],
    outputs: [{ name: "collection", type: "address" }],
  },
  {
    type: "event",
    name: "CollectionCreated",
    inputs: [
      { name: "creator", type: "address", indexed: true },
      { name: "collection", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "symbol", type: "string", indexed: false },
      { name: "baseURI", type: "string", indexed: false },
      { name: "maxSupply", type: "uint256", indexed: false },
      { name: "soulbound", type: "bool", indexed: false },
    ],
  },
] as const;

export const SBT_FACTORY_ABI = [
  {
    type: "function",
    name: "createSBTCollection",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "baseURI", type: "string" },
      { name: "maxSupply", type: "uint256" },
    ],
    outputs: [{ name: "collection", type: "address" }],
  },
  {
    type: "event",
    name: "SBTCollectionCreated",
    inputs: [
      { name: "creator", type: "address", indexed: true },
      { name: "collection", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "symbol", type: "string", indexed: false },
      { name: "baseURI", type: "string", indexed: false },
      { name: "maxSupply", type: "uint256", indexed: false },
    ],
  },
] as const;

export const GOVERNOR_FACTORY_ABI = [
  {
    type: "function",
    name: "createGovernor",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "name", type: "string" },
    ],
    outputs: [{ type: "address" }],
  },
  {
    type: "event",
    name: "GovernorRequested",
    inputs: [
      { name: "creator", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
  },
] as const;

/* ─── Implementation ABIs (read deployed clones) ─── */

export const TOKEN_IMPLEMENTATION_ABI = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export const NFT_IMPLEMENTATION_ABI = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "maxSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalMinted",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "soulbound",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
] as const;
