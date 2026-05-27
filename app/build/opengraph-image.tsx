import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Build — CUVETSMO Web3";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
            "radial-gradient(50% 60% at 22% 25%, #e0f2fe 0%, transparent 70%)",
            "radial-gradient(45% 55% at 78% 30%, #ddd6fe 0%, transparent 70%)",
            "radial-gradient(55% 65% at 50% 80%, #fce7f3 0%, transparent 75%)",
          ].join(", "),
          padding: 64,
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <span style={{ fontSize: 64, lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }}>🛠️</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#0000ff", letterSpacing: "0.18em" }}>
              เสาที่ 3 · BUILD
            </span>
            <span style={{ fontSize: 26, color: "#71717a", fontWeight: 500 }}>CUVETSMO Web3</span>
          </div>
        </div>

        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: "#0a0a0f",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <span>Identity จริง</span>
          <span style={{ color: "#0000ff" }}>สำหรับนิสิต CU Vet</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {[
            { emoji: "🪪", label: "Vet SBT Card · soulbound", color: "#0284c7" },
            { emoji: "👤", label: "Profile · Badges · XP", color: "#7c3aed" },
            { emoji: "🎁", label: "Gasless mint via Pimlico", color: "#059669" },
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
                boxShadow: `0 4px 12px -4px ${c.color}33`,
              }}
            >
              <span>{c.emoji}</span>
              {c.label}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            top: 64,
            right: 64,
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(0, 0, 255, 0.18)",
            color: "#0000ff",
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            display: "flex",
          }}
        >
          web3.cuvetsmo.com/build
        </div>
      </div>
    ),
    { ...size },
  );
}
