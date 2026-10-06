import { web3Context, web3Handoff } from '@/lib/athene-context'

export function AtheneGuide({ kind, reference }: { kind: 'quest' | 'lesson'; reference: string }) {
  const record = web3Context(kind, reference)
  const href = web3Handoff(kind, reference)
  if (!record || !href) return null
  return (
    <details className="my-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm">
      <summary className="cursor-pointer font-semibold text-[var(--color-brand)]">ให้ Athene ช่วยอธิบายบทเรียนนี้</summary>
      <p className="mt-3 font-semibold">{record.title}</p>
      <p className="mt-1 text-[var(--color-muted)]">{record.summary}</p>
      <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--color-muted)]">{record.points.map((point, index) => <li key={index}>{point}</li>)}</ul>
      <p className="mt-3 text-xs text-[var(--color-muted)]">เปิดร่างคำถามจากรหัสบทเรียนเท่านั้น ไม่ส่งข้อมูล wallet และไม่เซ็นหรือทำธุรกรรมให้</p>
      <a href={href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-lg border border-[var(--color-brand)] px-4 py-2 font-semibold text-[var(--color-brand)]">เปิดร่างคำถามใน Athene ↗</a>
    </details>
  )
}
