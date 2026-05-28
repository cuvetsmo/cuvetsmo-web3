/**
 * Lightweight confetti · zero dependencies, no canvas.
 *
 * Spawns ~50 small colored DOM squares at a burst origin, each with a random
 * velocity + rotation, animated via the Web Animations API, then removed.
 * Total cost is a few KB and one short-lived DOM subtree — far cheaper than
 * pulling canvas-confetti (~11 KB) for a once-per-quest delight moment.
 *
 * Respects prefers-reduced-motion · becomes a no-op so we never trigger
 * vestibular discomfort on a celebration the user didn't ask to move.
 *
 * Usage:
 *   import { fireConfetti } from "@/lib/confetti";
 *   fireConfetti();                       // burst from screen center-top
 *   fireConfetti({ originY: 0.3 });       // higher origin
 */

const BRAND_COLORS = [
  "#0000ff", // Base Blue
  "#7c3aed", // violet
  "#ec4899", // pink
  "#10b981", // emerald
  "#f59e0b", // amber
  "#0ea5e9", // sky
];

export function fireConfetti(opts?: {
  /** Number of pieces · default 50 */
  count?: number;
  /** Horizontal origin 0-1 (fraction of viewport width) · default 0.5 */
  originX?: number;
  /** Vertical origin 0-1 (fraction of viewport height) · default 0.35 */
  originY?: number;
}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Respect reduce-motion · celebration is decorative
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const count = opts?.count ?? 50;
  const ox = (opts?.originX ?? 0.5) * window.innerWidth;
  const oy = (opts?.originY ?? 0.35) * window.innerHeight;

  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  Object.assign(container.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "9999",
    overflow: "hidden",
  } as CSSStyleDeclaration);
  document.body.appendChild(container);

  let maxDuration = 0;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    const size = 6 + Math.random() * 6;
    const color = BRAND_COLORS[(Math.random() * BRAND_COLORS.length) | 0];
    const rounded = Math.random() > 0.5;

    Object.assign(piece.style, {
      position: "absolute",
      left: `${ox}px`,
      top: `${oy}px`,
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      borderRadius: rounded ? "50%" : "1px",
      willChange: "transform, opacity",
    } as CSSStyleDeclaration);

    // Random launch vector · upward-biased fan, then gravity drop
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 0.9;
    const velocity = 220 + Math.random() * 320;
    const dx = Math.cos(angle) * velocity;
    const dyUp = Math.sin(angle) * velocity; // negative = up
    const dropY = 420 + Math.random() * 320;
    const spin = (Math.random() - 0.5) * 1080;
    const duration = 1100 + Math.random() * 900;
    maxDuration = Math.max(maxDuration, duration);

    container.appendChild(piece);

    piece.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx * 0.4}px, ${dyUp * 0.6}px) rotate(${spin * 0.4}deg)`,
          opacity: 1,
          offset: 0.35,
        },
        {
          transform: `translate(${dx}px, ${dyUp + dropY}px) rotate(${spin}deg)`,
          opacity: 0,
        },
      ],
      {
        duration,
        easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        fill: "forwards",
      }
    );
  }

  window.setTimeout(() => {
    container.remove();
  }, maxDuration + 100);
}
