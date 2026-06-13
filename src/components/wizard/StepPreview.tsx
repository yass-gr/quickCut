"use client"

import { useWizard } from "@/context/WizardContext"
import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
import type { ComponentType } from "react"
import type { Language } from "@/lib/translations"

const LANGS: { key: Language; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "fr", label: "FR" },
  { key: "darija", label: "الدارجة" },
]

const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player as unknown as ComponentType<any>),
  { ssr: false }
)

const QuickCutVideoComponent = dynamic(
  () => import("@/components/remotion/QuickCutVideo").then((mod) => mod.QuickCutVideo as unknown as ComponentType<any>),
  { ssr: false }
)

export function StepPreview() {
  const { state, dispatch } = useWizard()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [trimming, setTrimming] = useState(false)
  const trimTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!state.selectedAudio) {
      setPreviewUrl(null)
      return
    }
    if (state.audioTrimStart === 0 && state.audioTrimEnd >= 15) {
      setPreviewUrl(`/api/audio/${state.selectedAudio}`)
      return
    }
    setTrimming(true)
    if (trimTimer.current) clearTimeout(trimTimer.current)
    trimTimer.current = setTimeout(() => {
      fetch("/api/trim-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: state.selectedAudio,
          start: state.audioTrimStart,
          end: state.audioTrimEnd,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.url) setPreviewUrl(data.url)
          else setPreviewUrl(`/api/audio/${state.selectedAudio}`)
        })
        .catch(() => setPreviewUrl(`/api/audio/${state.selectedAudio}`))
        .finally(() => setTrimming(false))
    }, 600)
    return () => { if (trimTimer.current) { clearTimeout(trimTimer.current); trimTimer.current = null } }
  }, [state.selectedAudio, state.audioTrimStart, state.audioTrimEnd])

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
          className="aspect-[9/16] w-full max-w-[360px] rounded-lg overflow-hidden relative"
          style={{ background: "#000", border: "1px solid #1b4d1b" }}
        >
          <div className="absolute top-2 right-2 z-20 flex gap-1">
            {LANGS.map((l) => (
              <button
                key={l.key}
                onClick={() => dispatch({ type: "SET_LANGUAGE", payload: l.key })}
                className="text-xs font-mono px-2 py-1 rounded transition-colors"
                style={{
                  background: state.language === l.key ? "#00ff41" : "rgba(255,255,255,0.1)",
                  color: state.language === l.key ? "#000" : "#fff",
                  border: "1px solid",
                  borderColor: state.language === l.key ? "#00ff41" : "#1b4d1b",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
          {trimming && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
              <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>Trimming audio...</p>
            </div>
          )}
          <Player
            component={QuickCutVideoComponent}
            durationInFrames={15 * 30}
            fps={30}
            compositionWidth={1080}
            compositionHeight={1920}
            inputProps={{
              hookText: state.hookText,
              backgroundImage: state.backgroundImage,
              backgroundPosition: state.backgroundPosition,
              language: state.language,
              match: state.selectedMatch,
              prediction: state.prediction,
              audioUrl: previewUrl,
              audioVolume: state.audioVolume,
              audioTrimStart: previewUrl?.includes("_preview_") ? 0 : state.audioTrimStart,
              audioTrimEnd: previewUrl?.includes("_preview_") ? 15 : state.audioTrimEnd,
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
