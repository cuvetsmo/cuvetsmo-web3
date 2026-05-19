/**
 * Quest registry — 10 mini-lessons that gamify Web3 onboarding for vet
 * students. Each quest gives 100 XP + 1 badge SBT minted via BadgeRegistry.
 *
 * Quest IDs are stable; badge_id maps 1:1 to on-chain BadgeRegistry IDs that
 * Agent A registers in the deploy script. Until contracts are live, mints are
 * stubbed in the API route.
 *
 * Spec reference: master plan §5.2 Quests
 */

export type QuestKind =
  | "sign" // EIP-712 message sign
  | "mint" // mint an NFT/SBT
  | "vote" // EIP-712 vote
  | "auto" // server auto-mints on arrival
  | "read" // read on-chain data (gas / block / source)
  | "connect" // connect wallet to sandbox dapp
  | "transfer" // ERC-20 transfer
  | "approve"; // ERC-20 approve

export interface Quest {
  /** Stable integer id, also the badge_id minted on completion. */
  id: number;
  /** Thai-primary title. */
  title: string;
  /** English secondary subtitle. */
  subtitle: string;
  /** Short marketing description used on the card. */
  blurb: string;
  /** Concept explainer shown in the detail panel. */
  concept: string;
  /** The hands-on task instructions. */
  task: string;
  /** Verification hint shown next to the verify button. */
  verifyHint: string;
  /** Verification kind drives which on-chain check the API runs. */
  kind: QuestKind;
  /** Badge name shown on the SBT card. */
  badge: string;
  /** Small emoji-free badge icon (Unicode symbol). */
  badgeGlyph: string;
  /** XP reward — 100 default to keep math simple. */
  xp: number;
  /** "easy" / "core" / "advanced" gate for sorting. */
  tier: "easy" | "core" | "advanced";
}

export const QUESTS: readonly Quest[] = [
  {
    id: 1,
    title: "เซ็นชื่อด้วย wallet",
    subtitle: "Sign your name",
    blurb: "Sign a typed message — your first proof of ownership.",
    concept:
      "การเซ็นข้อความ (sign) คือการพิสูจน์ว่าคุณคือเจ้าของ wallet โดยไม่ต้องส่ง transaction. EIP-712 ทำให้ wallet แสดงข้อความที่อ่านง่าย แทน hex.",
    task: "กดปุ่ม Sign แล้วยืนยันใน wallet popup. ระบบจะตรวจสอบ signature แล้ว mint badge ให้.",
    verifyHint: "Verified locally + on server.",
    kind: "sign",
    badge: "Signature Master",
    badgeGlyph: "S",
    xp: 100,
    tier: "easy",
  },
  {
    id: 2,
    title: "Mint NFT ตัวแรก",
    subtitle: "Mint your first NFT",
    blurb: "Claim a free testnet NFT from the gallery.",
    concept:
      "NFT = Non-Fungible Token. แต่ละ token มี id เฉพาะตัว. mint คือการสร้าง token ใหม่ใส่ wallet ของคุณ.",
    task: "ไปที่ /play/mint แล้วกดปุ่ม Mint. กลับมาวาง tx hash เพื่อ verify.",
    verifyHint: "Paste your mint tx hash to verify on-chain.",
    kind: "mint",
    badge: "NFT Initiate",
    badgeGlyph: "N",
    xp: 100,
    tier: "easy",
  },
  {
    id: 3,
    title: "Vote เรื่องตลกๆ",
    subtitle: "Vote on something silly",
    blurb: "Cast your first EIP-712 governance vote.",
    concept:
      "Vote แบบ off-chain ใช้ EIP-712 sign — ไม่เสีย gas แต่นับได้จริง. Snapshot.org ก็ใช้แบบนี้.",
    task: "เลือกตัวเลือก แล้ว sign payload. server เก็บ vote ของคุณไว้.",
    verifyHint: "Vote signature verified server-side.",
    kind: "vote",
    badge: "First Voter",
    badgeGlyph: "V",
    xp: 100,
    tier: "easy",
  },
  {
    id: 4,
    title: "รับ SBT",
    subtitle: "Receive an SBT",
    blurb: "Get a soulbound attendance token, auto-minted to you.",
    concept:
      "SBT = Soulbound Token. ย้ายไป wallet อื่นไม่ได้. ใช้แสดงตัวตน เช่น diploma, attendance, membership.",
    task: "กด Claim. server จะ mint SBT ให้ตรง wallet address ของคุณ.",
    verifyHint: "Auto-minted on click.",
    kind: "auto",
    badge: "Soulbound",
    badgeGlyph: "B",
    xp: 100,
    tier: "core",
  },
  {
    id: 5,
    title: "อ่าน block explorer",
    subtitle: "Read a block explorer",
    blurb: "Find your own transaction on BaseScan.",
    concept:
      "Block explorer คือเว็บที่อ่าน data จาก blockchain. BaseScan ใช้กับ Base/Base Sepolia. ทุก tx มี hash, from, to, value, gas.",
    task: "เปิด BaseScan, ค้น tx hash ของคุณ, กลับมาวาง URL.",
    verifyHint: "Paste BaseScan tx URL.",
    kind: "read",
    badge: "Explorer",
    badgeGlyph: "E",
    xp: 100,
    tier: "core",
  },
  {
    id: 6,
    title: "Connect ไป DApp",
    subtitle: "Connect to a DApp",
    blurb: "Wire your wallet to a sandbox decentralized app.",
    concept:
      "DApp = Decentralized App. การ connect คือการให้สิทธิ์เว็บอ่าน address ของคุณ ไม่ใช่ key.",
    task: "ไปที่ /play/board เลือก option Connect. กลับมา verify.",
    verifyHint: "Connection event captured client-side.",
    kind: "connect",
    badge: "Connected",
    badgeGlyph: "C",
    xp: 100,
    tier: "core",
  },
  {
    id: 7,
    title: "ส่ง token ให้เพื่อน",
    subtitle: "Send a token to a friend",
    blurb: "Transfer ERC-20 to another address.",
    concept:
      "ERC-20 = standard ของ fungible token. transfer คือการย้าย token จาก wallet ของคุณไป address อื่น.",
    task: "ไปที่ /play/swap, ส่ง 1 test-token ไป address เพื่อน. paste tx hash.",
    verifyHint: "Tx hash + log topic check.",
    kind: "transfer",
    badge: "Generous",
    badgeGlyph: "G",
    xp: 100,
    tier: "advanced",
  },
  {
    id: 8,
    title: "Approve ก่อน swap",
    subtitle: "Approve before swapping",
    blurb: "Grant allowance so a router can move your tokens.",
    concept:
      "ก่อนที่ DEX จะย้าย token ของคุณได้ ต้องมี approve allowance ก่อน. นี่คือเหตุผลที่ swap มัก 2 tx.",
    task: "กด Approve ที่ /play/swap. paste approve tx hash.",
    verifyHint: "Approval(owner,spender,value) topic check.",
    kind: "approve",
    badge: "Approver",
    badgeGlyph: "A",
    xp: 100,
    tier: "advanced",
  },
  {
    id: 9,
    title: "อ่าน gas ละเอียดๆ",
    subtitle: "Read gas in detail",
    blurb: "Find exact gas used by one of your txs.",
    concept:
      "Gas = ค่าธรรมเนียมการเขียน blockchain. tx ที่ซับซ้อนใช้ gas มากกว่า. unit = gas units × gas price.",
    task: "ดู gas used ของ tx ใดก็ได้ของคุณ บน BaseScan. ตอบเป็น number.",
    verifyHint: "Server fetches receipt + compares.",
    kind: "read",
    badge: "Gas Reader",
    badgeGlyph: "R",
    xp: 100,
    tier: "advanced",
  },
  {
    id: 10,
    title: "Verify contract source",
    subtitle: "Verify a contract",
    blurb: "Trust by reading — view verified source on BaseScan.",
    concept:
      "Contract ที่ verified แล้วแสดง source Solidity ได้. ทำให้คนอื่นตรวจสอบโค้ดได้ก่อนเชื่อ.",
    task: "หา contract verified ใดๆ บน BaseScan. paste URL ที่มี tab 'Contract' เปิดอยู่.",
    verifyHint: "URL pattern + verified flag check.",
    kind: "read",
    badge: "Trust Verifier",
    badgeGlyph: "T",
    xp: 100,
    tier: "advanced",
  },
] as const;

export const TIER_LABEL: Record<Quest["tier"], string> = {
  easy: "Beginner",
  core: "Core",
  advanced: "Advanced",
};

export const TIER_ORDER: Record<Quest["tier"], number> = {
  easy: 0,
  core: 1,
  advanced: 2,
};

export function getQuestById(id: number): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}

export const TOTAL_XP_AVAILABLE = QUESTS.reduce((sum, q) => sum + q.xp, 0);
