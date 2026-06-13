"use client"

import { useWizard } from "@/context/WizardContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function RenderQueue() {
  const { state, dispatch } = useWizard()

  const statusColor = (status: string) => {
    switch (status) {
      case "queued": return "text-yellow"
      case "rendering": return "text-primary"
      case "done": return "text-green2"
      case "error": return "text-red-400"
      default: return "text-gray"
    }
  }

  return (
    <Card className="bg-card border-outline-variant">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-on-surface font-mono text-sm">Render Queue</CardTitle>
        {state.renderQueue.some((j) => j.status === "done" || j.status === "error") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "CLEAR_COMPLETED" })}
            className="text-xs text-gray font-mono"
          >
            Clear completed
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2 max-h-48 overflow-y-auto">
        {state.renderQueue.length === 0 && (
          <p className="text-gray font-mono text-xs">No render jobs.</p>
        )}
        {state.renderQueue.map((job) => (
          <div key={job.id} className="bg-surface rounded p-3 border border-outline-variant">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-white">{job.matchLabel}</span>
              <span className={`font-mono text-xs ${statusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
            {job.status === "rendering" && (
              <div className="mt-2 h-1 bg-outline-variant rounded overflow-hidden">
                <div
                  className="h-full bg-primary rounded transition-all"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            )}
            {job.error && (
              <p className="text-red-400 font-mono text-[10px] mt-1">{job.error}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
