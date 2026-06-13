"use client"

import { useWizard } from "@/context/WizardContext"
import dynamic from "next/dynamic"
import type { ComponentType } from "react"

const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player as unknown as ComponentType<any>),
  { ssr: false }
)

const QuickCutVideoComponent = dynamic(
  () => import("@/components/remotion/QuickCutVideo").then((mod) => mod.QuickCutVideo as unknown as ComponentType<any>),
  { ssr: false }
)

export function StepPreview() {
  const { state } = useWizard()

  if (!state.selectedMatch || !state.prediction) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>
          Select a match first to preview your video.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-flick text-white">Preview</h2>
        <p className="text-xs font-mono mt-1" style={{ color: "#a3a3a3" }}>
          Review your video before rendering
        </p>
      </div>

      <div className="flex justify-center">
        <div
          className="aspect-[9/16] w-full max-w-[360px] rounded-lg overflow-hidden"
          style={{ background: "#000", border: "1px solid #1b4d1b" }}
        >
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
              audioUrl: state.selectedAudio ? `/api/audio/${state.selectedAudio}` : null,
            }}
            controls
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      <div
        className="p-4 rounded-lg border max-w-md mx-auto"
        style={{ background: "#061206", borderColor: "#1b4d1b" }}
      >
        <p className="font-mono text-xs" style={{ color: "#a3a3a3" }}>Summary</p>
        <div className="mt-2 space-y-1 font-mono text-xs">
          <p style={{ color: "#d0ffd0" }}>
            Match: <span style={{ color: "#fff" }}>{state.selectedMatch.match_home} vs {state.selectedMatch.match_away}</span>
          </p>
          <p style={{ color: "#d0ffd0" }}>
            Template: <span style={{ color: "#fff" }}>{state.selectedTemplate?.name || "Standard"}</span>
          </p>
          <p style={{ color: "#d0ffd0" }}>
            Audio: <span style={{ color: "#fff" }}>{state.selectedAudio || "None"}</span>
          </p>
          <p style={{ color: "#d0ffd0" }}>
            Hook: <span style={{ color: "#00ff41" }}>{state.hookText[0]} {state.hookText[1]}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
