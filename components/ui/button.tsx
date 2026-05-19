"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Button — three variants mapped to brand tokens.
 *   - brand (default): solid sky-700, white text
 *   - outline: brand border, brand text, fills on hover
 *   - ghost: no border, brand text, brand-light bg on hover
 *
 * Three sizes: sm / md / lg. Disabled state dims + cursor-not-allowed.
 */
type Variant = "brand" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  brand:
    "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] disabled:bg-stone-300 disabled:text-stone-500",
  outline:
    "border border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white disabled:opacity-60",
  ghost:
    "text-[var(--color-brand)] hover:bg-[var(--color-brand-light)] disabled:opacity-60",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "brand", size = "md", className, type, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      />
    );
  },
);
