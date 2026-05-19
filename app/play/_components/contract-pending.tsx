import Link from "next/link";

/**
 * Banner shown when the contract address for a Play feature is still
 * zero (Agent A hasn't published the address yet).
 *
 * Renders inline above the disabled action so users see WHY a button
 * doesn't work rather than wondering at silence.
 */
export function ContractPending({
  contractName,
  fallback,
}: {
  contractName: string;
  fallback?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="rounded-lg border border-dashed border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm leading-relaxed"
    >
      <p className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
        Deploying soon · กำลัง deploy
      </p>
      <p className="text-amber-700/90 dark:text-amber-300/90 mb-2">
        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40">
          {contractName}
        </span>{" "}
        ยังไม่ live · contract กำลังถูก deploy โดย Agent A. ลองกลับมาดูใหม่ภายในวันนี้.
      </p>
      {fallback ?? (
        <Link
          href="/learn/wallet-101"
          className="text-amber-700 dark:text-amber-300 underline hover:no-underline text-xs"
        >
          เริ่ม Wallet 101 ระหว่างรอ →
        </Link>
      )}
    </div>
  );
}
