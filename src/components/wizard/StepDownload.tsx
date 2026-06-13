"use client"

import { useWizard } from "@/context/WizardContext"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function StepDownload() {
  const { state, dispatch } = useWizard()
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<string | null>(null)

  const handleRender = () => {
    if (!state.selectedMatch || !state.prediction) return
    setRendering(true)
    setProgress(0)
    setPhase("preparing")

    const jobId = `job-${Date.now()}`
    const job = {
      id: jobId,
      matchId: state.selectedMatch.id,
      matchLabel: `${state.selectedMatch.match_home} vs ${state.selectedMatch.match_away}`,
      status: "rendering" as const,
      progress: 0,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_RENDER_JOB", payload: job })

    fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hookText: state.hookText,
        backgroundImage: state.backgroundImage,
        backgroundPosition: state.backgroundPosition,
        language: state.language,
        match: state.selectedMatch,
        prediction: state.prediction,
        audioFile: state.selectedAudio,
        audioVolume: state.audioVolume,
        audioTrimStart: state.audioTrimStart,
        audioTrimEnd: state.audioTrimEnd,
      }),
    }).then(async (response) => {
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        let eventType = ""
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (eventType === "progress") {
                setProgress(data.percent)
                setPhase("rendering")
                dispatch({
                  type: "UPDATE_RENDER_JOB",
                  payload: { id: jobId, progress: data.percent },
                })
              } else if (eventType === "done") {
                setProgress(100)
                setPhase("done")
                dispatch({
                  type: "UPDATE_RENDER_JOB",
                  payload: { id: jobId, status: "done", progress: 100, outputPath: data.outputPath },
                })
              } else if (eventType === "error") {
                setPhase("error")
                dispatch({
                  type: "UPDATE_RENDER_JOB",
                  payload: { id: jobId, status: "error", error: data.message },
                })
              }
            } catch {
              // skip malformed data
            }
          }
        }
      }
    }).catch((err) => {
      setPhase("error")
      dispatch({
        type: "UPDATE_RENDER_JOB",
        payload: { id: jobId, status: "error", progress: 0, error: err.message },
      })
    }).finally(() => {
      setRendering(false)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-flick text-white">Download</h2>
        <p className="text-xs font-mono mt-1" style={{ color: "#a3a3a3" }}>
          Render and download your video
        </p>
      </div>

      {!state.selectedMatch ? (
        <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>
          Select a match first.
        </p>
      ) : (
        <div className="max-w-md space-y-4">
          <div
            className="p-4 rounded-lg border"
            style={{ background: "#061206", borderColor: "#1b4d1b" }}
          >
            <p className="font-mono text-xs" style={{ color: "#d0ffd0" }}>
              {state.selectedMatch.match_home} vs {state.selectedMatch.match_away}
            </p>
            <p className="font-mono text-xs mt-1" style={{ color: "#a3a3a3" }}>
              Hook: &ldquo;{state.hookText[0]} {state.hookText[1]}&rdquo;
            </p>
            <p className="font-mono text-xs mt-1" style={{ color: "#a3a3a3" }}>
              Audio: {state.selectedAudio || "None"}
            </p>
          </div>

          <Button
            onClick={handleRender}
            disabled={rendering}
            className="w-full font-mono text-sm py-6"
            style={{ background: rendering ? "#1b4d1b" : "#00ff41", color: rendering ? "#a3a3a3" : "#000" }}
          >
            {rendering ? "Rendering..." : "Render Video"}
          </Button>

          {rendering && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span style={{ color: "#a3a3a3" }}>
                  {phase === "preparing" ? "Preparing..." : `Rendering ${progress}%`}
                </span>
                <span style={{ color: "#00ff41" }}>{progress}%</span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: "#002200" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #00cc33, #00ff41)",
                  }}
                />
              </div>
            </div>
          )}

          {state.renderQueue.filter((j) => j.status === "done" || j.status === "error").length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>History</p>
              {state.renderQueue.slice(-5).reverse().map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-lg border text-xs font-mono"
                  style={{ background: "#101010", borderColor: "#1b4d1b" }}
                >
                  <div className="flex justify-between">
                    <span style={{ color: "#fff" }}>{job.matchLabel}</span>
                    <span style={{ color: job.status === "done" ? "#5CFF6A" : "#ff4444" }}>
                      {job.status}
                    </span>
                  </div>
                  {job.outputPath && (
                    <a
                      href={`/api/download?path=${encodeURIComponent(job.outputPath)}`}
                      className="block mt-1 underline"
                      style={{ color: "#00ff41" }}
                    >
                      Download
                    </a>
                  )}
                  {job.error && <p className="mt-1" style={{ color: "#ff4444" }}>{job.error}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
