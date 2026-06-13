"use client"

import { useState, useEffect, useRef } from "react"
import { useWizard } from "@/context/WizardContext"
import { Input } from "@/components/ui/input"
import type { AudioTrack } from "@/types"

export function StepAudio() {
  const { state, dispatch } = useWizard()
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [trackDuration, setTrackDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch("/api/audio")
      .then((r) => r.json())
      .then(setTracks)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!state.selectedAudio) {
      setTrackDuration(0)
      return
    }
    const url = `/api/audio/${state.selectedAudio}`
    const el = new Audio(url)
    audioRef.current = el
    el.preload = "metadata"
    el.addEventListener("loadedmetadata", () => {
      const dur = el.duration
      setTrackDuration(dur)
      if (state.audioTrimEnd === 0) {
        dispatch({ type: "SET_AUDIO_TRIM_END", payload: Math.min(dur, 15) })
      }
    })
    return () => {
      el.remove()
      audioRef.current = null
    }
  }, [state.selectedAudio, dispatch])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append("file", file)
    await fetch("/api/audio", { method: "POST", body: form })
    const updated = await fetch("/api/audio").then((r) => r.json())
    setTracks(updated)
  }

  const segLen = Math.max(0, state.audioTrimEnd - state.audioTrimStart)
  const maxEnd = trackDuration > 0 ? trackDuration : 15

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-flick text-white">Background Audio</h2>
        <p className="text-xs font-mono mt-1" style={{ color: "#a3a3a3" }}>
          Select music or upload your own MP3
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div>
          <label className="text-xs font-mono mb-2 block" style={{ color: "#a3a3a3" }}>Upload MP3</label>
          <Input
            type="file"
            accept="audio/*"
            onChange={handleUpload}
            className="font-mono text-sm"
            style={{ background: "#061206", borderColor: "#1b4d1b", color: "#fff" }}
          />
        </div>

        <div>
          <p className="text-xs font-mono mb-3" style={{ color: "#a3a3a3" }}>Available Tracks</p>
          {loading && <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>Loading...</p>}
          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: "SELECT_AUDIO", payload: null })}
              className="w-full text-left p-3 rounded-lg border font-mono text-xs transition-colors"
              style={{
                background: !state.selectedAudio ? "rgba(0,255,65,0.08)" : "#101010",
                borderColor: !state.selectedAudio ? "#00ff41" : "#1b4d1b",
                color: !state.selectedAudio ? "#00ff41" : "#fff",
              }}
            >
              No audio
            </button>
            {tracks.map((t) => {
              const isSelected = state.selectedAudio === t.filename
              return (
                <button
                  key={t.filename}
                  onClick={() => dispatch({ type: "SELECT_AUDIO", payload: isSelected ? null : t.filename })}
                  className="w-full text-left p-3 rounded-lg border font-mono text-xs transition-colors"
                  style={{
                    background: isSelected ? "rgba(0,255,65,0.08)" : "#101010",
                    borderColor: isSelected ? "#00ff41" : "#1b4d1b",
                    color: "#fff",
                  }}
                >
                  <span>{t.name || t.filename}</span>
                  {t.duration && <span className="ml-2" style={{ color: "#a3a3a3" }}>({Math.round(t.duration)}s)</span>}
                </button>
              )
            })}
            {!loading && tracks.length === 0 && (
              <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>No audio files yet.</p>
            )}
          </div>
        </div>

        {state.selectedAudio && trackDuration > 0 && (
          <div className="space-y-5 pt-2 border-t" style={{ borderColor: "#1b4d1b" }}>
            <p className="text-xs font-mono" style={{ color: "#00ff41" }}>Audio Controls</p>

            <div>
              <label className="text-xs font-mono flex justify-between mb-1" style={{ color: "#a3a3a3" }}>
                <span>Volume</span>
                <span>{state.audioVolume}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={state.audioVolume}
                onChange={(e) => dispatch({ type: "SET_AUDIO_VOLUME", payload: Number(e.target.value) })}
                className="w-full accent-[#00ff41]"
                style={{ accentColor: "#00ff41" }}
              />
            </div>

            <div>
              <label className="text-xs font-mono flex justify-between mb-2" style={{ color: "#a3a3a3" }}>
                <span>Trim — drag to choose the song segment</span>
              </label>

              <div className="relative h-8">
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full w-full"
                  style={{ background: "#1b4d1b" }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full"
                  style={{
                    background: "#00ff41",
                    left: `${(state.audioTrimStart / maxEnd) * 100}%`,
                    width: `${((state.audioTrimEnd - state.audioTrimStart) / maxEnd) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={maxEnd}
                  step={0.1}
                  value={state.audioTrimStart}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val < state.audioTrimEnd - 0.5) {
                      dispatch({ type: "SET_AUDIO_TRIM_START", payload: val })
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <input
                  type="range"
                  min={0}
                  max={maxEnd}
                  step={0.1}
                  value={state.audioTrimEnd}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val > state.audioTrimStart + 0.5) {
                      dispatch({ type: "SET_AUDIO_TRIM_END", payload: val })
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
              </div>

              <div className="flex justify-between text-xs font-mono mt-1" style={{ color: "#a3a3a3" }}>
                <span>0:00</span>
                <span>
                  {state.audioTrimStart.toFixed(1)}s — {state.audioTrimEnd.toFixed(1)}s
                  <span className="ml-2" style={{ color: "#00ff41" }}>
                    ({segLen.toFixed(1)}s)
                  </span>
                </span>
                <span>{formatTime(trackDuration)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, "0")}`
}
