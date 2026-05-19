import { cn } from "@/lib/utils";

/**
 * Card primitives — lightweight, shadcn-shaped surface that maps to our
 * brand tokens (--color-card / --color-border) so we never fight Tailwind v4
 * theme injection. Used by Learn + Build pillars.
 */

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...rest }: DivProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-[var(--color-card)] border-[var(--color-border)] shadow-sm",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: DivProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-2", className)}
      {...rest}
    />
  );
}

export function CardTitle({
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-xl font-semibold tracking-tight text-[var(--color-text)]",
        className,
      )}
      {...rest}
    />
  );
}

export function CardDescription({
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-[var(--color-muted)]", className)}
      {...rest}
    />
  );
}

export function CardContent({ className, ...rest }: DivProps) {
  return <div className={cn("px-6 py-4", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: DivProps) {
  return (
    <div
      className={cn(
        "flex items-center px-6 pb-6 pt-2 gap-3 flex-wrap",
        className,
      )}
      {...rest}
    />
  );
}
