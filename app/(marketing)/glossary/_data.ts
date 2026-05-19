/**
 * Glossary entries — bilingual TH/EN dictionary of web3 terms used
 * across this site. Sourced from master plan Appendix B, with vet-context
 * analogies added where applicable.
 *
 * Stored in a separate file (not page.tsx) so the page can stay declarative
 * and the data is easy to grep / extend.
 *
 * NEW entries: keep keys alphabetical by `en` for the A-Z sidebar.
 */

export type GlossaryEntry = {
  en: string;
  th: string;
  short: string;
  long: string;
  vetContext?: string;
  related?: string[];
};

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    en: "Account Abstraction",
    th: "บัญชีนามธรรม (ERC-4337)",
    short:
      "มาตรฐานที่ทำให้ smart contract เป็น wallet ได้ — login ด้วย email, sponsor gas, ไม่ต้องจำ seed phrase",
    long: "ERC-4337 เป็นมาตรฐานที่เปลี่ยน UX ของ wallet จาก geek tool เป็น consumer product. แทนที่จะให้ user สร้าง EOA (Externally Owned Account) ด้วย seed phrase 12 คำ ระบบสร้าง smart contract wallet ให้แทน — ทำให้ login ด้วย email/social ได้, sponsor ค่า gas ให้ user, ตั้ง spending limit ได้, recover wallet ได้ผ่าน social.",
    vetContext:
      "ใน CUVETSMO เราใช้ Privy (which uses AA under the hood) ให้นิสิตเข้าด้วย CU email ได้เลย — ไม่ต้องสอนเรื่อง seed phrase ใน 10 นาทีแรก",
    related: ["Paymaster", "Wallet", "Private Key"],
  },
  {
    en: "AMM",
    th: "ตลาดอัตโนมัติ (Automated Market Maker)",
    short:
      "ระบบ swap แบบ pool ไม่มี order book — ราคามาจาก ratio ของ token ใน pool",
    long: "AMM (Automated Market Maker) เช่น Uniswap คือ smart contract ที่เก็บ token 2 ตัวใน pool. ใครก็ swap ได้ — ราคาคำนวณจาก reserve ratio ตามสูตร x·y=k. ไม่มี matching engine, ไม่มี order book.",
    related: ["DeFi", "ERC-20", "Token"],
  },
  {
    en: "Block Explorer",
    th: "ตัวสำรวจบล็อก",
    short:
      "เว็บที่ให้ดูทุก transaction บน blockchain — เช่น BaseScan, Etherscan",
    long: "Block explorer เป็นเว็บที่ index ข้อมูลทั้งหมดบน blockchain ให้ดูได้ — transaction, address, contract, token transfer. โปร่งใส 100% เพราะ blockchain เป็น public ledger. CUVETSMO ใช้ BaseScan (sepolia.basescan.org สำหรับ testnet).",
    vetContext:
      "ทุก mint SBT, ทุก vote DAO, ทุก donation ใน Welfare Treasury จะมี link ไปดูบน BaseScan ได้ — verify ว่าระบบไม่โกง",
    related: ["Blockchain", "Transaction", "Verify"],
  },
  {
    en: "Blockchain",
    th: "บล็อกเชน",
    short:
      "ฐานข้อมูลที่กระจายไปทั่ว ทุกคนเห็นเหมือนกัน แก้ย้อนหลังไม่ได้",
    long: "Blockchain คือ database ที่ replicate ไปยังคอมพิวเตอร์หลายพันเครื่องทั่วโลก. การเขียนข้อมูลใหม่ (block) ต้องผ่าน consensus ของหลายๆ node, ทำให้ไม่มีใครแก้ย้อนหลังหรือลบได้. Bitcoin (2009) เป็น blockchain แรกที่ใช้งานจริง; Ethereum (2015) เพิ่ม smart contract.",
    related: ["L1", "L2", "Smart Contract"],
  },
  {
    en: "DAO",
    th: "องค์กรอัตโนมัติแบบกระจายอำนาจ",
    short:
      "Decentralized Autonomous Organization — องค์กรที่ตัดสินใจผ่าน vote on-chain ของสมาชิก",
    long: "DAO คือ smart contract ที่จัดการกฎเกณฑ์การตัดสินใจของกลุ่ม — เสนอ proposal, vote, execute อัตโนมัติ. สมาชิก vote ได้ผ่าน token (governance token) หรือ SBT (one-person-one-vote).",
    vetContext:
      "Vet DAO ของเราใช้ Vet SBT Card เป็นสิทธิ์ vote — หนึ่งคนหนึ่งเสียง ไม่ใช่หนึ่งเหรียญหนึ่งเสียง เพราะนี่คือ organization ไม่ใช่ corporation",
    related: ["Governor", "SBT", "Token"],
  },
  {
    en: "DeFi",
    th: "การเงินกระจายอำนาจ",
    short:
      "Decentralized Finance — บริการการเงินที่ไม่มีคนกลาง — swap, lending, derivatives",
    long: "DeFi คือ ecosystem ของ smart contract ที่ทำหน้าที่แทน bank/broker — swap (Uniswap), lend (Aave), derivative (GMX), stablecoin (DAI). ทุก protocol โปร่งใส ตรวจสอบ code ได้ แต่ก็มี risk จาก smart contract bug.",
    vetContext:
      "CUVETSMO **ไม่ทำ DeFi** ที่ user เสี่ยงเงินจริง — เราอยู่ใน educational scope เท่านั้น",
    related: ["AMM", "ERC-20", "Smart Contract"],
  },
  {
    en: "ERC-20",
    th: "มาตรฐานเหรียญ (fungible token)",
    short:
      "มาตรฐาน token ที่ทุกตัวเหมือนกัน (เช่น USDC, DAI) — interchangeable",
    long: "ERC-20 คือ interface มาตรฐานของ fungible token บน Ethereum — กำหนด function เช่น transfer, balanceOf, approve. ทำให้ wallet/exchange/DApp ทุกตัวอ่านและส่งเหรียญแบบเดียวกันได้.",
    related: ["Token", "ERC-721", "ERC-1155"],
  },
  {
    en: "ERC-721",
    th: "มาตรฐาน NFT",
    short:
      "Non-Fungible Token — แต่ละ id ไม่เหมือนกัน (เช่น CryptoPunks, รูปวาด)",
    long: "ERC-721 กำหนดให้ token แต่ละตัวมี id เฉพาะและ metadata ไม่ซ้ำกัน. ใช้สำหรับ digital art, ที่ดินใน metaverse, ตั๋ว event, certificate.",
    related: ["NFT", "ERC-1155", "SBT"],
  },
  {
    en: "ERC-1155",
    th: "มาตรฐาน multi-token",
    short:
      "Hybrid — token contract เดียวสามารถมีหลาย id และเป็น fungible/NFT ก็ได้",
    long: "ERC-1155 ออกแบบสำหรับ game items — ใน contract เดียวเก็บได้ทั้งดาบ (NFT, id ไม่ซ้ำ) และ gold (fungible, มีหลายเหรียญ). ประหยัด gas เพราะ batch transfer ได้.",
    related: ["ERC-721", "ERC-20", "NFT"],
  },
  {
    en: "Faucet",
    th: "ก๊อกน้ำ (testnet)",
    short:
      "บริการแจก test ETH ฟรีบน testnet สำหรับทดสอบ — ไม่มีมูลค่าจริง",
    long: "Faucet เป็น smart contract หรือเว็บที่แจก test ETH (เช่น Base Sepolia ETH) ให้ developer ทดสอบโดยไม่ต้องใช้เงินจริง. มี rate limit (เช่น 0.01 ETH ต่อวัน) ป้องกัน abuse.",
    vetContext:
      "CUVETSMO จะ sponsor faucet drip ให้ Wallet 101 users — เริ่มทดลองโดยไม่ต้องไปขอที่อื่น",
    related: ["Testnet", "Gas"],
  },
  {
    en: "Gas",
    th: "ค่าก๊าซ (transaction fee)",
    short:
      "ค่าธรรมเนียมการรัน transaction บน chain — จ่ายให้ validator/sequencer",
    long: "Gas คือหน่วยวัด computation ของ transaction บน Ethereum. ราคาต่อหน่วย (gas price, gwei) ผันแปรตาม demand. Total fee = gas used × gas price. บน L2 อย่าง Base ค่า gas ถูกกว่า mainnet 10-100x.",
    vetContext:
      "ใน CUVETSMO เราใช้ paymaster sponsor gas ให้ user — กดปุ่ม mint SBT แล้วระบบจ่ายเอง user ไม่ต้องมี ETH",
    related: ["Account Abstraction", "Paymaster", "Transaction"],
  },
  {
    en: "IPFS",
    th: "ไอพีเอฟเอส",
    short:
      "InterPlanetary File System — ระบบเก็บไฟล์แบบกระจายไม่มี central server",
    long: "IPFS เป็น protocol เก็บไฟล์แบบ content-addressed — ชี้ไฟล์ด้วย hash (CID) แทน URL. ไฟล์เดิม hash เดิมเสมอ. ใช้เก็บ metadata + image ของ NFT บ่อย เพราะ on-chain เก็บเองแพง.",
    vetContext:
      "Vet SBT Card metadata (รูป profile, badge list, year) เก็บใน Pinata pinned IPFS — เปลี่ยน server ไม่ได้, contract เก็บแค่ CID",
    related: ["NFT", "SBT"],
  },
  {
    en: "L2",
    th: "เลเยอร์ 2",
    short:
      "Chain ที่รันบน L1 — เร็วกว่าและถูกกว่า เช่น Base, Optimism, Arbitrum",
    long: "L2 (Layer 2) เป็น chain ที่ใช้ Ethereum mainnet เป็น base layer สำหรับ security แต่ประมวลผล transaction บน L2 เอง — gas ถูกลง 10-100x, throughput สูงขึ้น. มี 2 แบบหลัก: optimistic rollup (Base, Optimism, Arbitrum) และ ZK rollup (zkSync, Linea).",
    vetContext:
      "CUVETSMO ใช้ Base (Coinbase L2) — gas ถูก, ecosystem โต, developer tools ดี",
    related: ["L1", "Blockchain", "Gas"],
  },
  {
    en: "Mainnet",
    th: "เครือข่ายหลัก",
    short:
      "Production network ที่ asset มีมูลค่าจริง — ตรงข้ามกับ testnet",
    long: "Mainnet คือ network จริงของ blockchain แต่ละตัว — Ethereum Mainnet, Base Mainnet, Polygon. Token, NFT, contract บน mainnet มีมูลค่าจริง.",
    related: ["Testnet", "L1", "L2"],
  },
  {
    en: "NFT",
    th: "เอ็นเอฟที (Non-Fungible Token)",
    short:
      "Token ที่แต่ละตัวไม่เหมือนกัน — ใช้ represent digital art, ตั๋ว, certificate",
    long: "NFT (Non-Fungible Token) คือ token ที่มี id เฉพาะและ metadata (รูป, ชื่อ, attributes) ไม่ซ้ำกัน. ตรงข้ามกับ fungible token เช่น USDC ที่ทุกเหรียญแลกกันได้. ส่วนใหญ่ใช้ ERC-721 หรือ ERC-1155.",
    vetContext:
      "POAP (proof-of-attendance NFT) ใช้บอกว่ามาร่วม event ของสโมจริง — ในอนาคตอาจใช้แทนการเซ็นชื่อกระดาษ",
    related: ["ERC-721", "ERC-1155", "SBT"],
  },
  {
    en: "Private Key",
    th: "กุญแจส่วนตัว",
    short:
      "Secret 256-bit ที่ control wallet — ใครได้ไป = ใช้ wallet ได้",
    long: "Private key เป็น secret number ที่ใช้ sign transaction. ทุก wallet มี private key 1 ตัว. ถ้าหาย = สูญทุก asset ใน wallet. ถ้าโดน leak = ใครก็ใช้ wallet ได้. การเก็บคือเรื่องใหญ่ — hardware wallet, mnemonic phrase, social recovery.",
    vetContext:
      "Privy เก็บ private key ให้ในรูปแบบ encrypted shards — user ไม่ต้องเห็น แต่ recover ได้ผ่าน email + device",
    related: ["Public Key", "Wallet", "Signature"],
  },
  {
    en: "Public Key",
    th: "กุญแจสาธารณะ",
    short:
      "Address ของ wallet ที่ใครก็ส่งของให้ได้ — derived จาก private key",
    long: "Public key (และ address ที่ derived มา) สามารถแชร์ public ได้ — เหมือนเลขบัญชี. ใครก็ส่ง token/NFT มาได้. แต่ใช้รับอย่างเดียว ไม่ใช่ส่ง — ต้อง private key ค่อย sign transaction ส่งออก.",
    related: ["Private Key", "Wallet", "Signature"],
  },
  {
    en: "SBT",
    th: "เอสบีที (Soulbound Token)",
    short:
      "NFT ที่โอนไม่ได้ — ผูกกับ wallet ถาวร — ใช้แทน identity/credential",
    long: "SBT (Soulbound Token) คือ NFT ที่ disable transfer function ทำให้โอนหาคนอื่นไม่ได้. ใช้แทน identity, credential, achievement — สิ่งที่ไม่ควรซื้อขายได้ (เช่น ปริญญาบัตร, attendance record).",
    vetContext:
      "Vet SBT Card คือ identity ของนิสิตสัตวแพทย์ CU — ผูกกับ wallet ถาวร ขายไม่ได้ ใช้ยืนยันสิทธิ์ vote/เข้าระบบสโม",
    related: ["NFT", "ERC-721", "DAO"],
  },
  {
    en: "Signature",
    th: "ลายเซ็น",
    short:
      "การ sign message ด้วย private key เพื่อพิสูจน์ว่าเจ้าของ wallet ยินยอม",
    long: "Signature คือผลของการ encrypt hash ของ message ด้วย private key. ใครก็ verify ได้ว่ามาจาก wallet นี้จริง (ใช้ public key verify). ไม่ต้องส่ง transaction บน chain = ฟรี, ใช้บ่อยในการ login DApp และ off-chain vote (Snapshot).",
    related: ["Private Key", "Public Key", "Wallet"],
  },
  {
    en: "Smart Contract",
    th: "สัญญาอัจฉริยะ",
    short:
      "โปรแกรมบน blockchain ทำงานอัตโนมัติตามเงื่อนไข — เปลี่ยนไม่ได้หลัง deploy",
    long: "Smart contract คือ code (เขียนด้วย Solidity บน EVM chain) ที่ deploy แล้วทำงานเหมือนเครื่องอัตโนมัติ — ใครเรียก function ก็ทำตาม logic เดียวกัน, โปร่งใส, แก้ไม่ได้ (ยกเว้นออกแบบเป็น upgradable proxy).",
    vetContext:
      "Vet SBT Card, Token Forge, Governor — ทุก feature ของ CUVETSMO บน chain คือ smart contract ที่ open source บน GitHub",
    related: ["Contract", "Solidity", "Blockchain"],
  },
  {
    en: "Testnet",
    th: "เครือข่ายทดสอบ",
    short:
      "Network สำหรับทดสอบ — token, NFT, contract มีมูลค่า 0 บาท",
    long: "Testnet คือ blockchain network ที่จำลอง mainnet — มี faucet แจก test ETH ฟรี, ทุก asset มูลค่า 0, ใช้สำหรับ developer ทดสอบก่อน deploy mainnet. ตัวอย่าง: Base Sepolia, Ethereum Sepolia, Polygon Amoy.",
    vetContext:
      "Phase 1 ของ CUVETSMO ทำงานบน Base Sepolia ทั้งหมด — ทุกอย่างที่ user เห็นใน playground คือ testnet มูลค่า 0",
    related: ["Mainnet", "Faucet", "L2"],
  },
  {
    en: "Token",
    th: "โทเค็น",
    short:
      "หน่วยมูลค่าหรือ asset บน blockchain — fungible (ERC-20) หรือ NFT (ERC-721)",
    long: "Token เป็น generic term ของ asset บน chain — เหรียญ (เช่น USDC, ETH), NFT (เช่น CryptoPunks), governance token (เช่น UNI ของ Uniswap). แต่ละตัวมี smart contract เป็นของตัวเอง.",
    related: ["ERC-20", "ERC-721", "NFT"],
  },
  {
    en: "Transaction",
    th: "ทรานแซ็กชั่น",
    short:
      "คำสั่งที่ส่งให้ chain ประมวลผล — เช่น send token, call contract",
    long: "Transaction (tx) คือ message ที่ส่งให้ chain — มี from address, to address, value (ETH), data (function call), nonce, gas. หลัง confirm จะถูกเก็บใน block ถาวร ดูได้บน block explorer.",
    vetContext:
      "ทุก action ใน CUVETSMO ที่กระทบ chain — claim SBT, vote, mint badge — สร้าง 1 transaction ที่ดูบน BaseScan ได้",
    related: ["Gas", "Block Explorer", "Signature"],
  },
  {
    en: "Wallet",
    th: "กระเป๋าเงินดิจิทัล",
    short:
      "Software ที่เก็บ private key และ sign transaction — เป็นประตูเข้า web3",
    long: "Wallet เก็บ private key (หรือ shards ของมัน) ของ user และ sign transaction. แบ่งเป็น hot wallet (online, สะดวก, เสี่ยงกว่า — เช่น MetaMask, Privy) กับ cold wallet (offline, ปลอดภัย, hardware — เช่น Ledger, Trezor).",
    vetContext:
      "CUVETSMO ใช้ Privy ที่ embedded wallet ในเว็บ — user ไม่ต้องโหลด MetaMask extension, แค่ login email พอ",
    related: ["Private Key", "Public Key", "Account Abstraction"],
  },
  {
    en: "Wallet Connect",
    th: "วอลเล็ต-คอนเนค",
    short:
      "Protocol ให้ wallet มือถือเชื่อม DApp บน desktop ผ่าน QR code",
    long: "WalletConnect (เพิ่งเปลี่ยนชื่อเป็น Reown) คือ protocol ที่ทำให้ DApp บน browser desktop เชื่อมกับ wallet บนมือถือผ่าน QR scan — ทุก transaction จะถูกส่งไปขอ confirm บนมือถือก่อน sign.",
    related: ["Wallet", "Signature"],
  },
] as const;

export const GLOSSARY_BY_LETTER: ReadonlyMap<string, GlossaryEntry[]> = (() => {
  const map = new Map<string, GlossaryEntry[]>();
  for (const entry of GLOSSARY) {
    const letter = entry.en[0].toUpperCase();
    const arr = map.get(letter) ?? [];
    arr.push(entry);
    map.set(letter, arr);
  }
  return map;
})();
