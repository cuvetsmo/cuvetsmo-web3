export type LearningStep = {
  id: number;
  title: string;
  subtitle: string;
  /** plain-language bullets shown as the body */
  bullets: string[];
  /** Optional vet analogy block — only shown if present */
  analogy?: { title: string; body: string };
  /** Optional micro illustration spec — emoji string for now */
  visual?: { emoji: string; caption: string };
  /** Optional handoff link for the last step */
  nextHref?: string;
  nextLabel?: string;
};

export const ZERO_TO_HERO_STEPS: LearningStep[] = [
  {
    id: 1,
    title: "Web3 คืออะไรใน 30 วินาที",
    subtitle: "เริ่มจากภาพง่ายๆ ก่อน",
    bullets: [
      "Web1 (1990s) คือ อ่านอย่างเดียว — เว็บข่าวสาร, สารานุกรม",
      "Web2 (2000s ถึงตอนนี้) คือ อ่าน + เขียนได้ แต่ ข้อมูลของคุณอยู่ที่บริษัท — Facebook, Google, ธนาคาร",
      "Web3 (ตั้งแต่ 2015) คือ อ่าน + เขียน + เป็นเจ้าของ ข้อมูลของคุณอยู่ใน wallet ของคุณเอง ไม่ได้อยู่ที่บริษัทใด",
    ],
    analogy: {
      title: "ลองเทียบกับเวชระเบียน",
      body: "เวชระเบียนใน Web2 คือไฟล์ที่อยู่ใน server ของโรงพยาบาล X — ถ้าโรงพยาบาลปิด ข้อมูลหาย. เวชระเบียนใน Web3 คือไฟล์ที่ผู้ป่วยเก็บเอง ทุกคลินิกที่ผู้ป่วยไปอ่านได้ตาม consent ของผู้ป่วย.",
    },
    visual: { emoji: "🌐", caption: "Web1 → Web2 → Web3" },
  },
  {
    id: 2,
    title: "ทำไมมันสำคัญกับ CUVET",
    subtitle: "ไม่ใช่แค่ crypto แต่คือเครื่องมือ",
    bullets: [
      "ใบรับรองที่ verify ได้แม้สโมเลิกอยู่ — ผ่าน SBT (โอนไม่ได้ ผูกกับตัวคุณ)",
      "การโหวตของชมรมที่นับเสียงโปร่งใส — ผ่าน DAO (ทุกคนตรวจสอบผลได้)",
      "Treasury ของชมรมที่ไม่ขึ้นกับบัญชีบุคคล — ทุกบาทดูบน BaseScan ได้",
      "Welfare event attendance ที่ไม่ต้องเซ็นชื่อกระดาษ — POAP NFT",
    ],
    analogy: {
      title: "ทำไมเริ่มที่สโม",
      body: "นิสิตคณะสัตวแพทย์อยู่ในจังหวะที่จะได้ใช้ web3 จริง — ใบรับรอง CE, ผลงานวิจัย, peer review. เรียนรู้ infrastructure ตั้งแต่ตอนนี้ไม่เสียเปรียบ.",
    },
    visual: { emoji: "🏥", caption: "เครื่องมือสำหรับงานจริง" },
  },
  {
    id: 3,
    title: "Wallet เหมือนกระเป๋าเงินจริงไหม",
    subtitle: "ทั้งใช่และไม่ใช่",
    bullets: [
      "ใช่ — มันคือที่เก็บ asset ของคุณ (เหรียญ, NFT, ใบรับรอง)",
      "ไม่ใช่ — มันเก็บ private key ไม่ใช่เก็บเหรียญจริงๆ. เหรียญอยู่บน chain. Wallet แค่ \"กุญแจ\"",
      "ใช่ — ใครจับ wallet คุณ ก็ใช้แทนคุณได้ (เหมือนกระเป๋าจริง)",
      "ไม่ใช่ — wallet ส่วนใหญ่บนเว็บฟรี ไม่ต้องลงทะเบียน ไม่ต้องเปิดบัญชีธนาคาร",
    ],
    analogy: {
      title: "เปรียบกับกุญแจตู้ยา",
      body: "ยาในตู้ก็ยังเป็นยา ไม่ว่าใครถือกุญแจ — แต่กุญแจมีคนเดียวที่เปิดได้. Private key คือกุญแจ, wallet คือพวงกุญแจ, ยาคือ asset บน chain.",
    },
    visual: { emoji: "🔑", caption: "Wallet = กุญแจ ไม่ใช่ตู้นิรภัย" },
  },
  {
    id: 4,
    title: "ลองทำ wallet กันได้เลย",
    subtitle: "5 นาทีที่ Wallet 101 — มีคนพาทำทีละขั้น",
    bullets: [
      "ใช้ CU email login ไม่ต้องโหลด extension อะไรเลย",
      "Privy จะสร้าง wallet ให้อัตโนมัติ ไม่ต้องเซฟ seed phrase",
      "ระบบ sponsor ค่า gas ให้ — คุณไม่ต้องมี ETH เลย",
      "จบขั้นตอนได้ SBT badge แรกของชีวิตเข้า wallet",
    ],
    analogy: {
      title: "ปลอดภัยพอไหม",
      body: "Privy ใช้ multi-party computation เก็บ key ไว้ใน 3 ที่ — ไม่มีที่ไหนรู้ key ทั้งหมด. ถ้าเครื่องคุณหาย ยัง recover ได้ผ่าน email ที่ใช้ตอน login.",
    },
    visual: { emoji: "👛", caption: "Click. Login. Done." },
    nextHref: "/learn/wallet-101",
    nextLabel: "ไปทำ Wallet 101 (5 นาที)",
  },
  {
    id: 5,
    title: "พร้อมแล้ว — เลือกเส้นทาง",
    subtitle: "หลังมี wallet จะไปต่อทางไหนก็ได้",
    bullets: [
      "Quest 1–10 — สอนทุก action พื้นฐาน แต่ละ quest ให้ SBT badge",
      "Vet SBT Card — claim ใบประจำตัวนิสิตสัตวแพทย์ digital",
      "Mint Playground — ลอง mint NFT แรกของตัวเอง",
      "Token Forge — สร้าง ERC-20 ของกลุ่ม/ชมรมใน 60 วินาที",
    ],
    visual: { emoji: "🚀", caption: "พื้นฐานครบ — ลุยต่อได้แล้ว" },
    nextHref: "/learn/quests",
    nextLabel: "ดู Web3 Quests ทั้ง 10 ข้อ",
  },
];


