/**
 * Lab-wide disclaimer banner.
 * Shown once in the layout header — prominent because Lab deploys
 * user-created contracts that are NOT audited and NOT endorsed.
 */
export function LabDisclaimer() {
  return (
    <div className="mt-4 mb-1 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
      <span className="font-semibold">🧪 Testnet · Educational only</span>{" "}
      · contracts ยังไม่ได้ audit · user-created assets ไม่ได้รับการ endorse
      โดยสโมสรหรือคณะ · ใช้เพื่อเรียนรู้ web3 เท่านั้น · ห้ามใช้ deploy ของจริง
      ที่มีมูลค่าทรัพย์สิน.
    </div>
  );
}
