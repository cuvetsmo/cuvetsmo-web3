/**
 * Brand tone type · the single source of truth for which partner brands the
 * marketing surface knows about.
 *
 * History: this file used to export a `<BrandMark>` component that rendered
 * geometric SVG approximations of each partner's logo (rounded square for
 * Base, hexagon for Pimlico, etc.). Palm correctly flagged those as
 * hallucinated marks (2026-05-27) — pairing an invented shape with a real
 * brand name implies it's the official logo. They were stripped and replaced
 * with REAL official logos sourced from each project's brand kit, served from
 * `public/partners/*` and routed through `partnerLogoSrc(tone)` in page.tsx.
 *
 * Only the `BrandTone` union survives — it's the type contract every
 * partner-aware helper (chipColor, partnerLogoSrc, PartnerMark) shares.
 */

export type BrandTone =
  | "base"
  | "privy"
  | "pimlico"
  | "eas"
  | "pinata"
  | "openzep"
  | "cuvet"
  | "chula";
