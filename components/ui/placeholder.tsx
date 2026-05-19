import Link from "next/link";

/**
 * <Placeholder /> — shared "agent X will rewrite this" surface.
 *
 * Wave 2 agents (B/C/D/E) replace the body of their owned pages but
 * may keep this shell if they want a quick stub during scaffolding.
 *
 * Usage:
 *   <Placeholder
 *     agent="Agent B"
 *     pillar="Learn"
 *     title="Wallet 101"
 *     description="Hands-on wallet onboarding..."
 *     spec="§5.1 of master plan"
 *   />
 */
export interface PlaceholderProps {
  agent: string;
  pillar: "Marketing" | "Learn" | "Play" | "Build" | "The Lab" | "API";
  title: string;
  description: string;
  spec?: string;
  children?: React.ReactNode;
}

export function Placeholder({
  agent,
  pillar,
  title,
  description,
  spec,
  children,
}: PlaceholderProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        <span className="px-2 py-0.5 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)]">
          {pillar}
        </span>
        <span>· owned by {agent}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        {title}
      </h1>
      <p className="text-[var(--color-muted)] text-base leading-relaxed mb-6">
        {description}
      </p>

      {spec && (
        <div className="mb-8 p-4 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-card)]">
          <p className="text-xs font-mono text-[var(--color-muted)]">
            Spec reference: <span className="text-[var(--color-text)]">{spec}</span>
          </p>
        </div>
      )}

      <div className="card">
        <p className="text-sm text-[var(--color-muted)]">
          🚧 This page is a Wave 1 placeholder. {agent} will replace it in Wave 2.
        </p>
        {children && <div className="mt-4">{children}</div>}
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-[var(--color-brand)] hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
