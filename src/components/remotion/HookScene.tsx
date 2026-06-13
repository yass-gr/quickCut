import { AbsoluteFill } from "remotion"
import type { Match, Prediction } from "@/types"

interface HookSceneProps {
  hookText: [string, string]
  backgroundImage: string | null
  match: Match
  prediction: Prediction
}

export function HookScene(_props: HookSceneProps) {
  return <AbsoluteFill />
}
