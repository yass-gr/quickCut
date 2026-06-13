"use client"

import { useWizard } from "@/context/WizardContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function StepBackground() {
  const { state, dispatch } = useWizard()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => dispatch({ type: "SET_BACKGROUND", payload: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-flick text-white">Background Image</h2>
        <p className="text-xs font-mono mt-1" style={{ color: "#a3a3a3" }}>
          Choose an image that will appear behind your video content
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div>
          <label className="text-xs font-mono mb-2 block" style={{ color: "#a3a3a3" }}>Upload Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="font-mono text-sm"
            style={{ background: "#061206", borderColor: "#1b4d1b", color: "#fff" }}
          />
        </div>

        {state.backgroundImage && (
          <div className="space-y-2">
            <div
              className="rounded-lg overflow-hidden border"
              style={{ borderColor: "#1b4d1b" }}
            >
              <img
                src={state.backgroundImage}
                alt="Background preview"
                className="w-full h-48 object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "SET_BACKGROUND", payload: null })}
              className="font-mono text-xs"
              style={{ borderColor: "#1b4d1b", color: "#ff4444" }}
            >
              Remove
            </Button>
          </div>
        )}

        {!state.backgroundImage && (
          <div
            className="rounded-lg border-2 border-dashed h-48 flex items-center justify-center"
            style={{ borderColor: "#1b4d1b" }}
          >
            <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>
              No image selected — video will use a black background
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
