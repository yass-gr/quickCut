import { AbsoluteFill, Sequence, useVideoConfig } from "remotion"
import { HookScene } from "./HookScene"
import { AppDemo } from "./AppDemo"
import { CtaScene } from "./CtaScene"
import type { Match, Prediction } from "@/types"

export interface QuickCutVideoProps {
  hookText: [string, string]
  backgroundImage: string | null
  match: Match
  prediction: Prediction
}

export function QuickCutVideo({ hookText, backgroundImage, match, prediction }: QuickCutVideoProps) {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={8 * fps}>
        <HookScene
          hookText={hookText}
          backgroundImage={backgroundImage}
          match={match}
          prediction={prediction}
        />
      </Sequence>
      <Sequence from={8 * fps} durationInFrames={3 * fps}>
        <AppDemo />
      </Sequence>
      <Sequence from={11 * fps} durationInFrames={4 * fps}>
        <CtaScene backgroundImage={backgroundImage} />
      </Sequence>
    </AbsoluteFill>
  )
}
