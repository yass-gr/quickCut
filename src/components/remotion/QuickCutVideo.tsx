import { AbsoluteFill } from "remotion"
import type { Match, Prediction } from "@/types"

export interface QuickCutVideoProps {
  hookText: [string, string]
  backgroundImage: string | null
  match: Match
  prediction: Prediction
}

export function QuickCutVideo(_props: QuickCutVideoProps) {
  return <AbsoluteFill className="bg-black" />
}
