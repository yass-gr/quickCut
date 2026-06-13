"use client"

import { useState, useEffect, useRef } from "react"
import { useWizard } from "@/context/WizardContext"
import { Input } from "@/components/ui/input"
import type { AudioTrack } from "@/types"

let ctx: AudioContext | null = null
function getCtx() {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function StepAudio() {
  const { state, dispatch } = useWizard()
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [trackDuration, setTrackDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const playingRef = useRef(false)
  const rafRef = useRef(0)
  const startTimeRef = useRef(0)
  const trimStartRef = useRef(state.audioTrimStart)
  const trimEndRef = useRef(state.audioTrimEnd)

  useEffect(() => { trimStartRef.current = state.audioTrimStart }, [state.audioTrimStart])
  useEffect(() => { trimEndRef.current = state.audioTrimEnd }, [state.audioTrimEnd])

  useEffect(() => {
    fetch("/api/audio")
      .then((r) => r.json())
      .then(setTracks)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!state.selectedAudio) {
      bufferRef.current = null
      setTrackDuration(0)
      return
    }
    const url = `/api/audio/${state.selectedAudio}`
    const ac = getCtx()
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => ac.decodeAudioData(buf))
      .then((decoded) => {
        bufferRef.current = decoded
        const dur = decoded.duration
        setTrackDuration(dur)
        const end = Math.min(dur, 15)
        trimStartRef.current = 0
        trimEndRef.current = end
        dispatch({ type: "SET_AUDIO_TRIM_START", payload: 0 })
        dispatch({ type: "SET_AUDIO_TRIM_END", payload: end })
      })
      .catch(() => {})
    return () => {
      stop()
    }
  }, [state.selectedAudio, dispatch])

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    try { sourceRef.current?.stop() } catch {}
    sourceRef.current?.disconnect()
    gainRef.current?.disconnect()
    sourceRef.current = null
    gainRef.current = null
    playingRef.current = false
    setPlaying(false)
  }

  function tick() {
    if (!playingRef.current) return
    const elapsed = getCtx().currentTime - startTimeRef.current + trimStartRef.current
    const pos = Math.min(elapsed, trimEndRef.current)
    setCurrentTime(pos)
    if (pos >= trimEndRef.current) {
      stop()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const togglePlay = () => {
    const buf = bufferRef.current
    if (!buf || trackDuration === 0) return

    if (playingRef.current) {
      stop()
      return
    }

    const ac = getCtx()
    ac.resume()

    const gain = ac.createGain()
    gain.gain.value = state.audioVolume / 100
    gain.connect(ac.destination)
    gainRef.current = gain

    const src = ac.createBufferSource()
    src.buffer = buf
    src.connect(gain)

    const offset = trimStartRef.current
    const dur = trimEndRef.current - trimStartRef.current

    src.start(0, offset, dur)
    sourceRef.current = src
    startTimeRef.current = ac.currentTime
    playingRef.current = true
    setPlaying(true)
    setCurrentTime(offset)

    src.onended = () => stop()
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = state.audioVolume / 100
  }, [state.audioVolume])

  const handleTrimStartChange = (val: number) => {
    dispatch({ type: "SET_AUDIO_TRIM_START", payload: val })
    trimStartRef.current = val
    if (playingRef.current) {
      stop()
      togglePlay()
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append("file", file)
    await fetch("/api/audio", { method: "POST", body: form })
    const updated = await fetch("/api/audio").then((r) => r.json())
    setTracks(updated)
  }

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
                <span>Pick a 15-second segment — drag the window</span>
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
                    width: `${(Math.min(15, maxEnd - state.audioTrimStart) / maxEnd) * 100}%`,
                  }}
                />
                {playing && (
                  <div
                    className="absolute top-0 h-full w-0.5 z-30"
                    style={{
                      background: "#fff",
                      left: `${(currentTime / maxEnd) * 100}%`,
                      transition: "left 0.1s linear",
                    }}
                  />
                )}
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, maxEnd - 15)}
                  step={0.1}
                  value={Math.min(state.audioTrimStart, Math.max(0, maxEnd - 15))}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    handleTrimStartChange(val)
                    const newEnd = Math.min(val + 15, maxEnd)
                    dispatch({ type: "SET_AUDIO_TRIM_END", payload: newEnd })
                    trimEndRef.current = newEnd
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>

              <div className="flex justify-between text-xs font-mono mt-1" style={{ color: "#a3a3a3" }}>
                <span>{formatTime(state.audioTrimStart)}</span>
                <span style={{ color: playing ? "#00ff41" : "#a3a3a3" }}>
                  {playing ? formatTime(currentTime) : "—"}
                  <span className="mx-2" style={{ color: "#a3a3a3" }}>|</span>
                  <span style={{ color: "#00ff41" }}>{Math.min(15, maxEnd - state.audioTrimStart).toFixed(1)}s</span>
                </span>
                <span>{formatTime(state.audioTrimEnd)}</span>
              </div>
            </div>

            <button
              onClick={togglePlay}
              className="w-full py-2.5 rounded-lg border font-mono text-xs transition-colors flex items-center justify-center gap-2"
              style={{
                background: playing ? "rgba(255,255,255,0.08)" : "#061206",
                borderColor: playing ? "#fff" : "#1b4d1b",
                color: playing ? "#fff" : "#00ff41",
              }}
            >
              {playing ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>
                  Pause
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>
                  Play segment
                </>
              )}
            </button>
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
