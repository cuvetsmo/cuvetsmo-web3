import { CONTRACTS } from "@/lib/contracts";

/**
 * Shown when contract addresses are not yet wired (Agent A still working
 * or deploy script hasn't run). Tools render in "preview" mode that lets
 * users fill the form but the deploy CTA is disabled.
 */
const ZERO = "0x0000000000000000000000000000000000000000";

export function ContractStatusBanner() {
  const factories = {
    "Token Forge": CONTRACTS.TOKEN_FACTORY,
    "NFT Studio": CONTRACTS.NFT_FACTORY,
    "SBT Maker": CONTRACTS.SBT_FACTORY,
    "DAO (Governor)": CONTRACTS.GOVERNOR_FACTORY,
  };

  const notReady = Object.entries(factories).filter(([, addr]) => addr === ZERO);

  if (notReady.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-brand-light)]/60 dark:bg-[var(--color-brand-light)]/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-start gap-2 text-xs leading-relaxed">
        <span className="shrink-0 mt-0.5">⏳</span>
        <p className="text-[var(--color-brand)] dark:text-sky-200">
          <span className="font-semibold">Deploy targets not wired yet:</span>{" "}
          {notReady.map(([name], i) => (
            <span key={name}>
              {i > 0 && ", "}
              {name}
            </span>
          ))}
          . You can still fill the form — the deploy button will activate
          when Agent A finishes wiring factory addresses to env.
        </p>
      </div>
    </div>
  );
}
