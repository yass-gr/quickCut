import { AbsoluteFill, Sequence, Audio, useVideoConfig } from "remotion"
import { loadFont } from "@remotion/fonts"
import { staticFile } from "remotion"
import { useEffect, useState } from "react"
import { HookScene } from "./HookScene"
import { AppDemo } from "./AppDemo"
import { CtaScene } from "./CtaScene"
import type { Match, Tip } from "@/types"

interface QuickCutVideoProps {
  hookText: [string, string]
  backgroundImage: string | null
  match: Match | null
  prediction: Tip | null
  audioUrl?: string | null
  audioVolume?: number
}

export function QuickCutVideo(props: QuickCutVideoProps) {
  const { fps } = useVideoConfig()
  const volume = (props.audioVolume ?? 100) / 100
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      loadFont({
        family: "Flick",
        url: staticFile("fonts/FlickSs2Demo-nR6OO.ttf"),
        weight: "400",
      }),
      loadFont({
        family: "Flick",
        url: staticFile("fonts/FlickSs3Demo-1G0pv.ttf"),
        weight: "700",
      }),
    ]).then(() => setFontsLoaded(true))
  }, [])

  if (!fontsLoaded) return null

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {props.audioUrl && <Audio src={props.audioUrl} volume={volume} />}
      <Sequence from={0} durationInFrames={8 * fps}>
        <HookScene {...props} />
      </Sequence>
      <Sequence from={8 * fps} durationInFrames={3 * fps}>
        <AppDemo match={props.match} prediction={props.prediction} />
      </Sequence>
      <Sequence from={11 * fps} durationInFrames={4 * fps}>
        <CtaScene hookText={props.hookText} />
      </Sequence>
    </AbsoluteFill>
  )
}
