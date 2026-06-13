import { AbsoluteFill, Img, useCurrentFrame, interpolate } from "remotion"

interface CtaSceneProps {
  backgroundImage: string | null
}

export function CtaScene({ backgroundImage }: CtaSceneProps) {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  })

  const urlScale = interpolate(frame, [0, 30, 60, 90], [1, 1.05, 1, 1.05], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  })

  return (
    <AbsoluteFill style={{ opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {backgroundImage ? (
        <Img src={backgroundImage} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "#000" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,255,65,0.06), transparent 60%)" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: "linear-gradient(135deg, #00ff41, #00cc33)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 18, fontWeight: 700, color: "#000" }}>AI</span>
        </div>

        <div style={{ fontFamily: "Flick, sans-serif", fontSize: 60, color: "#ffffff", textShadow: "0 2px 15px rgba(0,0,0,0.8)" }}>
          MSSOUGRA
        </div>

        <div style={{ width: 24, height: 2, background: "#00ff41" }} />

        <div style={{ fontFamily: "Flick, sans-serif", fontSize: 20, color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
          FULL ANALYSIS
        </div>

        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 14,
            color: "#00ff41",
            border: "1.5px solid rgba(0,255,65,0.3)",
            borderRadius: 6,
            padding: "8px 24px",
            background: "rgba(0,0,0,0.4)",
            transform: `scale(${urlScale})`,
          }}
        >
          mssougra.com
        </div>

        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#a3a3a3" }}>
          or link in bio
        </div>
      </div>
    </AbsoluteFill>
  )
}
