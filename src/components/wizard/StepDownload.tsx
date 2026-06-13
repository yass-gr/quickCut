"use client"

import { useWizard } from "@/context/WizardContext"
import { Button } from "@/components/ui/button"

export function StepDownload() {
  const { state, dispatch } = useWizard()

  const handleRender = () => {
    if (!state.selectedMatch || !state.prediction) return
    const jobId = `job-${Date.now()}`
    const job = {
      id: jobId,
      matchId: state.selectedMatch.id,
      matchLabel: `${state.selectedMatch.match_home} vs ${state.selectedMatch.match_away}`,
      status: "queued" as const,
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
        match: state.selectedMatch,
        prediction: state.prediction,
        audioFile: state.selectedAudio,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          dispatch({
            type: "UPDATE_RENDER_JOB",
            payload: { id: jobId, status: "done", progress: 100, outputPath: data.outputPath },
          })
        } else {
          throw new Error(data.error || "Render failed")
        }
      })
      .catch((err) => {
        dispatch({
          type: "UPDATE_RENDER_JOB",
          payload: { id: jobId, status: "error", progress: 0, error: err.message },
        })
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
            className="w-full font-mono text-sm py-6"
            style={{ background: "#00ff41", color: "#000" }}
          >
            Render Video
          </Button>

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
