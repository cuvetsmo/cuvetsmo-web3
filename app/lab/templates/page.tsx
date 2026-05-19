import type { Metadata } from "next";
import { TEMPLATES, readTemplateSource } from "./_lib/templates";
import { TemplateCard } from "./_card";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Library of audited-style template contracts: lottery, tip jar, staking, vesting, multisig, streaming, NFT staking. View source, fork on Remix, deploy.",
};

export default async function TemplatesPage() {
  const withSource = await Promise.all(
    TEMPLATES.map(async (t) => ({
      meta: t,
      source: await readTemplateSource(t.filename),
    })),
  );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          📚 Templates
        </h2>
        <p className="text-[var(--color-muted)] text-sm leading-relaxed max-w-3xl">
          Smart contract templates สำหรับใช้เป็น starting point — เปิดดู source
          ในเบราว์เซอร์, กด fork ไปแก้ใน Remix, หรือ deploy as-is (เร็วๆ นี้
          ใน Wave 3). โค้ดทั้งหมดเป็น educational ยังไม่ audit — อย่าใช้กับ
          ของจริงที่มีมูลค่า.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {withSource.map(({ meta, source }) => (
          <TemplateCard key={meta.slug} meta={meta} source={source} />
        ))}

        <a
          href="https://safe.global"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-5 hover:border-[var(--color-brand)] transition-colors"
        >
          <p className="text-2xl mb-1.5">🛡️</p>
          <h3 className="text-base font-semibold mb-1">Safe (production multisig)</h3>
          <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-3">
            ต้องการ multisig ของจริง? ใช้ Safe (เดิม Gnosis Safe) แทน — audit
            แล้ว, UI พร้อม, รองรับ Base mainnet/testnet.
          </p>
          <span className="text-xs text-[var(--color-brand)] font-medium">
            เปิด safe.global ↗
          </span>
        </a>
      </div>
    </main>
  );
}
