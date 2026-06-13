import type { Prediction, Bet } from "@/types"

export function predictionToBets(prediction: Prediction): Bet[] {
  const bets: Bet[] = [
    { label: "OVER 2.5", value: prediction.probOver25, confidence: prediction.probOver25 },
    { label: "BTTS", value: prediction.probBttsYes, confidence: prediction.probBttsYes },
    { label: "HOME", value: prediction.probHomeWin, confidence: prediction.probHomeWin },
  ]
  return [...bets].sort((a, b) => b.value - a.value)
}
