"use client"

import { useWizard } from "@/context/WizardContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRef, useState, useCallback, useEffect } from "react"

function parsePos(pos: string): { x: number; y: number } {
  const parts = pos.split(/\s+/)
  return { x: parseFloat(parts[0] ?? "50"), y: parseFloat(parts[1] ?? "50") }
}

function clamp(v: number) { return Math.min(100, Math.max(0, v)) }

export function StepBackground() {
  const { state, dispatch } = useWizard()
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    isDragging: boolean
    startX: number
    startY: number
    startPx: number
    startPy: number
  }>({ isDragging: false, startX: 0, startY: 0, startPx: 50, startPy: 50 })

  const [livePos, setLivePos] = useState(state.backgroundPosition)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setLivePos(state.backgroundPosition)
  }, [state.backgroundPosition])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => dispatch({ type: "SET_BACKGROUND", payload: reader.result as string })
    reader.readAsDataURL(file)
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const { x, y } = parsePos(livePos)
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPx: x,
      startPy: y,
    }
    setIsDragging(true)
  }, [livePos])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    const pctX = clamp(dragRef.current.startPx - (dx / rect.width) * 100)
    const pctY = clamp(dragRef.current.startPy - (dy / rect.height) * 100)
    setLivePos(`${pctX}% ${pctY}%`)
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!dragRef.current.isDragging) return
    dragRef.current.isDragging = false
    setIsDragging(false)
    dispatch({ type: "SET_BACKGROUND_POSITION", payload: livePos })
  }, [dispatch, livePos])

  const handleReset = () => {
    setLivePos("50% 50%")
    dispatch({ type: "SET_BACKGROUND_POSITION", payload: "50% 50%" })
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
          <div className="space-y-4">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="rounded-lg overflow-hidden border relative cursor-grab active:cursor-grabbing select-none"
              style={{
                borderColor: "#1b4d1b",
                aspectRatio: "9 / 16",
                maxHeight: "480px",
              }}
            >
              <img
                src={state.backgroundImage}
                alt="Background preview"
                className="w-full h-full object-cover pointer-events-none"
                style={{ objectPosition: livePos }}
                draggable={false}
              />
              {/* Center crosshair */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "50%",
                  left: "50%",
                  width: 24,
                  height: 24,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div style={{ position: "absolute", inset: "0 0 50% 50%", borderLeft: "1px solid rgba(255,255,255,0.6)", borderTop: "1px solid rgba(255,255,255,0.6)" }} />
                <div style={{ position: "absolute", inset: "50% 50% 0 0", borderRight: "1px solid rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.6)" }} />
              </div>
              {isDragging && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "rgba(0,255,65,0.08)" }}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: "SET_BACKGROUND", payload: null })}
                className="font-mono text-xs"
                style={{ borderColor: "#1b4d1b", color: "#ff4444" }}
              >
                Remove
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="font-mono text-xs"
                style={{ borderColor: "#1b4d1b", color: "#a3a3a3" }}
              >
                Reset Position
              </Button>
            </div>
          </div>
        )}

        {!state.backgroundImage && (
          <div
            className="rounded-lg border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: "#1b4d1b", aspectRatio: "9 / 16", maxHeight: "480px" }}
          >
            <p className="text-xs font-mono px-4 text-center" style={{ color: "#a3a3a3" }}>
              No image selected — video will use a black background
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
