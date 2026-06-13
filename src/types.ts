export interface Team {
  name: string
  logo?: string
}

export interface League {
  name: string
  logo?: string
}

export interface Match {
  id: number
  homeTeam: Team
  awayTeam: Team
  league: League
  kickoff: string
  status: string
}

export interface Prediction {
  matchId: number
  probHomeWin: number
  probDraw: number
  probAwayWin: number
  probBttsYes: number
  probOver25: number
  expectedHomeGoals: number
  expectedAwayGoals: number
  odds?: Record<string, number>
  confidence?: number
}

export interface Bet {
  label: string
  value: number
  confidence: number
}

export interface VideoTemplate {
  hookText: [string, string]
  backgroundImage: string
  fontFamily: string
  showAppDemo: boolean
}

export type RenderStatus = "queued" | "rendering" | "done" | "error"

export interface RenderJob {
  id: string
  matchId: number
  matchLabel: string
  status: RenderStatus
  progress: number
  outputPath?: string
  error?: string
  createdAt: string
}

export interface WizardState {
  apiKey: string
  backgroundImage: string | null
  selectedMatch: Match | null
  prediction: Prediction | null
  hookText: [string, string]
  renderQueue: RenderJob[]
}
