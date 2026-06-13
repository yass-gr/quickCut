"use client"

import { useState, useEffect } from "react"
import { useWizard } from "@/context/WizardContext"
import { Input } from "@/components/ui/input"
import type { VideoTemplate } from "@/types"

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  standard: "Hook + Card + App Demo + CTA (15s)",
  "card-focus": "Hook + Card + CTA (12s)",
  quick: "Hook + CTA (8s)",
}

export function StepTemplate() {
  const { state, dispatch } = useWizard()
  const [templates, setTemplates] = useState<VideoTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (t: VideoTemplate) => {
    dispatch({ type: "SELECT_TEMPLATE", payload: t })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-flick text-white">Choose Template</h2>
        <p className="text-xs font-mono mt-1" style={{ color: "#a3a3a3" }}>
          Select a video style and customize the hook text
        </p>
      </div>

      {loading && <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>Loading templates...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((t) => {
          const isSelected = state.selectedTemplate?.id === t.id
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className="p-4 rounded-lg border text-left transition-colors"
              style={{
                background: isSelected ? "rgba(0,255,65,0.08)" : "#101010",
                borderColor: isSelected ? "#00ff41" : "#1b4d1b",
              }}
            >
              <p className="font-flick text-base text-white">{t.name}</p>
              <p className="font-mono text-xs mt-2" style={{ color: "#a3a3a3" }}>{t.description}</p>
              <p className="font-mono text-[10px] mt-1" style={{ color: "#558855" }}>
                {TEMPLATE_DESCRIPTIONS[t.id] || ""}
              </p>
            </button>
          )
        })}
      </div>

      {state.selectedTemplate && (
        <div className="space-y-3 p-4 rounded-lg border max-w-md" style={{ background: "#061206", borderColor: "#1b4d1b" }}>
          <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>Hook Text</p>
          <Input
            value={state.hookText[0]}
            onChange={(e) => dispatch({ type: "SET_HOOK_TEXT", payload: [e.target.value, state.hookText[1]] })}
            className="font-flick text-base"
            style={{ background: "#030803", borderColor: "#1b4d1b", color: "#fff" }}
          />
          <Input
            value={state.hookText[1]}
            onChange={(e) => dispatch({ type: "SET_HOOK_TEXT", payload: [state.hookText[0], e.target.value] })}
            className="font-flick text-base"
            style={{ background: "#030803", borderColor: "#1b4d1b", color: "#00ff41" }}
          />
        </div>
      )}
    </div>
  )
}
