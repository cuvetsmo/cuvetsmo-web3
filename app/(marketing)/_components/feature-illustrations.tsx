/**
 * Feature illustrations · inline SVG · Mozi-style pastel.
 *
 * One small ~72×72 mark per feature card. Built as inline SVG so they:
 *   - Inherit current text color via stroke="currentColor" where useful
 *   - Don't need additional network requests
 *   - Can pick up Tailwind classes for responsive sizing
 *
 * Naming matches the FEATURES array keys in page.tsx (1:1 by index, but the
 * exported key makes the linkage explicit and grep-able).
 */

export type FeatureKey =
  | "gasless"
  | "identity"
  | "badges"
  | "studio"
  | "soulbound"
  | "opensource";

const COMMON_PROPS = {
  width: 56,
  height: 56,
  viewBox: "0 0 64 64",
  xmlns: "http://www.w3.org/2000/svg",
  className: "block",
  "aria-hidden": true,
} as const;

/** 🎁 Gasless Mint · sky/blue gradient · gift box + sparkles + $0 tag. */
function GaslessIllo() {
  return (
    <svg {...COMMON_PROPS}>
      <defs>
        <linearGradient id="g-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      {/* Box body */}
      <rect x="14" y="22" width="36" height="28" rx="3" fill="url(#g-sky)" />
      {/* Lid */}
      <rect x="12" y="18" width="40" height="8" rx="2" fill="#0369a1" />
      {/* Ribbon vertical */}
      <rect x="30" y="18" width="4" height="32" fill="#bae6fd" />
      {/* Ribbon horizontal */}
      <rect x="14" y="30" width="36" height="3" fill="#bae6fd" />
      {/* Bow */}
      <path d="M28 14 Q32 8 36 14 Q32 18 28 14 Z" fill="#bae6fd" />
      <circle cx="32" cy="14" r="2" fill="#0369a1" />
      {/* $0 tag */}
      <g transform="translate(43, 8) rotate(15)">
        <rect x="0" y="0" width="16" height="10" rx="2" fill="#fff" stroke="#0369a1" strokeWidth="1.2" />
        <text x="8" y="7.5" fontSize="7" fontWeight="700" textAnchor="middle" fill="#0369a1" fontFamily="ui-sans-serif, system-ui">$0</text>
      </g>
      {/* Sparkles */}
      <g fill="#fde047">
        <circle cx="8"  cy="20" r="1.5" />
        <circle cx="56" cy="48" r="1.5" />
        <circle cx="50" cy="14" r="1" />
      </g>
    </svg>
  );
}

/** 🪪 Chula-Verified Identity · amber gradient · ID card + verify shield. */
function IdentityIllo() {
  return (
    <svg {...COMMON_PROPS}>
      <defs>
        <linearGradient id="g-amber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* Card */}
      <rect x="6" y="14" width="44" height="32" rx="3" fill="url(#g-amber)" />
      {/* Photo placeholder */}
      <circle cx="17" cy="26" r="5" fill="#fff" />
      <path d="M11 36 Q17 32 23 36 V42 H11 Z" fill="#fff" />
      {/* ID lines */}
      <rect x="26" y="22" width="20" height="2" rx="1" fill="#fff" opacity="0.85" />
      <rect x="26" y="28" width="16" height="2" rx="1" fill="#fff" opacity="0.7" />
      <rect x="26" y="34" width="18" height="2" rx="1" fill="#fff" opacity="0.7" />
      {/* Pink Chula ribbon mark · top-left corner */}
      <rect x="6" y="14" width="44" height="4" rx="2" fill="#c8316d" />
      {/* Verify shield · bottom-right overlap */}
      <g transform="translate(40, 32)">
        <path d="M0 4 L10 0 L20 4 V14 C20 19 13 22 10 23 C7 22 0 19 0 14 Z" fill="#0ea5e9" />
        <path d="M5 13 L9 17 L16 8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** ⛓️ EAS Quest Badges · emerald gradient · medal + chain link. */
function BadgesIllo() {
  return (
    <svg {...COMMON_PROPS}>
      <defs>
        <linearGradient id="g-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#86efac" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Ribbons */}
      <path d="M18 6 L26 30 L20 32 L14 14 Z" fill="#10b981" />
      <path d="M46 6 L38 30 L44 32 L50 14 Z" fill="#10b981" />
      {/* Medal disk */}
      <circle cx="32" cy="38" r="14" fill="url(#g-emerald)" />
      <circle cx="32" cy="38" r="10" fill="#064e3b" opacity="0.2" />
      {/* Check */}
      <path d="M26 38 L30 42 L38 33" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Tiny chain link · top */}
      <g transform="translate(45, 4)" stroke="#10b981" strokeWidth="2" fill="none">
        <ellipse cx="4" cy="4" rx="3" ry="2" />
        <ellipse cx="10" cy="6" rx="3" ry="2" />
      </g>
    </svg>
  );
}

/** 🧪 No-Code Token Studio · purple gradient · flask + bubbles + sparkles. */
function StudioIllo() {
  return (
    <svg {...COMMON_PROPS}>
      <defs>
        <linearGradient id="g-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* Flask neck */}
      <rect x="27" y="8" width="10" height="14" rx="1" fill="none" stroke="#5b21b6" strokeWidth="2" />
      {/* Flask body */}
      <path d="M24 22 L22 50 Q22 56 28 56 L36 56 Q42 56 42 50 L40 22 Z" fill="url(#g-purple)" stroke="#5b21b6" strokeWidth="2" />
      {/* Liquid */}
      <path d="M24 36 L23 50 Q23 55 28 55 L36 55 Q41 55 41 50 L40 36 Z" fill="#5b21b6" opacity="0.55" />
      {/* Bubbles */}
      <circle cx="28" cy="42" r="2" fill="#fff" opacity="0.7" />
      <circle cx="34" cy="48" r="1.5" fill="#fff" opacity="0.7" />
      <circle cx="30" cy="50" r="1" fill="#fff" opacity="0.8" />
      {/* Sparkles */}
      <g fill="#fbbf24">
        <path d="M50 18 L52 22 L56 24 L52 26 L50 30 L48 26 L44 24 L48 22 Z" />
        <circle cx="10" cy="14" r="1.5" />
      </g>
      {/* Tag */}
      <rect x="44" y="34" width="16" height="8" rx="2" fill="#7c3aed" />
      <text x="52" y="40" fontSize="5" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="ui-sans-serif, system-ui">30s</text>
    </svg>
  );
}

/** 🔒 Soulbound · rose gradient · lock + intertwined chain. */
function SoulboundIllo() {
  return (
    <svg {...COMMON_PROPS}>
      <defs>
        <linearGradient id="g-rose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#fda4af" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
      </defs>
      {/* Chain link · left */}
      <g transform="translate(4, 20)" stroke="#be123c" strokeWidth="3" fill="none" strokeLinecap="round">
        <ellipse cx="8" cy="12" rx="6" ry="9" />
      </g>
      {/* Chain link · right */}
      <g transform="translate(46, 20)" stroke="#be123c" strokeWidth="3" fill="none" strokeLinecap="round">
        <ellipse cx="8" cy="12" rx="6" ry="9" />
      </g>
      {/* Lock body */}
      <rect x="20" y="28" width="24" height="22" rx="3" fill="url(#g-rose)" />
      {/* Lock shackle */}
      <path d="M24 28 V22 Q24 14 32 14 Q40 14 40 22 V28" stroke="#be123c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Keyhole */}
      <circle cx="32" cy="37" r="2.5" fill="#7f1d1d" />
      <rect x="31" y="38" width="2" height="6" fill="#7f1d1d" />
      {/* Soulbound mark · star burst */}
      <g fill="#fbbf24">
        <circle cx="55" cy="10" r="1.5" />
        <circle cx="10" cy="52" r="1" />
      </g>
    </svg>
  );
}

/** 📖 Open Source + Auditable · slate gradient · code brackets + magnifier. */
function OpenSourceIllo() {
  return (
    <svg {...COMMON_PROPS}>
      <defs>
        <linearGradient id="g-slate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* Code window */}
      <rect x="6" y="10" width="44" height="34" rx="3" fill="url(#g-slate)" />
      <rect x="6" y="10" width="44" height="6" rx="3" fill="#334155" />
      {/* Window dots */}
      <circle cx="11" cy="13" r="1.2" fill="#f87171" />
      <circle cx="15" cy="13" r="1.2" fill="#fbbf24" />
      <circle cx="19" cy="13" r="1.2" fill="#34d399" />
      {/* Code lines */}
      <g stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M16 22 L13 26 L16 30" />
        <path d="M40 22 L43 26 L40 30" />
        <path d="M22 32 L34 22" />
      </g>
      <rect x="13" y="35" width="22" height="2" rx="1" fill="#fff" opacity="0.6" />
      <rect x="13" y="39" width="14" height="2" rx="1" fill="#fff" opacity="0.4" />
      {/* Magnifier */}
      <g transform="translate(38, 36)">
        <circle cx="9" cy="9" r="7" fill="#fff" stroke="#0284c7" strokeWidth="2" />
        <path d="M14 14 L20 20" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
        <path d="M5 9 L8 12 L13 6" stroke="#0284c7" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

const REGISTRY: Record<FeatureKey, () => React.ReactElement> = {
  gasless:    GaslessIllo,
  identity:   IdentityIllo,
  badges:     BadgesIllo,
  studio:     StudioIllo,
  soulbound:  SoulboundIllo,
  opensource: OpenSourceIllo,
};

export function FeatureIllustration({ name }: { name: FeatureKey }) {
  const Illo = REGISTRY[name];
  return <Illo />;
}
