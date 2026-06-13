export interface Match {
  id: number
  match_home: string
  match_away: string
  league: string
  kickoff: string
  status?: string
  home_logo?: string
  away_logo?: string
}

export interface Tip {
  id: number
  match_home: string
  match_away: string
  league: string
  kickoff: string
  _confidence: number
  _prob_home_win: number | null
  _prob_draw: number | null
  _prob_away_win: number | null
  _prob_btts_yes: number | null
  _prob_over_25: number | null
  _expected_home_goals: number | null
  _expected_away_goals: number | null
  _best_market_type: string
  _best_market_pick: string
  _best_market_prob?: number
  odds_cotesport: number | null
  venue?: { name: string; city: string } | null
}

export interface Bet {
  label: string
  marketType: string
  value: number
}

export interface VideoTemplate {
  id: string
  name: string
  description: string
  hookText: [string, string]
  showAppDemo: boolean
  showCta: boolean
  betCycleSeconds: number
}

export interface AudioTrack {
  filename: string
  name: string
  duration?: number
}

export interface RenderJob {
  id: string
  matchId: number
  matchLabel: string
  status: "queued" | "rendering" | "done" | "error"
  progress: number
  outputPath?: string
  error?: string
  createdAt: string
}

export interface WizardState {
  apiKey: string
  backgroundImage: string | null
  selectedMatch: Match | null
  prediction: Tip | null
  hookText: [string, string]
  selectedTemplate: VideoTemplate | null
  selectedAudio: string | null
  audioVolume: number
  audioTrimStart: number
  audioTrimEnd: number
  renderQueue: RenderJob[]
}

export type WizardStep = "match" | "background" | "template" | "audio" | "preview" | "download"
