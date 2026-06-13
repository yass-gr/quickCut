import { AbsoluteFill, useCurrentFrame, interpolate, Easing, useVideoConfig } from "remotion"
import type { Match, Tip } from "@/types"

interface AppDemoProps {
  match: Match | null
  prediction: Tip | null
}

function ConfidenceRing({ pct }: { pct: number }) {
  const size = 52
  const stroke = 4
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 80 ? "#5CFF6A" : pct >= 60 ? "#00ff41" : "#a3a3a3"

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1b4d1b" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AppDemo({ match, prediction }: AppDemoProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const slideIn = interpolate(frame, [0, Math.round(fps * 0.4)], [60, 0], {
    extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
  const opacity = interpolate(frame, [0, Math.round(fps * 0.15), Math.round(fps * 2.5), Math.round(fps * 3)], [0, 1, 1, 0], { extrapolateRight: "clamp" })
  const phoneOpacity = interpolate(frame, [Math.round(fps * 0.2), Math.round(fps * 0.5)], [0, 1], { extrapolateRight: "clamp" })

  const home = match?.match_home || "HOME"
  const away = match?.match_away || "AWAY"
  const league = match?.league || "LEAGUE"
  const confidence = prediction?._confidence ?? 85
  const pctColor = confidence >= 80 ? "#5CFF6A" : confidence >= 60 ? "#00ff41" : "#a3a3a3"

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "absolute", inset: 0, background: "#000" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 55%, rgba(0,255,65,0.04), transparent 60%)" }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          transform: `translateY(${slideIn}px)`,
        }}
      >
        {/* Phone mockup */}
        <div
          style={{
            opacity: phoneOpacity,
            width: "55%",
            aspectRatio: "9/19",
            background: "#030803",
            borderRadius: 18,
            border: "2px solid #1b4d1b",
            padding: 4,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Notch */}
          <div style={{
            width: "30%", height: 5, background: "#000",
            borderRadius: "0 0 4px 4px", margin: "0 auto",
          }} />

          {/* Screen content */}
          <div style={{
            flex: 1, marginTop: 6, display: "flex", flexDirection: "column",
            gap: 6, padding: "0 4px",
          }}>
            {/* App header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: "4px 0",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4,
                background: "linear-gradient(135deg, #00ff41, #00cc33)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 700, color: "#000" }}>AI</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#d0ffd0", fontWeight: 600 }}>
                MSSOUGRA
              </span>
            </div>

            {/* Match card in phone */}
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 6,
              background: "rgba(0,0,0,0.3)", borderRadius: 8,
              border: "1px solid rgba(0,255,65,0.15)",
              padding: "8px 6px",
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: "#558855", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {league}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#fff", fontWeight: 600 }}>{home}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#558855" }}>VS</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#fff", fontWeight: 600 }}>{away}</span>
              </div>

              {/* Confidence ring */}
              <div style={{ position: "relative", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ConfidenceRing pct={confidence} />
                <span style={{ position: "absolute", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: pctColor }}>
                  {confidence}
                </span>
              </div>

              {/* Best bet row */}
              {prediction && (
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  width: "100%", padding: "4px 6px",
                  background: "rgba(0,255,65,0.05)", borderRadius: 4,
                  border: "1px solid rgba(0,255,65,0.1)",
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: "#a3a3a3" }}>
                    {prediction._best_market_type}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#d0ffd0", fontWeight: 600 }}>
                      {prediction._best_market_pick}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: pctColor, fontWeight: 700 }}>
                      {confidence}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Home indicator */}
            <div style={{ width: "25%", height: 2, background: "#1b4d1b", borderRadius: 2, margin: "2px auto 0" }} />
          </div>
        </div>

        {/* Labels */}
        <div style={{
          fontFamily: "Flick, sans-serif",
          fontSize: 36,
          color: "#00ff41",
          textShadow: "0 2px 10px rgba(0,0,0,0.8)",
        }}>
          SEE IT IN ACTION
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 18,
          color: "#a3a3a3",
        }}>
          MSSOUGRA app demo
        </div>
      </div>

      {/* Watermark */}
      <div style={{
        position: "absolute", bottom: 20, left: 0, right: 0,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, color: "rgba(0,255,65,0.2)",
        textAlign: "center",
      }}>
        MSSOUGRA AI
      </div>
    </AbsoluteFill>
  )
}
