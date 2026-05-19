"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

/**
 * Children only render when wallet is connected. Otherwise shows a
 * gentle prompt + connect CTA. Use to gate deploy forms so the user
 * sees what they'd get but can't trigger a tx without a wallet.
 */
export function ConnectGate({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login } = usePrivy();
  const { address } = useAccount();

  if (!ready) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 animate-pulse text-sm text-[var(--color-muted)]">
        กำลังโหลด wallet...
      </div>
    );
  }

  if (!authenticated || !address) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center">
        <p className="text-sm text-[var(--color-text)] mb-1 font-medium">
          เชื่อม wallet ก่อนเพื่อ deploy
        </p>
        <p className="text-xs text-[var(--color-muted)] mb-4 leading-relaxed">
          ใช้ embedded wallet ของ Privy (ไม่ต้องมี Metamask) · login ด้วย
          email/Google ก็ได้.
        </p>
        <button
          type="button"
          onClick={login}
          className="btn-brand text-sm"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
