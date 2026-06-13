import { AbsoluteFill, useCurrentFrame, interpolate, Easing, useVideoConfig } from "remotion"

interface CtaSceneProps {
  hookText: [string, string]
}

export function CtaScene({ hookText }: CtaSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const opacity = interpolate(frame, [0, Math.round(fps * 0.3), Math.round(fps * 3), Math.round(fps * 4)], [0, 1, 1, 1], { extrapolateRight: "clamp" })
  const scale = interpolate(frame, [0, Math.round(fps * 0.4)], [0.9, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })
  const logoZoom = interpolate(frame, [0, Math.round(fps * 0.5), Math.round(fps * 3)], [0.6, 1, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.2, 1, 0.3, 1) })

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "absolute", inset: 0, background: "#000" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,255,65,0.06), transparent 60%)" }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          transform: `scale(${scale})`,
        }}
      >
        {/* AI Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 14,
            background: "linear-gradient(135deg, #00ff41, #00cc33)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${logoZoom})`,
            boxShadow: "0 0 40px rgba(0,255,65,0.25)",
          }}
        >
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 36,
            fontWeight: 700,
            color: "#000",
          }}>
            AI
          </span>
        </div>

        {/* MSSOUGRA */}
        <div style={{
          fontFamily: "Flick, sans-serif",
          fontWeight: 700,
          fontSize: 72,
          color: "#ffffff",
          textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          letterSpacing: "0.02em",
        }}>
          MSSOUGRA
        </div>

        {/* Green divider */}
        <div style={{
          width: 48,
          height: 4,
          background: "#00ff41",
          borderRadius: 2,
        }} />

        {/* URL pill */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 24,
          color: "#00ff41",
          border: "2px solid rgba(0,255,65,0.3)",
          borderRadius: 10,
          padding: "14px 36px",
          background: "rgba(0,0,0,0.4)",
          marginTop: 12,
        }}>
          mssougra.com
        </div>

        {/* Link in bio */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 20,
          color: "#a3a3a3",
        }}>
          or link in bio
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
