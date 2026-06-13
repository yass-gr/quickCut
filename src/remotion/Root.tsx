import { Composition } from "remotion"
import type { ComponentType } from "react"
import { QuickCutVideo } from "../components/remotion/QuickCutVideo"

export const fps = 30

const QuickCutVideoComponent = QuickCutVideo as unknown as ComponentType<Record<string, unknown>>

export const RemotionRoot = () => {
  return (
    <Composition
      id="QuickCutVideo"
      component={QuickCutVideoComponent}
      durationInFrames={15 * fps}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        hookText: ["THE MODEL", "LOVES THIS"] as [string, string],
        backgroundImage: null,
        match: {
          id: 0,
          homeTeam: { name: "HOME", logo: undefined },
          awayTeam: { name: "AWAY", logo: undefined },
          league: { name: "LEAGUE" },
          kickoff: "",
          status: "notstarted",
        },
        prediction: {
          matchId: 0,
          probHomeWin: 45,
          probDraw: 25,
          probAwayWin: 30,
          probBttsYes: 68,
          probOver25: 82,
          expectedHomeGoals: 2.1,
          expectedAwayGoals: 1.3,
        },
      }}
    />
  )
}
