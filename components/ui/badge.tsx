import { cn } from "@/lib/utils";

/**
 * Badge — tiny pill label. Tone defaults to brand.
 */
export function Badge({
  className,
  tone = "brand",
  children,
}: {
  className?: string;
  tone?: "brand" | "muted" | "success" | "warning";
  children: React.ReactNode;
}) {
  const tones = {
    brand: "bg-[var(--color-brand-light)] text-[var(--color-brand)]",
    muted: "bg-[var(--color-border)] text-[var(--color-muted)]",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
