"use client"

import { useWizard } from "@/context/WizardContext"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SettingsPanel() {
  const { state, dispatch } = useWizard()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        dispatch({ type: "SET_BACKGROUND", payload: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="bg-card border-outline-variant">
      <CardHeader>
        <CardTitle className="text-on-surface font-mono text-sm">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs text-gray font-mono">BSD API Key</label>
          <Input
            type="password"
            value={state.apiKey}
            onChange={(e) => dispatch({ type: "SET_API_KEY", payload: e.target.value })}
            className="bg-surface border-outline-variant text-white font-mono text-sm mt-1"
            placeholder="Enter API key..."
          />
        </div>
        <div>
          <label className="text-xs text-gray font-mono">Background Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="bg-surface border-outline-variant text-white font-mono text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-gray font-mono">Hook Text (line 1)</label>
          <Input
            value={state.hookText[0]}
            onChange={(e) => dispatch({ type: "SET_HOOK_TEXT", payload: [e.target.value, state.hookText[1]] })}
            className="bg-surface border-outline-variant text-white font-mono text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-gray font-mono">Hook Text (line 2)</label>
          <Input
            value={state.hookText[1]}
            onChange={(e) => dispatch({ type: "SET_HOOK_TEXT", payload: [state.hookText[0], e.target.value] })}
            className="bg-surface border-outline-variant text-white font-mono text-sm mt-1"
          />
        </div>
      </CardContent>
    </Card>
  )
}
