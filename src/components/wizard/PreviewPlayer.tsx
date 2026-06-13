"use client"

import { useWizard } from "@/context/WizardContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
)

const QuickCutVideoComponent = dynamic(
  () => import("@/components/remotion/QuickCutVideo").then((mod) => mod.QuickCutVideo),
  { ssr: false }
)

export function PreviewPlayer() {
  const { state } = useWizard()

  if (!state.selectedMatch || !state.prediction) {
    return (
      <Card className="bg-card border-outline-variant h-64 flex items-center justify-center">
        <p className="text-gray font-mono text-xs">Select a match to preview</p>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-outline-variant">
      <CardHeader>
        <CardTitle className="text-on-surface font-mono text-sm">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-[9/16] max-w-[300px] mx-auto bg-black rounded-lg overflow-hidden">
          <Player
            component={QuickCutVideoComponent}
            durationInFrames={15 * 30}
            fps={30}
            compositionWidth={1080}
            compositionHeight={1920}
            inputProps={{
              hookText: state.hookText,
              backgroundImage: state.backgroundImage,
              match: state.selectedMatch,
              prediction: state.prediction,
            }}
            controls
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
