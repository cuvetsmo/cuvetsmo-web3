/**
 * Glossary entries — bilingual TH/EN dictionary of web3 terms used
 * across this site. Sourced from master plan Appendix B, with vet-context
 * analogies added where applicable.
 *
 * Stored in a separate file (not page.tsx) so the page can stay declarative
 * and the data is easy to grep / extend.
 *
 * NEW entries: keep keys alphabetical by `en` for the A-Z sidebar.
 *
 * Wave 3 (Education Specialist): expanded 25 → 53 entries, every entry
 * now has a vet-context analogy where it makes sense.
 */

export type GlossaryEntry = {
  en: string;
  th: string;
  short: string;
  long: string;
  vetContext?: string;
  related?: string[];
  /** Optional image hint — relative path under /img/learn/ or remote URL. */
  image?: string;
};

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    en: "Account Abstraction",
    th: "บัญชีนามธรรม (ERC-4337)",
    short:
      "มาตรฐานที่ทำให้ smart contract เป็น wallet ได้ — login ด้วย email, sponsor gas, ไม่ต้องจำ seed phrase",
    long: "ERC-4337 เป็นมาตรฐานที่เปลี่ยน UX ของ wallet จาก geek tool เป็น consumer product. แทนที่จะให้ user สร้าง EOA (Externally Owned Account) ด้วย seed phrase 12 คำ ระบบสร้าง smart contract wallet ให้แทน — ทำให้ login ด้วย email หรือ social ได้, sponsor ค่า gas ให้ user, ตั้ง spending limit ได้, recover wallet ได้ผ่าน social.",
    vetContext:
      "ใน CUVETSMO เราใช้ Privy (which uses AA under the hood) ให้นิสิตเข้าด้วย CU email ได้เลย — ไม่ต้องสอนเรื่อง seed phrase ใน 10 นาทีแรก",
    related: ["Paymaster", "Wallet", "Private Key"],
  },
  {
    en: "Allowance",
    th: "วงเงินอนุญาต",
    short:
      "จำนวน token ที่เจ้าของอนุญาตให้ contract อื่นใช้แทนได้",
    long: "Allowance เป็นกลไกของ ERC-20 ที่ให้เจ้าของ token approve ให้ contract อื่นเช่น DEX หรือ vault หยิบ token จำนวนหนึ่งจาก wallet ไปใช้ได้ โดยไม่ต้องโอนล่วงหน้า. เป็นพื้นฐานของ DeFi ทุก protocol.",
    vetContext:
      "เปรียบเหมือนการเซ็นใบมอบฉันทะให้รุ่นน้องไปรับยาแทนได้ ภายในปริมาณที่ระบุ — ไม่ใช่มอบทั้งคลังยา",
    related: ["Approve", "ERC-20", "Token"],
  },
  {
    en: "AMM",
    th: "ตลาดอัตโนมัติ (Automated Market Maker)",
    short:
      "ระบบ swap แบบ pool ไม่มี order book — ราคามาจาก ratio ของ token ใน pool",
    long: "AMM (Automated Market Maker) เช่น Uniswap คือ smart contract ที่เก็บ token 2 ตัวใน pool. ใครก็ swap ได้ — ราคาคำนวณจาก reserve ratio ตามสูตร x·y=k. ไม่มี matching engine, ไม่มี order book.",
    vetContext:
      "ใน Swap Sandbox ของเรา ใช้ AMM จำลอง — ลองปรับ slippage แล้วเห็นราคาเลื่อนทันที เหมือนชั่งวัตถุดิบยาแล้วเห็น scale ตอบสนอง",
    related: ["DeFi", "ERC-20", "Token", "Liquidity Pool"],
  },
  {
    en: "Approve",
    th: "อนุมัติ",
    short:
      "ตั้ง allowance ให้ contract อื่นใช้ token แทนเราได้",
    long: "approve() เป็น function มาตรฐานของ ERC-20 ที่ user เรียกก่อน swap/lend/stake — บอก contract ปลายทางว่ายอมให้หยิบ token ได้กี่หน่วย. ทุก DApp ที่ใช้ token จะมีขั้นตอน approve ก่อน action จริง 1 ครั้ง.",
    vetContext:
      "เปรียบเหมือนเซ็นใบยินยอมก่อนเข้าผ่าตัด — เซ็นทีเดียว ใช้ได้ทั้งคอร์ส (ภายในวงเงิน)",
    related: ["Allowance", "ERC-20", "Signature"],
  },
  {
    en: "Attestation",
    th: "การยืนยันออน-เชน",
    short:
      "บันทึก fact เกี่ยวกับ wallet/บุคคลลงบน chain — ใครก็ verify ได้",
    long: "Attestation คือการที่ wallet หนึ่ง 'รับรอง' บางอย่างเกี่ยวกับ wallet อื่น เช่น ผ่าน KYC, จบหลักสูตร, เข้า event. ผ่านมาตรฐาน EAS (Ethereum Attestation Service) สามารถเก็บ structured data ลง chain โดยไม่ต้อง deploy contract ใหม่.",
    vetContext:
      "CUVETSMO ใช้ EAS attestation บันทึก 'นิสิตคนนี้จบ Wallet 101' — เป็น credential digital ที่ไม่อยู่ใน server ของเรา ใครก็ verify ได้แม้สโมจะหายไป",
    related: ["EAS", "Schema (EAS)", "SBT"],
  },
  {
    en: "Audit",
    th: "การตรวจสอบสัญญา",
    short:
      "การจ้างผู้เชี่ยวชาญตรวจ code smart contract ก่อน deploy mainnet",
    long: "Smart contract audit เป็นกระบวนการที่ทีม security เช่น OpenZeppelin, Trail of Bits, Spearbit อ่าน code ทีละบรรทัด หา bug, reentrancy, integer overflow, access control hole. ค่าใช้จ่ายตั้งแต่ $20k ถึง $200k+ ตามความซับซ้อน.",
    vetContext:
      "เหมือน peer review งานวิจัยก่อนตีพิมพ์ — code ที่จะถือเงินคนอื่นต้องผ่านสายตาอีกคนก่อน",
    related: ["Smart Contract", "Bug Bounty"],
  },
  {
    en: "Base URI",
    th: "URL ฐานของ metadata",
    short:
      "Prefix ของ tokenURI ที่ใช้ร่วมกันทุก token id ใน collection เดียว",
    long: "Base URI เป็น string ที่ contract ของ NFT collection เก็บไว้ แล้ว append id ของ token ต่อท้ายเมื่อมีคนถาม tokenURI. เช่น base = 'ipfs://Qmxxx/' แล้ว tokenURI(7) = 'ipfs://Qmxxx/7.json'. ประหยัด storage on-chain.",
    related: ["Metadata", "tokenURI", "NFT"],
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
    vetContext:
      "นึกถึงสมุดบันทึกการรักษาที่ทุกคลินิกในจังหวัดมีเหมือนกันทุกหน้า — แก้ที่เดียวไม่ได้ เพราะอีก 99 เล่มยังจำของจริงไว้",
    related: ["L1", "L2", "Smart Contract"],
  },
  {
    en: "Bug Bounty",
    th: "รางวัลแจ้งช่องโหว่",
    short:
      "โปรแกรมตั้งรางวัลให้คนแจ้งช่องโหว่ของ contract ก่อนถูก exploit",
    long: "Bug bounty คือ การที่ protocol ตั้งเงินรางวัลขั้นบันได (เช่น $10k–$1M) ให้คนที่หา bug แล้วรายงานก่อนใช้โจมตี. ใหญ่ที่สุดคือ Immunefi marketplace. รางวัลเป็น % ของ TVL ที่ปกป้องไว้.",
    related: ["Audit", "Smart Contract"],
  },
  {
    en: "Bundler",
    th: "ผู้รวมธุรกรรม (ERC-4337)",
    short:
      "Service ที่รวม UserOp หลายตัวส่งเป็น 1 transaction บน chain",
    long: "ใน ERC-4337 user ไม่ได้ส่ง transaction ตรง แต่ลงนาม UserOperation แล้วส่งให้ bundler. Bundler รวม UserOps จากหลายคนเป็น 1 tx ที่เรียก EntryPoint contract — efficient + sponsor gas ได้.",
    related: ["Account Abstraction", "Paymaster"],
  },
  {
    en: "Burnable",
    th: "เผาทำลายได้",
    short:
      "Token ที่มี function ทำลายตัวเองได้ — supply ลดถาวร",
    long: "burn() เป็น function ที่ส่ง token ไป address 0x000...0 (dead address) ลด totalSupply ถาวร. ใช้ใน deflationary token, redemption flow, หรือลบ NFT/SBT ที่ผิดพลาด.",
    vetContext:
      "ถ้า SBT issuance ผิดพลาด admin สามารถ burn ใบเดิมแล้ว mint ใหม่ได้ — เหมือนยกเลิกใบรับรองเก่าออกใบใหม่",
    related: ["Mintable", "Token", "Supply"],
  },
  {
    en: "Censorship Resistance",
    th: "ทนทานต่อการเซ็นเซอร์",
    short:
      "คุณสมบัติของ chain ที่ไม่มีหน่วยงานเดียวห้าม transaction ของใครได้",
    long: "Censorship resistance หมายถึงโครงสร้างที่ไม่มีจุดเดียว (node, validator, รัฐบาล) สามารถบล็อก transaction ของ wallet ใด wallet หนึ่งได้ตลอดไป — เพราะถ้า node A ปฏิเสธ ก็ยัง node B ที่ยินดีรวม. L2 ที่มี sequencer เดียวจะ resistance น้อยกว่า L1.",
    related: ["Validator", "Sequencer", "Blockchain"],
  },
  {
    en: "Clone (EIP-1167)",
    th: "โคลนสัญญาแบบประหยัด",
    short:
      "Minimal proxy ที่ deploy ใหม่ราคาถูกมาก — share code กับ implementation เดียว",
    long: "EIP-1167 'Minimal Proxy' เป็นเทคนิคที่ลด deploy gas จาก ~2M เหลือ ~50k โดย deploy proxy ตัวเล็กที่ delegatecall ไปยัง implementation ตัวเดียว. ใช้ใน factory pattern กับ The Lab ของเรา.",
    vetContext:
      "ทุก ERC-20 ที่ Token Forge สร้าง ใช้ clone ทั้งหมด — เลยถูกกว่า deploy สดทุกครั้งเป็นพันเท่า",
    related: ["Factory Pattern", "Proxy", "Smart Contract"],
  },
  {
    en: "DAO",
    th: "องค์กรอัตโนมัติแบบกระจายอำนาจ",
    short:
      "Decentralized Autonomous Organization — องค์กรที่ตัดสินใจผ่าน vote on-chain ของสมาชิก",
    long: "DAO คือ smart contract ที่จัดการกฎเกณฑ์การตัดสินใจของกลุ่ม — เสนอ proposal, vote, execute อัตโนมัติ. สมาชิก vote ได้ผ่าน token (governance token) หรือ SBT (one-person-one-vote).",
    vetContext:
      "Vet DAO ของเราใช้ Vet SBT Card เป็นสิทธิ์ vote — หนึ่งคนหนึ่งเสียง ไม่ใช่หนึ่งเหรียญหนึ่งเสียง เพราะนี่คือ organization ไม่ใช่ corporation",
    related: ["Governor", "SBT", "Token", "Quorum"],
  },
  {
    en: "DeFi",
    th: "การเงินกระจายอำนาจ",
    short:
      "Decentralized Finance — บริการการเงินที่ไม่มีคนกลาง — swap, lending, derivatives",
    long: "DeFi คือ ecosystem ของ smart contract ที่ทำหน้าที่แทน bank/broker — swap (Uniswap), lend (Aave), derivative (GMX), stablecoin (DAI). ทุก protocol โปร่งใส ตรวจสอบ code ได้ แต่ก็มี risk จาก smart contract bug.",
    vetContext:
      "CUVETSMO ไม่ทำ DeFi ที่ user เสี่ยงเงินจริง — เราอยู่ใน educational scope เท่านั้น",
    related: ["AMM", "ERC-20", "Smart Contract", "Yield Farming"],
  },
  {
    en: "EAS",
    th: "Ethereum Attestation Service",
    short:
      "มาตรฐานสำหรับ attestation บน chain — schema-based, ใช้ร่วมกันได้ทั่ว ecosystem",
    long: "EAS (attest.org) คือ infrastructure layer ที่ให้ใครก็ตามนิยาม schema (เช่น 'ผ่าน KYC', 'จบคอร์ส X') แล้วออก attestation ลง chain โดยไม่ต้อง deploy contract เอง. รองรับทั้ง on-chain และ off-chain mode.",
    vetContext:
      "Welfare event attendance, course completion, peer review — ทุกอย่างเป็น EAS attestation ที่ schema เปิดให้คนอื่นใช้ต่อได้",
    related: ["Attestation", "Schema (EAS)", "Oracle"],
  },
  {
    en: "EIP-712",
    th: "การลงนามข้อความมีโครงสร้าง",
    short:
      "มาตรฐาน sign typed structured data — wallet โชว์ข้อความอ่านง่ายแทน hex จุก ๆ",
    long: "EIP-712 บอก format การ sign message ที่มี structure (name, type, value) ทำให้ wallet โชว์ field-by-field ใน prompt — user เห็นชัดว่ากำลังเซ็นอะไร. ใช้ใน permit (gasless approve), Snapshot vote, OpenSea listing.",
    related: ["Signature", "EIP-4337", "Permit"],
  },
  {
    en: "EIP-4337",
    th: "บัญชี smart contract มาตรฐาน",
    short:
      "Account Abstraction implementation ที่ไม่ต้องแก้ Ethereum protocol",
    long: "EIP-4337 deploy ระบบ smart contract account แบบ in-protocol simulation ผ่าน EntryPoint + Bundler + Paymaster — ทำงานได้บน EVM chain ทุกตัวโดยไม่ต้อง fork. คือฐานของ embedded wallet ยุคใหม่.",
    related: ["Account Abstraction", "Bundler", "Paymaster"],
  },
  {
    en: "ERC-20",
    th: "มาตรฐานเหรียญ (fungible token)",
    short:
      "มาตรฐาน token ที่ทุกตัวเหมือนกัน (เช่น USDC, DAI) — interchangeable",
    long: "ERC-20 คือ interface มาตรฐานของ fungible token บน Ethereum — กำหนด function เช่น transfer, balanceOf, approve. ทำให้ wallet/exchange/DApp ทุกตัวอ่านและส่งเหรียญแบบเดียวกันได้.",
    vetContext:
      "Token Forge ใน The Lab สร้าง ERC-20 ออกมาให้ใช้กับชมรม — เช่น 'VET Points' แลก sticker ปลายปี",
    related: ["Token", "ERC-721", "ERC-1155", "Fungible"],
  },
  {
    en: "ERC-721",
    th: "มาตรฐาน NFT",
    short:
      "Non-Fungible Token — แต่ละ id ไม่เหมือนกัน (เช่น CryptoPunks, รูปวาด)",
    long: "ERC-721 กำหนดให้ token แต่ละตัวมี id เฉพาะและ metadata ไม่ซ้ำกัน. ใช้สำหรับ digital art, ที่ดินใน metaverse, ตั๋ว event, certificate.",
    related: ["NFT", "ERC-1155", "SBT", "Non-fungible"],
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
    en: "Factory Pattern",
    th: "รูปแบบโรงงาน contract",
    short:
      "Smart contract ที่ deploy contract ลูกแบบ on-demand — ใช้ใน The Lab",
    long: "Factory เป็น contract ที่ฝัง implementation address ไว้แล้ว user เรียก createXxx() → factory deploy clone (EIP-1167) ของ implementation นั้น → คืน address ใหม่. ลด gas และ centralize logic ของ collection ทุกตัว.",
    vetContext:
      "TokenFactory, NFTFactory, SBTFactory, GovernorFactory ของเรา ทุกตัวคือ factory — user คลิก deploy 1 ปุ่ม factory ก็ clone ใหม่ให้",
    related: ["Clone (EIP-1167)", "Proxy", "Smart Contract"],
  },
  {
    en: "Faucet",
    th: "ก๊อกน้ำ (testnet)",
    short:
      "บริการแจก test ETH ฟรีบน testnet สำหรับทดสอบ — ไม่มีมูลค่าจริง",
    long: "Faucet เป็น smart contract หรือเว็บที่แจก test ETH (เช่น Base Sepolia ETH) ให้ developer ทดสอบโดยไม่ต้องใช้เงินจริง. มี rate limit (เช่น 0.01 ETH ต่อวัน) ป้องกัน abuse.",
    vetContext:
      "CUVETSMO sponsor faucet drip ให้ Wallet 101 users — เริ่มทดลองโดยไม่ต้องไปขอที่อื่น",
    related: ["Testnet", "Gas"],
  },
  {
    en: "Finality",
    th: "ความถาวรของธุรกรรม",
    short:
      "จุดที่ transaction กลับไปไม่ได้แล้ว — บน Ethereum ~12 นาที, บน L2 reorg ได้",
    long: "Finality หมายถึงเวลาที่ chain garantuee ว่า block จะไม่ถูก revert. Ethereum L1 มี 'economic finality' หลัง 2 epochs (~12 นาที). L2 finality ขึ้นอยู่กับ challenge period (Optimistic = 7 วัน) หรือ ZK proof time (ZK rollup = นาที).",
    related: ["Blockchain", "Validator", "Rollup"],
  },
  {
    en: "Fungible",
    th: "แลกเปลี่ยนได้เท่า ๆ กัน",
    short:
      "ทุกหน่วยเหมือนกัน แลกกันได้ — เหรียญ 10 บาท แลกอีกเหรียญ 10 บาท",
    long: "Fungible คือคุณสมบัติของสิ่งที่ทุกหน่วยมีค่าเท่ากันและสับเปลี่ยนได้. เงิน, ทอง, ETH, USDC เป็น fungible. รูปภาพต้นฉบับ, ตั๋วเครื่องบินที่จองชื่อแล้ว, ปริญญาบัตร เป็น non-fungible.",
    related: ["Non-fungible", "ERC-20", "Token"],
  },
  {
    en: "Gas",
    th: "ค่าก๊าซ (transaction fee)",
    short:
      "ค่าธรรมเนียมการรัน transaction บน chain — จ่ายให้ validator/sequencer",
    long: "Gas คือหน่วยวัด computation ของ transaction บน Ethereum. ราคาต่อหน่วย (gas price, gwei) ผันแปรตาม demand. Total fee = gas used × gas price. บน L2 อย่าง Base ค่า gas ถูกกว่า mainnet 10–100x.",
    vetContext:
      "ใน CUVETSMO เราใช้ paymaster sponsor gas ให้ user — กดปุ่ม mint SBT แล้วระบบจ่ายเอง user ไม่ต้องมี ETH",
    related: ["Account Abstraction", "Paymaster", "Transaction"],
  },
  {
    en: "Governance",
    th: "การปกครอง on-chain",
    short:
      "กระบวนการตัดสินใจของกลุ่มผ่าน proposal และ vote",
    long: "Governance ใน web3 มักหมายถึงระบบที่ token หรือ SBT holder เสนอและ vote เปลี่ยนพารามิเตอร์ของ protocol — เช่น แก้ค่า fee, อนุมัติ treasury spend, ปลด council. Implementation นิยมคือ Governor (OpenZeppelin) + Timelock.",
    vetContext:
      "Vet DAO ใช้ governance ตัดสินใจ Welfare Treasury — proposal ตั้งกี่บาท, vote ผ่านกี่ %, execute อัตโนมัติ",
    related: ["DAO", "Governor", "Quorum"],
  },
  {
    en: "Governor",
    th: "ผู้ดูแล governance contract",
    short:
      "Contract มาตรฐาน OpenZeppelin ที่จัดการ proposal lifecycle ของ DAO",
    long: "Governor เป็น contract pattern ที่ implement Compound-style governance: propose → vote → queue → execute. ทำงานคู่กับ Timelock (เก็บ tx รอ delay ก่อน execute) และ Token (ใช้นับเสียง).",
    related: ["DAO", "Governance", "Quorum"],
  },
  {
    en: "Hash",
    th: "ค่าแฮช",
    short:
      "ลายนิ้วมือคงที่ของข้อมูล — แก้ 1 bit hash ก็เปลี่ยนหมด",
    long: "Hash function เช่น keccak256 รับข้อมูลขนาดเท่าไหร่ก็ได้ คืน string ยาว 32 byte ที่เป็น deterministic. ใช้ทำ transaction id, address derivation, signature input, commitment scheme.",
    vetContext:
      "tx hash บน BaseScan คือ keccak256 ของ transaction ทั้งก้อน — แตะ 1 bit hash เปลี่ยน เหมือนเลข lot ยาที่ระบุล็อตเดียวในโลก",
    related: ["Signature", "Transaction"],
  },
  {
    en: "Impermanent Loss",
    th: "การสูญเสียชั่วคราว (LP)",
    short:
      "การที่ LP ขาดทุนเทียบกับการถือ token เฉย ๆ เมื่อราคา 2 ตัวใน pool เคลื่อนต่างกัน",
    long: "เมื่อ LP ฝาก token A+B ใน pool, ราคา 2 ตัวเลื่อนแบบ asymmetric, AMM rebalance ratio ทำให้ LP มี token ราคาตกมากขึ้น. ค่าขาดทุน 'impermanent' จะกลายเป็น real ถ้า withdraw ในตอนนั้น.",
    vetContext:
      "Swap Sandbox ของเรามี IL Simulator — ปรับ price ratio แล้วเห็นกราฟ loss เลย เหมือนจำลอง dose-response ของยา",
    related: ["AMM", "Liquidity Pool", "Slippage"],
  },
  {
    en: "IPFS",
    th: "ไอพีเอฟเอส",
    short:
      "InterPlanetary File System — ระบบเก็บไฟล์แบบกระจายไม่มี central server",
    long: "IPFS เป็น protocol เก็บไฟล์แบบ content-addressed — ชี้ไฟล์ด้วย hash (CID) แทน URL. ไฟล์เดิม hash เดิมเสมอ. ใช้เก็บ metadata + image ของ NFT บ่อย เพราะ on-chain เก็บเองแพง.",
    vetContext:
      "Vet SBT Card metadata (รูป profile, badge list, year) เก็บใน Pinata pinned IPFS — เปลี่ยน server ไม่ได้, contract เก็บแค่ CID",
    related: ["NFT", "SBT", "Metadata"],
  },
  {
    en: "L2",
    th: "เลเยอร์ 2",
    short:
      "Chain ที่รันบน L1 — เร็วกว่าและถูกกว่า เช่น Base, Optimism, Arbitrum",
    long: "L2 (Layer 2) เป็น chain ที่ใช้ Ethereum mainnet เป็น base layer สำหรับ security แต่ประมวลผล transaction บน L2 เอง — gas ถูกลง 10–100x, throughput สูงขึ้น. มี 2 แบบหลัก: optimistic rollup (Base, Optimism, Arbitrum) และ ZK rollup (zkSync, Linea).",
    vetContext:
      "CUVETSMO ใช้ Base (Coinbase L2) — gas ถูก, ecosystem โต, developer tools ดี",
    related: ["L1", "Blockchain", "Gas", "Rollup"],
  },
  {
    en: "Liquidity Pool",
    th: "สระสภาพคล่อง",
    short:
      "Contract ที่เก็บ token 2 ตัว ให้คนอื่น swap ได้",
    long: "Liquidity pool เป็น core primitive ของ DeFi — LP (Liquidity Provider) ฝาก token A+B เข้า pool ในอัตราเท่ากันตามราคาตลาด, ได้ค่า fee จากทุก swap. AMM ใช้ pool คำนวณราคา.",
    related: ["AMM", "Impermanent Loss", "Yield Farming"],
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
    en: "Mempool",
    th: "แอ่งธุรกรรมรอเข้า block",
    short:
      "ที่พักของ transaction ที่ส่งแล้วแต่ยังไม่เข้า block",
    long: "Mempool เป็น public buffer ของ tx ที่ wallet broadcast ออกมา รอ validator/sequencer หยิบเข้า block. Tx ที่ตั้ง gas สูงจะถูกหยิบก่อน (priority). MEV searcher จับตา mempool แบบ realtime หาช่อง arbitrage.",
    related: ["MEV", "Transaction", "Validator"],
  },
  {
    en: "Metadata",
    th: "ข้อมูลกำกับ NFT",
    short:
      "JSON ที่บอกชื่อ, รูป, attribute ของ NFT แต่ละตัว",
    long: "Metadata คือ object {name, description, image, attributes} ที่อ้างผ่าน tokenURI. มาตรฐาน OpenSea คือ JSON บน IPFS. ใน CUVETSMO Vet SBT Card metadata เก็บ year, faculty, badge list.",
    related: ["NFT", "tokenURI", "IPFS"],
  },
  {
    en: "MEV",
    th: "มูลค่าที่ผู้จัดเรียงดึงได้",
    short:
      "Maximal Extractable Value — กำไรที่ validator/sequencer ดึงได้จากการเรียง tx",
    long: "MEV คือกำไรที่ผู้มีอำนาจจัดเรียง transaction (validator บน L1, sequencer บน L2) ทำได้ — เช่น front-run swap ใหญ่, sandwich attack, arbitrage. โครงการ MEV-Boost ทำให้ tx ราคาดีกระจายไปทุก validator แทนกระจุกที่ตัวเดียว.",
    related: ["Mempool", "Validator", "Sequencer"],
  },
  {
    en: "Mintable",
    th: "สร้างเพิ่มได้",
    short:
      "Token ที่ owner สามารถสร้างเพิ่ม supply ได้หลัง deploy",
    long: "Mintable contract มี function mint() ที่จำกัดสิทธิ์ผ่าน access control (owner, role). ตรงข้ามกับ fixed supply ที่ supply กำหนดตอน deploy ไม่ได้เพิ่มอีก.",
    vetContext:
      "Vet SBT Card คือ mintable — admin ออกใบใหม่ให้นิสิตเข้าใหม่ทุกปี",
    related: ["Burnable", "Token", "Supply"],
  },
  {
    en: "NFT",
    th: "เอ็นเอฟที (Non-Fungible Token)",
    short:
      "Token ที่แต่ละตัวไม่เหมือนกัน — ใช้ represent digital art, ตั๋ว, certificate",
    long: "NFT (Non-Fungible Token) คือ token ที่มี id เฉพาะและ metadata (รูป, ชื่อ, attributes) ไม่ซ้ำกัน. ตรงข้ามกับ fungible token เช่น USDC ที่ทุกเหรียญแลกกันได้. ส่วนใหญ่ใช้ ERC-721 หรือ ERC-1155.",
    vetContext:
      "POAP (proof-of-attendance NFT) ใช้บอกว่ามาร่วม event ของสโมจริง — ในอนาคตอาจใช้แทนการเซ็นชื่อกระดาษ",
    related: ["ERC-721", "ERC-1155", "SBT", "Metadata"],
  },
  {
    en: "Non-fungible",
    th: "แลกเปลี่ยนได้ไม่เท่ากัน",
    short:
      "ทุกหน่วยมี identity ของตัวเอง — โอนตามชื่อไม่ได้ swap ทั่วไป",
    long: "Non-fungible หมายถึง asset ที่แต่ละหน่วยมี id หรือคุณสมบัติเฉพาะที่แตกต่าง. NFT (ERC-721) เป็นตัวอย่างทาง chain. เลขทะเบียนรถ, ใบรับรอง, ที่ดิน, ภาพต้นฉบับ เป็น non-fungible โลกจริง.",
    related: ["Fungible", "NFT", "ERC-721"],
  },
  {
    en: "Oracle",
    th: "ผู้ส่งข้อมูลนอกเชน",
    short:
      "Service ที่นำข้อมูลจาก off-chain (ราคา, อากาศ, ข่าว) ขึ้น chain",
    long: "Smart contract อ่านโลกภายนอกไม่ได้โดยตรง. Oracle เช่น Chainlink, Pyth, RedStone เป็น service ที่รวบรวมข้อมูลจาก source ที่ไว้ใจได้ ลงทะเบียนบน chain ให้ contract อ่าน. Oracle attack เป็นช่องโหว่ DeFi ใหญ่.",
    related: ["DeFi", "Smart Contract", "Attestation"],
  },
  {
    en: "Paymaster",
    th: "ผู้จ่ายค่า gas แทน",
    short:
      "Contract ที่ sponsor ค่า gas ให้ user — user ไม่ต้องมี ETH",
    long: "Paymaster เป็น component ของ ERC-4337 ที่ deposit ETH ไว้กับ EntryPoint แล้วยอมจ่าย gas ให้ UserOp ตามเงื่อนไข (whitelist, signature, token swap). โครงการ CDP ของ Coinbase ก็ให้ free paymaster credits.",
    vetContext:
      "ใน Vet SBT mint flow paymaster ของ CUVETSMO จ่ายให้ทุกใบ — user เพิ่งสมัครก็ mint ได้ทันทีไม่ต้องเติม ETH",
    related: ["Account Abstraction", "EIP-4337", "Gas"],
  },
  {
    en: "Pausable",
    th: "หยุดชั่วคราวได้",
    short:
      "Contract ที่ admin สั่งหยุด function สำคัญได้ฉุกเฉิน",
    long: "OpenZeppelin Pausable mixin ให้ contract มี flag paused + modifier whenNotPaused. ตอนเจอ exploit จริง admin pause ทุกการเคลื่อน asset เพื่อ defend. trade-off คือ centralization risk.",
    related: ["Smart Contract", "Ownable", "Audit"],
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
    en: "Proxy",
    th: "พร็อกซีสัญญา",
    short:
      "Contract ที่ delegatecall ไปยัง implementation — ทำให้ upgrade code ได้",
    long: "Proxy pattern แยก storage (อยู่บน proxy) ออกจาก logic (อยู่บน implementation). Admin สั่ง upgrade implementation ใหม่ได้ — storage ไม่หาย. Trade-off คือต้องไว้ใจ admin ไม่กดปุ่ม malicious.",
    related: ["Clone (EIP-1167)", "Upgradeability", "Smart Contract"],
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
    en: "Quorum",
    th: "องค์ประชุม",
    short:
      "จำนวนเสียงขั้นต่ำที่ proposal ต้องการเพื่อให้ผ่าน",
    long: "Quorum ใน DAO คือ % ของ token supply (หรือจำนวน SBT holder) ที่ต้อง vote ก่อน proposal จะถือว่าผ่าน — ป้องกัน proposal ผ่านด้วยเสียงเล็ก ๆ. CUVETSMO Governor กำหนด quorum 10% ของ SBT holder ที่ active.",
    vetContext:
      "ถ้า quorum SBT 10% หมายความว่าใน 100 นิสิตที่ถือ SBT ต้องมาโหวต ≥10 คน ไม่งั้น proposal ไม่ผ่าน แม้ทุกคน vote yes",
    related: ["DAO", "Governance", "Governor"],
  },
  {
    en: "Rollup",
    th: "การม้วนรวมธุรกรรม (L2)",
    short:
      "เทคนิคที่บีบ tx หลายตัวให้กลายเป็น 1 batch post ลง L1",
    long: "Rollup ทำงานโดยรวม tx หลายร้อยตัวบน L2 แล้ว post 'summary' (calldata) ลง L1 mainnet. 2 แบบหลัก: Optimistic (สมมติว่าถูก, มี challenge period 7 วัน) และ ZK (มี cryptographic proof, finality ไว). Base ใช้ Optimistic rollup.",
    related: ["L2", "Finality", "Sequencer"],
  },
  {
    en: "Royalty",
    th: "ค่ารอยัลตี้ NFT",
    short:
      "ค่า % ที่ creator ของ NFT ได้รับทุกครั้งที่มีการขายต่อ",
    long: "EIP-2981 'NFT Royalty Standard' ให้ contract บอก marketplace ว่าทุกการ resale ต้องส่งค่า royalty (เช่น 5%) ให้ address X. Marketplace ใหญ่บางตัว (Blur) ละเลย royalty ทำให้ creator เสียรายได้.",
    related: ["NFT", "ERC-721"],
  },
  {
    en: "SBT",
    th: "เอสบีที (Soulbound Token)",
    short:
      "NFT ที่โอนไม่ได้ — ผูกกับ wallet ถาวร — ใช้แทน identity/credential",
    long: "SBT (Soulbound Token) คือ NFT ที่ disable transfer function ทำให้โอนหาคนอื่นไม่ได้. ใช้แทน identity, credential, achievement — สิ่งที่ไม่ควรซื้อขายได้ (เช่น ปริญญาบัตร, attendance record).",
    vetContext:
      "Vet SBT Card คือ identity ของนิสิตสัตวแพทย์ CU — ผูกกับ wallet ถาวร ขายไม่ได้ ใช้ยืนยันสิทธิ์ vote/เข้าระบบสโม",
    related: ["NFT", "ERC-721", "DAO", "Soulbound"],
  },
  {
    en: "Schema (EAS)",
    th: "โครงสร้าง attestation (EAS)",
    short:
      "Template ของ field ใน attestation — ใช้ร่วมกันข้าม contract ได้",
    long: "Schema ใน EAS กำหนดว่า attestation type นี้มี field อะไรบ้าง (เช่น 'courseId: string, grade: uint8'). Schema มี UID ของตัวเอง คนอื่นใช้ schema เดิมออก attestation ของตัวเองได้ — เกิด ecosystem ของ credential ที่ตีความเหมือนกัน.",
    related: ["EAS", "Attestation"],
  },
  {
    en: "Sequencer",
    th: "ตัวจัดเรียง (L2)",
    short:
      "Service ของ L2 ที่จัดเรียง tx เป็น block ก่อน post ขึ้น L1",
    long: "Sequencer คือ component กลางของ L2 rollup ที่รับ tx จาก user เรียงลำดับ, รัน execution, สร้าง batch ส่งขึ้น L1. ปัจจุบัน Base, Optimism, Arbitrum ใช้ sequencer เดียว (ทีม core) ซึ่งทำให้ censorship resistance ต่ำกว่า L1 — แต่กำลังพัฒนา decentralized sequencer.",
    related: ["L2", "Rollup", "MEV", "Censorship Resistance"],
  },
  {
    en: "Signature",
    th: "ลายเซ็น",
    short:
      "การ sign message ด้วย private key เพื่อพิสูจน์ว่าเจ้าของ wallet ยินยอม",
    long: "Signature คือผลของการ encrypt hash ของ message ด้วย private key. ใครก็ verify ได้ว่ามาจาก wallet นี้จริง (ใช้ public key verify). ไม่ต้องส่ง transaction บน chain = ฟรี, ใช้บ่อยในการ login DApp และ off-chain vote (Snapshot).",
    vetContext:
      "เปรียบเหมือนเซ็นชื่อในเวชระเบียน — พิสูจน์ตัวตนได้แต่ไม่เปลี่ยนยอด lab",
    related: ["Private Key", "Public Key", "Wallet", "EIP-712"],
  },
  {
    en: "Slippage",
    th: "ค่าคลาดเคลื่อนราคา",
    short:
      "% ที่ราคา swap จริงต่างจากที่คาดไว้ตอนกดปุ่ม",
    long: "Slippage เกิดจาก 2 สาเหตุ: (1) ราคา pool เลื่อนระหว่าง user กดปุ่มกับ tx confirm, (2) order ใหญ่เทียบ pool ทำให้ราคาขยับ. user ตั้ง slippage tolerance (เช่น 0.5%) — เกินกว่านั้น tx revert.",
    vetContext:
      "ใน Swap Sandbox ลองเปลี่ยน slippage 0.1% → 5% แล้วเห็นว่า tx ยอมรับช่วงราคาได้แค่ไหน",
    related: ["AMM", "Liquidity Pool"],
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
    en: "Soulbound",
    th: "ผูกวิญญาณ (โอนไม่ได้)",
    short:
      "คุณสมบัติของ token ที่ disable transfer — ผูกกับ wallet ถาวร",
    long: "Soulbound เป็นแนวคิดที่ Vitalik เสนอ ปี 2022 — credential, identity, reputation ไม่ควรซื้อขายได้. SBT คือ implementation ที่ปิด transfer function (override revert).",
    related: ["SBT", "NFT", "Non-fungible"],
  },
  {
    en: "Staking",
    th: "การล็อกเหรียญรับรางวัล",
    short:
      "ฝาก token เข้า contract เพื่อ secure network หรือ earn yield",
    long: "Staking มี 2 ความหมายหลัก: (1) Proof-of-Stake validator ล็อก ETH เพื่อ propose block ได้รางวัล + ถูก slash ถ้าโกง. (2) DeFi user ล็อก token ใน vault รับ APY จาก protocol revenue.",
    related: ["Yield Farming", "Validator"],
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
    en: "tokenURI",
    th: "ที่อยู่ metadata ของ NFT",
    short:
      "Function ที่คืน URL ของไฟล์ JSON metadata ของ token id หนึ่ง",
    long: "tokenURI(id) เป็น function มาตรฐาน ERC-721 ที่คืน string URI (HTTP/IPFS/data:) ชี้ไปยัง JSON metadata. Marketplace (OpenSea) เรียก function นี้แสดงรูป + name + attributes.",
    related: ["NFT", "Metadata", "Base URI"],
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
    en: "Transfer",
    th: "การโอน",
    short:
      "การส่ง token จาก wallet หนึ่งไปอีก wallet หนึ่ง",
    long: "transfer() เป็น function มาตรฐานทั้ง ERC-20 และ ERC-721. เพียง wallet ปลายทาง address — chain เปลี่ยน balance/owner ทันที (atomic, 1 block). SBT ปิด transfer ทำให้โอนหากันไม่ได้.",
    related: ["Approve", "Allowance", "Soulbound"],
  },
  {
    en: "Upgradeability",
    th: "ความสามารถอัปเกรด contract",
    short:
      "การออกแบบให้ logic ของ contract เปลี่ยนได้หลัง deploy",
    long: "Upgradeable contract ใช้ proxy pattern + storage layout fix + admin role. trade-off: ได้ flexibility แต่ user ต้องไว้ใจ admin (เพราะ admin upgrade เป็น code อะไรก็ได้). Best practice ใส่ timelock + multisig + on-chain governance.",
    related: ["Proxy", "Pausable", "Audit"],
  },
  {
    en: "Validator",
    th: "ผู้ตรวจสอบบล็อก (L1)",
    short:
      "Node ที่ stake ETH เพื่อมีสิทธิ์ propose/attest block บน Ethereum",
    long: "ใน Ethereum Proof-of-Stake validator ต้อง stake 32 ETH ขั้นต่ำ. ทุก 12 วินาที (1 slot) random เลือก 1 validator propose block และ committee attest. ถ้าโกง ถูก slash (โดน burn ETH).",
    related: ["Staking", "Mempool", "Finality"],
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
  {
    en: "Yield Farming",
    th: "การเก็บผลตอบแทน DeFi",
    short:
      "การฝาก/กู้/ผันเงิน เพื่อ maximize APY จาก protocol",
    long: "Yield farming คือ strategy ที่ user หมุนเงินผ่านหลาย protocol เพื่อสะสม reward token + LP fee. ความเสี่ยง: smart contract bug, impermanent loss, token price crash. ยุค 2020–21 ฮิตมาก (DeFi Summer).",
    vetContext:
      "ไม่อยู่ในขอบเขตของ CUVETSMO — เราโชว์ concept ใน Swap Sandbox แต่ไม่แนะนำให้ทำจริง",
    related: ["DeFi", "Liquidity Pool", "Staking"],
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
