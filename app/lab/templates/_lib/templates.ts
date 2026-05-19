import fs from "node:fs/promises";
import path from "node:path";

export interface TemplateMeta {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  useCase: string;
  estimatedGas: string;
  filename: string;
  deployable: boolean;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    slug: "lottery",
    title: "Lottery",
    emoji: "🎰",
    description:
      "ผู้เข้าร่วมจ่ายค่าธรรมเนียมเข้าจับฉลาก · owner เรียก draw() เพื่อสุ่มผู้ชนะรับ pot",
    useCase: "ลุ้นรางวัลในงานปาร์ตี้สโม · giveaway · campaign แบบ on-chain",
    estimatedGas: "~120k (enter) / ~80k (draw)",
    filename: "lottery.sol",
    deployable: false,
  },
  {
    slug: "tip-jar",
    title: "Tip Jar",
    emoji: "🫙",
    description:
      "รับ tip เป็น ETH พร้อมข้อความ · ใครก็ส่ง tip ได้ · owner กด withdraw รวมไปที่กระเป๋า",
    useCase: "page ขอบคุณผู้สนับสนุน · ทุนช่วย stray dogs · ค่ากาแฟ dev",
    estimatedGas: "~60k (tip) / ~30k (withdraw)",
    filename: "tip-jar.sol",
    deployable: false,
  },
  {
    slug: "staking-pool",
    title: "Staking Pool",
    emoji: "🏦",
    description:
      "Stake ERC-20 token เพื่อรับรางวัลแบบ linear ตามเวลา · withdraw หรือ claim ได้ตลอด",
    useCase: "incentive ให้ holder ถือยาว · loyalty program ของชมรม",
    estimatedGas: "~150k (stake) / ~80k (claim)",
    filename: "staking-pool.sol",
    deployable: false,
  },
  {
    slug: "vesting",
    title: "Vesting Contract",
    emoji: "📅",
    description:
      "Lock token + ปล่อยตามเวลา linear (มี cliff ได้) · 1 contract = 1 beneficiary",
    useCase: "ค่อย ๆ ปล่อย team token · grant สำหรับ contributor",
    estimatedGas: "~110k (release)",
    filename: "vesting.sol",
    deployable: false,
  },
  {
    slug: "multisig",
    title: "Multisig Wallet",
    emoji: "🔐",
    description:
      "Wallet ที่ต้องมี m-of-n owners เซ็นจะ execute tx ได้ · educational เท่านั้น · production ใช้ Safe",
    useCase: "treasury ของชมรม · กระเป๋ากลางที่ต้องการ approver หลายคน",
    estimatedGas: "~80k (propose+confirm) / ~varies (execute)",
    filename: "multisig.sol",
    deployable: false,
  },
  {
    slug: "streaming-payments",
    title: "Streaming Payments",
    emoji: "💧",
    description:
      "Sender ส่ง ETH แบบไหลตามเวลาให้ recipient · recipient withdraw ได้ตลอด · skeleton ไม่รองรับ cancel",
    useCase: "ค่าจ้างรายวินาที · scholarship payout · subscription",
    estimatedGas: "~150k (create) / ~50k (withdraw)",
    filename: "streaming-payments.sol",
    deployable: false,
  },
  {
    slug: "nft-staking",
    title: "NFT Staking for Rewards",
    emoji: "🧷",
    description: "Stake ERC-721 NFT เพื่อรับ ERC-20 reward ต่อวินาที · unstake เอา NFT คืน",
    useCase: "incentive ให้คนถือ club NFT ค้าง · seasonal rewards",
    estimatedGas: "~140k (stake) / ~120k (unstake)",
    filename: "nft-staking.sol",
    deployable: false,
  },
];

/**
 * Read all template source files from disk at server-side build/render time.
 */
export async function readTemplateSource(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), "app", "lab", "templates", "sources", filename);
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "// Source file not found.";
  }
}
