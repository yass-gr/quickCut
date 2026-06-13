import { describe, it, expect } from "vitest"
import { predictionToBets } from "@/lib/predictions"
import type { Prediction } from "@/types"

describe("predictionToBets", () => {
  it("returns bets sorted by value descending", () => {
    const prediction: Prediction = {
      matchId: 1,
      probHomeWin: 45,
      probDraw: 25,
      probAwayWin: 30,
      probBttsYes: 68,
      probOver25: 82,
      expectedHomeGoals: 2.1,
      expectedAwayGoals: 1.3,
    }
    const bets = predictionToBets(prediction)
    expect(bets).toHaveLength(3)
    expect(bets[0].label).toBe("OVER 2.5")
    expect(bets[0].value).toBe(82)
    expect(bets[1].label).toBe("BTTS")
    expect(bets[1].value).toBe(68)
    expect(bets[2].label).toBe("HOME")
    expect(bets[2].value).toBe(45)
  })
})
