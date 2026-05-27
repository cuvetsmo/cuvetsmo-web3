/**
 * Dynamic OG image · regenerated on every deploy.
 *
 * Matches the Mozi-style landing DNA (cloud pastel bg, Vet SBT Card,
 * 4 partner chips). Replaces the old static /public/og.png which was
 * generated from a pre-pivot landing layout.
 *
 * Next.js convention · place opengraph-image.tsx at app/ root so it
 * applies to any route that doesn't override metadata.openGraph.images.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CUVETSMO Web3 — Web3 Playground สำหรับนิสิตสัตวแพทย์ จุฬาฯ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fffbf4",
          backgroundImage: [
            "radial-gradient(40% 50% at 18% 22%, #fde0e8 0%, transparent 70%)",
            "radial-gradient(35% 45% at 78% 18%, #e0dcff 0%, transparent 70%)",
            "radial-gradient(55% 65% at 50% 80%, #d8e9ff 0%, transparent 75%)",
            "radial-gradient(30% 40% at 92% 55%, #fee8d7 0%, transparent 70%)",
          ].join(", "),
          padding: 64,
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top brand line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#0000ff",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#0000ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 26,
              fontWeight: 900,
            }}
          >
            ∞
          </div>
          <span>CUVETSMO Web3</span>
          <span style={{ color: "#71717a", fontWeight: 500 }}>
            · Educational testnet
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: 16,
            marginTop: 24,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: "#0a0a0f",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Learn Web3.</span>
            <span style={{ color: "#0000ff" }}>Build Your Identity.</span>
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#3f3f46",
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: 880,
              display: "flex",
            }}
          >
            Web3 playground สำหรับนิสิตสัตวแพทย์ CU · 4 pillars · gasless mint ·
            soulbound credentials
          </div>
        </div>

        {/* Bottom · partner chips row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Base", color: "#0052ff" },
            { label: "Privy", color: "#5b48ee" },
            { label: "Pimlico", color: "#ff6b35" },
            { label: "EAS", color: "#0ea5e9" },
            { label: "Pinata", color: "#6a48ff" },
            { label: "OpenZeppelin", color: "#4f56fa" },
            { label: "CUVET", color: "#0369a1" },
            { label: "Chula", color: "#c8316d" },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 999,
                background: "white",
                border: "1px solid rgba(15, 23, 42, 0.06)",
                color: c.color,
                fontSize: 22,
                fontWeight: 700,
                boxShadow: `0 4px 12px -4px ${c.color}22`,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: c.color,
                  display: "block",
                }}
              />
              {c.label}
            </div>
          ))}
        </div>

        {/* Bottom-right URL chip */}
        <div
          style={{
            position: "absolute",
            top: 64,
            right: 64,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(0, 0, 255, 0.18)",
            color: "#0000ff",
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          web3.cuvetsmo.com
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
