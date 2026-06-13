"use client"

import { useState, useEffect } from "react"
import { useWizard } from "@/context/WizardContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AudioTrack } from "@/types"

export function StepAudio() {
  const { state, dispatch } = useWizard()
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/audio")
      .then((r) => r.json())
      .then(setTracks)
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append("file", file)
    await fetch("/api/audio", { method: "POST", body: form })
    const updated = await fetch("/api/audio").then((r) => r.json())
    setTracks(updated)
  }

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
                  {t.name || t.filename}
                  {t.duration && <span className="ml-2" style={{ color: "#a3a3a3" }}>({Math.round(t.duration)}s)</span>}
                </button>
              )
            })}
            {!loading && tracks.length === 0 && (
              <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>No audio files yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
