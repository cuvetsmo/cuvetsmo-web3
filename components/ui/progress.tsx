import { cn } from "@/lib/utils";

/**
 * Progress — pure CSS progress bar. value in 0..100.
 * Accessible: role="progressbar" + aria-valuenow.
 */
export function Progress({
  value,
  className,
  label,
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label ?? "Progress"}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-[var(--color-brand-light)]",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[var(--color-brand)] transition-[width] duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
