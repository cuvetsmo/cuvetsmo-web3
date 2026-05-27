/**
 * Hero illustration · Mozi-style floating composition.
 *
 * Renders next to the headline (lg+ screens) — never on mobile portrait
 * (mobile hero stays clean per UX-audit memory rule).
 *
 * Layers (back → front):
 *   1. Big soft cloud SVG (cream-cotton volume behind everything)
 *   2. Stylized Vet SBT Card preview (the killer-feature artifact)
 *   3. 4 floating "brand chips" with SVG marks at staggered orbits
 *   4. Sparkle dots for ambient activity
 *
 * Each layer has its own slow drift animation. The composition reads as
 * "soft web3 in motion" without being chaotic.
 */
import { BrandMark } from "./brand-mark";

export function HeroIllustration() {
  return (
    <div
      aria-hidden
      className="relative w-full aspect-square max-w-md mx-auto select-none pointer-events-none"
    >
      {/* Cloud SVG · big soft volume behind everything */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full animate-float-slower"
      >
        <defs>
          <radialGradient id="cloud-soft" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#fff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cloud-pink" cx="35%" cy="40%" r="50%">
            <stop offset="0%"  stopColor="#fde0e8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fde0e8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cloud-sky" cx="65%" cy="60%" r="50%">
            <stop offset="0%"  stopColor="#d8e9ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d8e9ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Stacked cloud bubbles for soft volumetric feel */}
        <circle cx="160" cy="180" r="120" fill="url(#cloud-pink)" />
        <circle cx="240" cy="220" r="140" fill="url(#cloud-sky)" />
        <circle cx="200" cy="200" r="160" fill="url(#cloud-soft)" />
      </svg>

      {/* Sparkle dots · ambient activity (CSS keyframes inline for predictability) */}
      <div className="absolute inset-0">
        <span className="absolute top-[12%] left-[20%] h-1.5 w-1.5 rounded-full bg-[var(--color-brand)] opacity-70 animate-pulse" />
        <span className="absolute top-[28%] right-[18%] h-2 w-2 rounded-full bg-pink-400 opacity-60 animate-pulse" style={{ animationDelay: "0.6s" }} />
        <span className="absolute bottom-[22%] left-[30%] h-1 w-1 rounded-full bg-sky-400 opacity-80 animate-pulse" style={{ animationDelay: "1.2s" }} />
        <span className="absolute top-[45%] right-[10%] h-1.5 w-1.5 rounded-full bg-amber-400 opacity-70 animate-pulse" style={{ animationDelay: "1.8s" }} />
        <span className="absolute bottom-[35%] right-[35%] h-1 w-1 rounded-full bg-emerald-400 opacity-80 animate-pulse" style={{ animationDelay: "2.4s" }} />
      </div>

      {/* Floating brand chips · orbit positions · staggered drift */}
      <div className="absolute top-[6%] left-[2%] animate-float-slow">
        <FloatingChip label="Base" tone="base" />
      </div>
      <div
        className="absolute top-[12%] right-[4%] animate-float-slower"
        style={{ animationDelay: "-1.5s" }}
      >
        <FloatingChip label="EAS" tone="eas" />
      </div>
      <div
        className="absolute bottom-[18%] left-[1%] animate-float-slow"
        style={{ animationDelay: "-3s" }}
      >
        <FloatingChip label="Privy" tone="privy" />
      </div>
      <div
        className="absolute bottom-[8%] right-[2%] animate-float-slower"
        style={{ animationDelay: "-2s" }}
      >
        <FloatingChip label="Pimlico" tone="pimlico" />
      </div>

      {/* Vet SBT Card preview · centered, slightly rotated, hovering */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="animate-float-slow"
          style={{
            transform: "rotate(-4deg)",
            filter:
              "drop-shadow(0 25px 35px rgba(3, 105, 161, 0.18)) drop-shadow(0 0 0 1px rgba(0,0,0,0.04))",
          }}
        >
          <VetCardPreview />
        </div>
      </div>
    </div>
  );
}

/* ─── Stylized Vet SBT Card preview · same DNA as the on-chain SVG ──── */

function VetCardPreview() {
  return (
    <svg
      viewBox="0 0 320 200"
      width="280"
      height="175"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      <defs>
        <linearGradient id="vet-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id="vet-stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#e0f2fe" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Card surface */}
      <rect width="320" height="200" rx="16" fill="url(#vet-bg)" />
      <rect y="120" width="320" height="80" rx="16" fill="url(#vet-stripe)" />

      {/* Top row · brand + token id */}
      <text x="20" y="30" fill="#e0f2fe" fontSize="9" letterSpacing="2">
        CUVETSMO · WEB3
      </text>
      <text x="20" y="46" fill="#fff" fontSize="14" fontWeight="600">
        VET SBT CARD
      </text>
      <text
        x="300"
        y="30"
        fill="#e0f2fe"
        fontSize="8"
        letterSpacing="1.5"
        textAnchor="end"
      >
        TOKEN
      </text>
      <text
        x="300"
        y="46"
        fill="#fff"
        fontSize="14"
        fontFamily="ui-monospace, monospace"
        textAnchor="end"
      >
        #0086
      </text>

      {/* Student name placeholder */}
      <text x="20" y="100" fill="#e0f2fe" fontSize="9" letterSpacing="1.5">
        STUDENT
      </text>
      <text x="20" y="124" fill="#fff" fontSize="22" fontWeight="600">
        ปาล์ม ดาน้อย
      </text>

      {/* Stats row */}
      <text x="20" y="156" fill="#e0f2fe" fontSize="9" letterSpacing="1.5">
        VET 86 · FACULTY OF VETERINARY SCIENCE
      </text>
      <text x="20" y="170" fill="#bae6fd" fontSize="9">
        ADMITTED 2566 · CHULALONGKORN UNIVERSITY
      </text>

      {/* Wallet */}
      <text
        x="20"
        y="186"
        fill="#ffffff"
        fontSize="9"
        fontFamily="ui-monospace, monospace"
      >
        0x9616…c456
      </text>
      <text
        x="300"
        y="186"
        fill="#bae6fd"
        fontSize="8"
        letterSpacing="1"
        textAnchor="end"
      >
        BASE · SOULBOUND
      </text>
    </svg>
  );
}

/* ─── Floating chip · brand mark + label ─────────────────────────────── */

function FloatingChip({
  label,
  tone,
}: {
  label: string;
  tone: "base" | "privy" | "pimlico" | "eas";
}) {
  const TONE: Record<typeof tone, string> = {
    base:    "bg-white text-[#0052ff] ring-[#0052ff]/20",
    privy:   "bg-white text-[#5b48ee] ring-[#5b48ee]/20",
    pimlico: "bg-white text-[#ff6b35] ring-[#ff6b35]/20",
    eas:     "bg-white text-[#0ea5e9] ring-[#0ea5e9]/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ring-1 ${TONE[tone]}`}
    >
      <BrandMark tone={tone} size={14} />
      {label}
    </span>
  );
}
