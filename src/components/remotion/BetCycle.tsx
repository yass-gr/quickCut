import { useCurrentFrame, interpolate, Easing } from "remotion"
import type { Bet } from "@/types"

function confidenceColor(value: number): string {
  if (value >= 80) return "#5CFF6A"
  if (value >= 60) return "#00ff41"
  return "#a3a3a3"
}

interface BetCycleProps {
  bets: Bet[]
  cycleFrames: number
  transitionFrames: number
}

export function BetCycle({ bets, cycleFrames, transitionFrames }: BetCycleProps) {
  const frame = useCurrentFrame()
  const totalCycles = bets.length * cycleFrames
  const looped = frame % totalCycles
  const currentIndex = Math.floor(looped / cycleFrames)
  const withinCurrent = looped % cycleFrames
  const isTransition = withinCurrent < transitionFrames

  const prevIndex = currentIndex > 0 ? currentIndex - 1 : bets.length - 1
  const currentBet = bets[currentIndex]
  const prevBet = bets[prevIndex]

  const progress = interpolate(withinCurrent, [0, transitionFrames], [0, 1], {
    easing: Easing.inOut(Easing.ease),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  const prevOpacity = isTransition ? 1 - progress : 0
  const currentOpacity = isTransition ? progress : 1

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          opacity: prevOpacity,
        }}
      >
        <span style={{ fontFamily: "Flick, sans-serif", fontSize: 42, color: confidenceColor(prevBet.value), lineHeight: 1 }}>
          {prevBet.label}
        </span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 26, fontWeight: 700, color: confidenceColor(prevBet.value) }}>
          {prevBet.value}%
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          opacity: currentOpacity,
        }}
      >
        <span style={{ fontFamily: "Flick, sans-serif", fontSize: 42, color: confidenceColor(currentBet.value), lineHeight: 1 }}>
          {currentBet.label}
        </span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 26, fontWeight: 700, color: confidenceColor(currentBet.value) }}>
          {currentBet.value}%
        </span>
      </div>
    </div>
  )
}
