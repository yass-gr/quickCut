"use client"

import { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from "react"
import { WizardState, Match, Prediction, RenderJob } from "@/types"

const STORAGE_KEY = "quickcut-wizard-state"

const initialState: WizardState = {
  apiKey: "",
  backgroundImage: null,
  selectedMatch: null,
  prediction: null,
  hookText: ["THE MODEL", "LOVES THIS"],
  renderQueue: [],
}

type Action =
  | { type: "SET_API_KEY"; payload: string }
  | { type: "SET_BACKGROUND"; payload: string | null }
  | { type: "SELECT_MATCH"; payload: { match: Match; prediction: Prediction } }
  | { type: "SET_HOOK_TEXT"; payload: [string, string] }
  | { type: "ADD_RENDER_JOB"; payload: RenderJob }
  | { type: "UPDATE_RENDER_JOB"; payload: { id: string; status: RenderJob["status"]; progress: number; outputPath?: string; error?: string } }
  | { type: "REMOVE_RENDER_JOB"; payload: string }
  | { type: "CLEAR_COMPLETED" }
  | { type: "LOAD_STATE"; payload: WizardState }

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_API_KEY":
      return { ...state, apiKey: action.payload }
    case "SET_BACKGROUND":
      return { ...state, backgroundImage: action.payload }
    case "SELECT_MATCH":
      return { ...state, selectedMatch: action.payload.match, prediction: action.payload.prediction }
    case "SET_HOOK_TEXT":
      return { ...state, hookText: action.payload }
    case "ADD_RENDER_JOB":
      return { ...state, renderQueue: [...state.renderQueue, action.payload] }
    case "UPDATE_RENDER_JOB":
      return {
        ...state,
        renderQueue: state.renderQueue.map((job) =>
          job.id === action.payload.id ? { ...job, ...action.payload } : job
        ),
      }
    case "REMOVE_RENDER_JOB":
      return { ...state, renderQueue: state.renderQueue.filter((j) => j.id !== action.payload) }
    case "CLEAR_COMPLETED":
      return { ...state, renderQueue: state.renderQueue.filter((j) => j.status !== "done" && j.status !== "error") }
    case "LOAD_STATE":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

interface WizardContextValue {
  state: WizardState
  dispatch: React.Dispatch<Action>
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const isFirstRender = useRef(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === "object" && "renderQueue" in parsed) {
          dispatch({ type: "LOAD_STATE", payload: parsed })
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error("useWizard must be used within WizardProvider")
  return ctx
}
