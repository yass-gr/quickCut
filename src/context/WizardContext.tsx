"use client"

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import type { WizardState, Match, Tip, RenderJob, VideoTemplate, WizardStep } from "@/types"

const STORAGE_KEY = "quickcut-wizard-state"

export const STEP_ORDER: WizardStep[] = ["match", "background", "template", "audio", "preview", "download"]
export const STEP_LABELS: Record<WizardStep, string> = {
  match: "Choose Match",
  background: "Background",
  template: "Template",
  audio: "Audio",
  preview: "Preview",
  download: "Download",
}

const initialState: WizardState = {
  apiKey: "",
  backgroundImage: null,
  selectedMatch: null,
  prediction: null,
  hookText: ["THE MODEL", "LOVES THIS"] as [string, string],
  selectedTemplate: null,
  selectedAudio: null,
  renderQueue: [],
}

type Action =
  | { type: "SET_API_KEY"; payload: string }
  | { type: "SET_BACKGROUND"; payload: string | null }
  | { type: "SELECT_MATCH"; payload: { match: Match; prediction: Tip } }
  | { type: "SET_HOOK_TEXT"; payload: [string, string] }
  | { type: "SELECT_TEMPLATE"; payload: VideoTemplate | null }
  | { type: "SELECT_AUDIO"; payload: string | null }
  | { type: "ADD_RENDER_JOB"; payload: RenderJob }
  | { type: "UPDATE_RENDER_JOB"; payload: { id: string; status: RenderJob["status"]; progress: number; outputPath?: string; error?: string } }
  | { type: "REMOVE_RENDER_JOB"; payload: string }
  | { type: "CLEAR_COMPLETED" }
  | { type: "LOAD_STATE"; payload: Partial<WizardState> }

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_API_KEY": return { ...state, apiKey: action.payload }
    case "SET_BACKGROUND": return { ...state, backgroundImage: action.payload }
    case "SELECT_MATCH": return { ...state, selectedMatch: action.payload.match, prediction: action.payload.prediction }
    case "SET_HOOK_TEXT": return { ...state, hookText: action.payload }
    case "SELECT_TEMPLATE":
      if (action.payload) return { ...state, selectedTemplate: action.payload, hookText: action.payload.hookText }
      return { ...state, selectedTemplate: null }
    case "SELECT_AUDIO": return { ...state, selectedAudio: action.payload }
    case "ADD_RENDER_JOB": return { ...state, renderQueue: [...state.renderQueue, action.payload] }
    case "UPDATE_RENDER_JOB":
      return { ...state, renderQueue: state.renderQueue.map((j) => j.id === action.payload.id ? { ...j, ...action.payload } : j) }
    case "REMOVE_RENDER_JOB": return { ...state, renderQueue: state.renderQueue.filter((j) => j.id !== action.payload) }
    case "CLEAR_COMPLETED": return { ...state, renderQueue: state.renderQueue.filter((j) => j.status !== "done" && j.status !== "error") }
    case "LOAD_STATE": return { ...state, ...action.payload }
    default: return state
  }
}

interface WizardContextValue {
  state: WizardState
  dispatch: React.Dispatch<Action>
  step: WizardStep
  goToStep: (s: WizardStep) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  const stepParam = searchParams.get("step") as WizardStep | null
  const step: WizardStep = STEP_ORDER.includes(stepParam as WizardStep) ? (stepParam as WizardStep) : "match"
  const idx = STEP_ORDER.indexOf(step)
  const isFirstStep = idx === 0
  const isLastStep = idx === STEP_ORDER.length - 1

  const goToStep = (s: WizardStep) => {
    router.push(`${pathname}?step=${s}`)
  }

  const nextStep = () => { if (!isLastStep) goToStep(STEP_ORDER[idx + 1]) }
  const prevStep = () => { if (!isFirstStep) goToStep(STEP_ORDER[idx - 1]) }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === "object") {
          dispatch({ type: "LOAD_STATE", payload: parsed })
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  return (
    <WizardContext.Provider value={{ state, dispatch, step, goToStep, nextStep, prevStep, isFirstStep, isLastStep }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error("useWizard must be used within WizardProvider")
  return ctx
}
