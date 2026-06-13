import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from "remotion"
import { PhoneMockup } from "./PhoneMockup"

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8 }}>
      <div style={{ height: 12, background: "rgba(0,255,65,0.08)", borderRadius: 2, width: "60%" }} />
      <div style={{ height: 6, background: "rgba(0,255,65,0.05)", borderRadius: 2, width: "40%" }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 20, height: 20, background: "linear-gradient(135deg, #00ff41, #00cc33)", borderRadius: 4 }} />
      </div>
      <div style={{ height: 14, background: "rgba(0,255,65,0.1)", borderRadius: 2 }} />
      <div style={{ height: 14, background: "rgba(0,255,65,0.08)", borderRadius: 2 }} />
      <div style={{ height: 14, background: "rgba(0,255,65,0.06)", borderRadius: 2 }} />
    </div>
  )
}

function AppScreenContent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 8, fontFamily: "JetBrains Mono, monospace" }}>
      <div style={{ fontSize: 6, color: "#d0ffd0", fontWeight: 700 }}>RACING vs BARCA</div>
      <div style={{ fontSize: 4, color: "#a3a3a3" }}>La Liga • Today 21:00</div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "8px 0" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid #00ff41",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            color: "#00ff41",
            fontWeight: 700,
          }}
        >
          82%
        </div>
      </div>

      <div style={{ background: "#101010", borderRadius: 4, border: "1px solid #1b4d1b", padding: 6 }}>
        <div style={{ fontSize: 4, color: "#00ff41", textTransform: "uppercase" }}>Match Prediction</div>
        <div style={{ fontSize: 5, color: "#ffffff", marginTop: 2 }}>OVER 2.5 Goals</div>
        <div style={{ height: 4, background: "#1b4d1b", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
          <div style={{ width: "82%", height: "100%", background: "#00ff41", borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <span style={{ fontSize: 3.5, color: "#a3a3a3" }}>xG: 2.1 - 1.3</span>
          <span style={{ fontSize: 3.5, color: "#00ff41" }}>82%</span>
        </div>
      </div>

      <div style={{ fontSize: 4, color: "#a3a3a3", marginTop: 4 }}>Confidence Breakdown</div>
      {["HOME 45%", "DRAW 25%", "AWAY 30%", "BTTS 68%", "OV2.5 82%"].map((label, i) => {
        const parts = label.split(" ")
        const pct = parseInt(parts[1])
        const color = pct >= 60 ? "#00ff41" : "#a3a3a3"
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 3, color: "#a3a3a3", width: 24 }}>{parts[0]}</span>
            <div style={{ flex: 1, height: 3, background: "#1b4d1b", borderRadius: 1.5, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 1.5 }} />
            </div>
            <span style={{ fontSize: 3, color, width: 12, textAlign: "right" }}>{parts[1]}</span>
          </div>
        )
      })}
    </div>
  )
}

export function AppDemo() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const loadingDuration = 0.5 * fps
  const contentFadeStart = loadingDuration + 0.3 * fps
  const contentFadeEnd = contentFadeStart + 0.5 * fps

  const loadingOpacity = interpolate(frame, [0, loadingDuration - 10, loadingDuration], [1, 1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  })

  const contentOpacity = interpolate(frame, [contentFadeStart, contentFadeEnd], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  })

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
      <PhoneMockup>
        <div style={{ position: "absolute", inset: 4, opacity: loadingOpacity }}>
          <LoadingSkeleton />
        </div>
        <div style={{ opacity: contentOpacity, flex: 1 }}>
          <AppScreenContent />
        </div>
      </PhoneMockup>
    </AbsoluteFill>
  )
}
