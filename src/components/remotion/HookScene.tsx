import { AbsoluteFill, Img } from "remotion"
import { MatchCard } from "./MatchCard"
import type { Match, Prediction } from "@/types"

interface HookSceneProps {
  hookText: [string, string]
  backgroundImage: string | null
  match: Match
  prediction: Prediction
}

export function HookScene({ hookText, backgroundImage, match, prediction }: HookSceneProps) {
  return (
    <AbsoluteFill>
      {backgroundImage ? (
        <Img src={backgroundImage} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "#000" }} />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 24px 40px",
        }}
      >
        <div style={{ minHeight: "30%", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
          <div
            style={{
              fontFamily: "Flick, sans-serif",
              fontSize: 160,
              color: "#ffffff",
              lineHeight: 1.1,
              textShadow: "0 4px 25px rgba(0,0,0,1)",
              letterSpacing: "0.02em",
            }}
          >
            {hookText[0]}
            <br />
            <span
              style={{
                color: "#00ff41",
                fontSize: 210,
                textShadow: "0 0 40px rgba(0,255,65,0.3)",
              }}
            >
              {hookText[1]}
            </span>
          </div>
        </div>

        <div style={{ flex: 0.3 }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <MatchCard match={match} prediction={prediction} />
        </div>

        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: "rgba(0,255,65,0.3)",
            textAlign: "center",
            marginTop: "auto",
          }}
        >
          MSSOUGRA AI
        </div>
      </div>
    </AbsoluteFill>
  )
}
