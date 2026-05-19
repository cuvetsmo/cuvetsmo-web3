"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * <WhatJustHappened /> — educational overlay shown after any on-chain action.
 *
 * Goal: explain in plain Thai what the blockchain did, link to BaseScan,
 * and let the user peek at the code + gas mechanics if curious.
 *
 * Wave 3 · Education Specialist.
 *
 * Mount as a slide-in panel from the right (mobile: full sheet from bottom)
 * after mint / sign / send / claim actions. Auto-opens once when `open=true`,
 * user can close with [esc] or the close button.
 *
 * Props are intentionally narrow so each call site stays declarative:
 *   action:   one of the known action keys (mint, sign, send, claim, deploy)
 *   txHash:   on-chain tx hash if any — renders a BaseScan link
 *   chainId:  defaults to base-sepolia (84532)
 *   summary:  optional 1-line override for the title in plain Thai
 *   codeNote: optional code snippet shown under "ดู code ที่เพิ่งรัน"
 */

export type WJHAction = "mint" | "sign" | "send" | "claim" | "deploy" | "vote";

type Props = {
  open: boolean;
  onClose: () => void;
  action: WJHAction;
  txHash?: `0x${string}` | string;
  chainId?: number;
  summary?: string;
  codeNote?: string;
};

const ACTION_COPY: Record<WJHAction, { title: string; sub: string; what: string }> = {
  mint: {
    title: "Mint สำเร็จแล้ว",
    sub: "สร้าง NFT ใหม่บน chain",
    what: "Smart contract สร้าง token id ใหม่ผูกกับ wallet ของคุณ แล้วบันทึก metadata ของมัน — ตั้งแต่นี้ไปทุกคนเปิด BaseScan เช็คได้ว่าใบนี้เป็นของคุณ.",
  },
  sign: {
    title: "ลงนามสำเร็จ",
    sub: "Sign message ด้วย private key",
    what: "Wallet เอา private key มา sign hash ของข้อความ — ใครก็ verify ได้ว่ามาจาก wallet ของคุณ แต่ไม่ส่ง tx ขึ้น chain เลยฟรี ไม่มีค่า gas.",
  },
  send: {
    title: "ส่งสำเร็จแล้ว",
    sub: "Transaction ขึ้น chain แล้ว",
    what: "Transaction ถูก broadcast เข้า mempool → sequencer หยิบเข้า block → state ของ chain อัปเดต. ผ่านไม่ถึง 2 วินาทีบน Base.",
  },
  claim: {
    title: "Claim สำเร็จ",
    sub: "Asset ใหม่อยู่ใน wallet แล้ว",
    what: "Contract บันทึก wallet ของคุณเป็นเจ้าของ SBT/badge ใบใหม่. โอนหาคนอื่นไม่ได้ — มันผูกกับ wallet นี้ตลอดไป.",
  },
  deploy: {
    title: "Deploy สำเร็จแล้ว",
    sub: "Smart contract ใหม่ live บน chain",
    what: "Factory contract clone implementation ที่ตรวจแล้วให้คุณ 1 ชุด แล้ว return address ใหม่. ตั้งแต่นี้ไปใครก็เรียก function ได้ตามที่ ABI กำหนด.",
  },
  vote: {
    title: "Vote ลงทะเบียนแล้ว",
    sub: "เสียงของคุณถูกบันทึก",
    what: "Governor contract เพิ่ม weight ของ wallet ลงใน proposal — เสียงทุกคนคิดเท่ากันเพราะใช้ SBT (1 wallet = 1 vote ไม่ใช่ 1 token = 1 vote).",
  },
};

function explorerLink(txHash: string, chainId: number): string {
  // Base Sepolia (84532) → sepolia.basescan.org
  // Base Mainnet (8453) → basescan.org
  const host = chainId === 8453 ? "basescan.org" : "sepolia.basescan.org";
  return `https://${host}/tx/${txHash}`;
}

export function WhatJustHappened({
  open,
  onClose,
  action,
  txHash,
  chainId = 84532,
  summary,
  codeNote,
}: Props) {
  const [showCode, setShowCode] = useState(false);
  const [showGas, setShowGas] = useState(false);

  if (!open) return null;

  const copy = ACTION_COPY[action];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wjh-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end"
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      {/* panel */}
      <div className="relative w-full sm:max-w-md sm:h-full sm:my-0 sm:rounded-none rounded-t-2xl bg-[var(--color-bg)] border-t sm:border-l border-[var(--color-border)] shadow-xl overflow-y-auto animate-[slideUp_0.25s_ease-out] sm:animate-[slideLeft_0.25s_ease-out]">
        <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
              เกิดอะไรขึ้นเมื่อกี้นี้
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-1.5 rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-6 space-y-5">
          <div>
            <h2 id="wjh-title" className="text-xl font-bold tracking-tight mb-1">
              {summary ?? copy.title}
            </h2>
            <p className="text-sm text-[var(--color-muted)]">{copy.sub}</p>
          </div>

          <div className="rounded-lg bg-[var(--color-brand-light)] border-l-4 border-[var(--color-brand)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)] mb-1">
              Chain ทำอะไรไป
            </p>
            <p className="text-sm leading-relaxed text-[var(--color-text)]">
              {copy.what}
            </p>
          </div>

          {txHash && (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-1">
                Transaction hash
              </p>
              <p className="font-mono text-xs break-all text-[var(--color-text)] mb-2">
                {txHash}
              </p>
              <a
                href={explorerLink(String(txHash), chainId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)] hover:underline"
              >
                ดูบน BaseScan
                <svg
                  aria-hidden
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </div>
          )}

          <details
            className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]"
            open={showCode}
            onToggle={(e) => setShowCode((e.target as HTMLDetailsElement).open)}
          >
            <summary className="px-4 py-3 cursor-pointer select-none list-none flex items-center justify-between text-sm font-medium">
              <span>ดู code ที่เพิ่งรัน</span>
              <svg
                aria-hidden
                className="transition-transform group-open:rotate-180"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]">
              <pre className="text-[11px] font-mono text-[var(--color-muted)] bg-[var(--color-bg)] rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
                {codeNote ?? defaultCodeFor(action)}
              </pre>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Source โค้ดของ contract เปิดให้ดูบน{" "}
                <a
                  href="https://github.com/cuvetsmo/cuvetsmo-web3/tree/main/contracts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-brand)] underline"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          </details>

          <details
            className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]"
            open={showGas}
            onToggle={(e) => setShowGas((e.target as HTMLDetailsElement).open)}
          >
            <summary className="px-4 py-3 cursor-pointer select-none list-none flex items-center justify-between text-sm font-medium">
              <span>ทำไมต้องจ่าย gas (และวันนี้คุณจ่ายเท่าไหร่)</span>
              <svg
                aria-hidden
                className="transition-transform group-open:rotate-180"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)] space-y-2 text-sm leading-relaxed">
              <p className="text-[var(--color-muted)]">
                Gas คือค่าใช้คอมพิวเตอร์ของทั้งเครือข่ายในการรัน transaction ของคุณ.
                บน Base Sepolia (testnet) ค่า gas เป็นศูนย์เพราะ ETH เป็นของปลอม.
                บน Base mainnet เฉลี่ย 0.0001–0.001 USD ต่อ tx — ต่ำกว่า Ethereum mainnet ~100 เท่า.
              </p>
              <p className="text-[var(--color-muted)]">
                ใน Phase 1+, CUVETSMO ใช้ paymaster (CDP) sponsor gas ให้นิสิตทั้งหมด —
                คุณไม่ต้องมี ETH ใน wallet ก็ทำ transaction ได้.
              </p>
              <Link
                href="/glossary#gas-link"
                className="inline-block text-xs text-[var(--color-brand)] hover:underline"
              >
                อ่านเพิ่ม Gas ใน Glossary →
              </Link>
            </div>
          </details>

          <div className="pt-3 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-brand text-sm"
            >
              เข้าใจแล้ว ทำต่อ
            </button>
            <Link
              href="/glossary"
              className="flex-1 btn-outline text-sm text-center"
            >
              ดูศัพท์เพิ่ม
            </Link>
          </div>
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function defaultCodeFor(action: WJHAction): string {
  switch (action) {
    case "mint":
      return `// VetSBTCard.sol — เรียก function นี้
function mintTo(address user, string calldata uri) external onlyMinter {
    _safeMint(user, nextId);
    _setTokenURI(nextId, uri);
    nextId++;
}`;
    case "sign":
      return `// client-side
const sig = await wallet.signMessage({
  message: "ยืนยันว่าฉันเป็นเจ้าของ wallet นี้"
});
// ไม่มี tx บน chain — ฟรี`;
    case "send":
      return `// ส่ง transaction มาตรฐาน
await wallet.sendTransaction({
  to: recipient,
  value: parseEther("0.001"),
  chainId: 84532
});`;
    case "claim":
      return `// VetSBTCard.sol
function claim(string calldata cid) external {
    require(!hasClaimed[msg.sender], "already claimed");
    hasClaimed[msg.sender] = true;
    _safeMint(msg.sender, nextId);
    _setTokenURI(nextId, cid);
    nextId++;
}`;
    case "deploy":
      return `// TokenFactory.sol
function createToken(string name, string symbol, uint256 supply)
    external returns (address)
{
    address token = Clones.clone(implementation);
    TokenImplementation(token).initialize(name, symbol, supply, msg.sender);
    emit TokenCreated(token, msg.sender);
    return token;
}`;
    case "vote":
      return `// Governor.sol
function castVote(uint256 proposalId, uint8 support) external returns (uint256) {
    address voter = _msgSender();
    return _castVote(proposalId, voter, support, "");
}`;
  }
}
