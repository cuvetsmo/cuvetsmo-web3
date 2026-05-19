/**
 * Local ABI guesses for Play features while Agent A's contracts are
 * still in development.
 *
 * These match the master plan §5.3–5.5 spec. Once Agent A publishes
 * final ABIs into `lib/contracts.ts` we should swap to those imports
 * and delete this file.
 *
 * Each ABI is intentionally minimal — only the methods the Play UI
 * calls. Add more functions as we wire deeper integrations.
 */

// ── NFTFactory.mintTo(address to, string tokenURI) → uint256 tokenId ──
export const NFT_FACTORY_ABI = [
  {
    type: "function",
    name: "mintTo",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI_", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "event",
    name: "Minted",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "tokenURI", type: "string", indexed: false },
    ],
    anonymous: false,
  },
] as const;

// ── SBTFactory.mintSoulboundTo(address to, string tokenURI) ──
export const SBT_FACTORY_ABI = [
  {
    type: "function",
    name: "mintSoulboundTo",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI_", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "event",
    name: "SoulboundMinted",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "tokenURI", type: "string", indexed: false },
    ],
    anonymous: false,
  },
] as const;

// ── Guestbook.post(string message) ──
export const GUESTBOOK_ABI = [
  {
    type: "function",
    name: "post",
    stateMutability: "nonpayable",
    inputs: [{ name: "message", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "totalMessages",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "MessagePosted",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "id", type: "uint256", indexed: true },
      { name: "message", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
] as const;
