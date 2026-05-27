/**
 * Stylized brand marks · geometric SVG · zero IP risk.
 *
 * These are CUVETSMO Web3's *own* iconic marks designed to evoke each
 * partner protocol's brand DNA without copying. They are deliberately
 * simple shapes (square / circle / hexagon / diamond) so they read as
 * "this is the kind of logo, not the actual logo" — useful for landing
 * decoration when we don't have rights or files for the official mark.
 *
 * Pair with `.brand-chip` text labels in globals.css so the user sees
 * mark + name and recognizes the protocol.
 */
import type { CSSProperties } from "react";

export type BrandTone =
  | "base"
  | "privy"
  | "pimlico"
  | "eas"
  | "pinata"
  | "openzep"
  | "cuvet"
  | "chula";

const TONE_HEX: Record<BrandTone, string> = {
  base:    "#0052ff",
  privy:   "#5b48ee",
  pimlico: "#ff6b35",
  eas:     "#0ea5e9",
  pinata:  "#6a48ff",
  openzep: "#4f56fa",
  cuvet:   "#0369a1",
  chula:   "#c8316d",
};

export function BrandMark({
  tone,
  size = 18,
  className,
  style,
}: {
  tone: BrandTone;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const hex = TONE_HEX[tone];
  switch (tone) {
    case "base":
      // Blue rounded square w/ inset "b" arc
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
          <rect width="24" height="24" rx="6" fill={hex} />
          <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="2.4" />
        </svg>
      );
    case "privy":
      // Lavender pill w/ vertical bar
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
          <rect x="2" y="2" width="20" height="20" rx="10" fill={hex} />
          <rect x="9" y="6" width="2.5" height="12" rx="1" fill="#fff" />
          <circle cx="15" cy="8" r="2.2" fill="#fff" />
        </svg>
      );
    case "pimlico":
      // Orange hexagon w/ inner notch
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
          <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill={hex} />
          <polygon points="12,6 18,9 18,15 12,18 6,15 6,9" fill="#fff" opacity="0.85" />
          <circle cx="12" cy="12" r="2.6" fill={hex} />
        </svg>
      );
    case "eas":
      // Cyan stacked diamonds (attestation layers)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
          <polygon points="12,2 20,10 12,18 4,10" fill={hex} />
          <polygon points="12,8 18,14 12,20 6,14" fill={hex} opacity="0.55" />
          <polygon points="12,12 16,16 12,20 8,16" fill="#fff" />
        </svg>
      );
    case "pinata":
      // Purple pinwheel
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
          <circle cx="12" cy="12" r="10" fill={hex} />
          <path d="M12 4 L16 10 L12 12 Z" fill="#fff" opacity="0.85" />
          <path d="M20 12 L14 16 L12 12 Z" fill="#fff" opacity="0.6" />
          <path d="M12 20 L8 14 L12 12 Z" fill="#fff" opacity="0.85" />
          <path d="M4 12 L10 8 L12 12 Z" fill="#fff" opacity="0.6" />
          <circle cx="12" cy="12" r="2" fill="#fff" />
        </svg>
      );
    case "openzep":
      // Indigo shield
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
          <path d="M12 2 L21 5 V13 C21 18 17 21 12 22 C7 21 3 18 3 13 V5 Z" fill={hex} />
          <path d="M12 7 L17 9 V13 C17 16 15 18 12 19 C9 18 7 16 7 13 V9 Z" fill="#fff" opacity="0.95" />
          <path d="M9.5 12.5 L11.2 14 L14.5 10.8" stroke={hex} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "cuvet":
      // Ocean blue paw print
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
          <circle cx="12" cy="14" r="5" fill={hex} />
          <circle cx="6"  cy="9"  r="2.4" fill={hex} />
          <circle cx="10" cy="6"  r="2.2" fill={hex} />
          <circle cx="14" cy="6"  r="2.2" fill={hex} />
          <circle cx="18" cy="9"  r="2.4" fill={hex} />
        </svg>
      );
    case "chula":
      // Chula pink ribbon · stylized
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
          <path d="M6 4 L12 11 L18 4 V14 L12 22 L6 14 Z" fill={hex} />
          <path d="M6 4 L12 11 L18 4" stroke="#fff" strokeWidth="1.5" fill="none" />
        </svg>
      );
  }
}
