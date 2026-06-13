import { useVideoConfig } from "remotion"
import { BetCycle } from "./BetCycle"
import { predictionToBets } from "@/lib/predictions"
import type { Match, Prediction } from "@/types"

interface MatchCardProps {
  match: Match
  prediction: Prediction
}

function initial(name: string): string {
  return name.charAt(0).toUpperCase()
}

export function MatchCard({ match, prediction }: MatchCardProps) {
  const { fps } = useVideoConfig()
  const fps8s = 8 * fps

  const bets = predictionToBets(prediction)

  const cycleFrames = Math.floor(fps8s / bets.length)
  const transitionFrames = Math.floor(fps * 0.3)

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        border: "2px solid rgba(0,255,65,0.25)",
        borderRadius: 14,
        padding: "20px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: "#00ff41",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          background: "rgba(0,255,65,0.1)",
          border: "1px solid rgba(0,255,65,0.25)",
          borderRadius: 5,
          padding: "3px 12px",
        }}
      >
        FULL TIME
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "3px solid rgba(0,255,65,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, color: "#00ff41" }}>
              {initial(match.homeTeam.name)}
            </span>
          </div>
          <span
            style={{
              fontFamily: "Flick, sans-serif",
              fontSize: 14,
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              textAlign: "center",
            }}
          >
            {match.homeTeam.name}
          </span>
        </div>

        <BetCycle bets={bets} cycleFrames={cycleFrames} transitionFrames={transitionFrames} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "3px solid rgba(0,255,65,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, color: "#00ff41" }}>
              {initial(match.awayTeam.name)}
            </span>
          </div>
          <span
            style={{
              fontFamily: "Flick, sans-serif",
              fontSize: 14,
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              textAlign: "center",
            }}
          >
            {match.awayTeam.name}
          </span>
        </div>
      </div>
    </div>
  )
}
