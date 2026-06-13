import { Match, Prediction, Bet } from "@/types"
import fs from "fs"
import path from "path"

const BASE_URL = "https://sports.bzzoiro.com/api"
const CACHE_DIR = path.join(process.cwd(), "data", "cache")
const CACHE_TTL = 5 * 60 * 1000

function getApiKey(): string {
  const configPath = path.join(process.cwd(), "data", "config.json")
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
  return config.bsd_api_key
}

async function fetchWithAuth(endpoint: string): Promise<Response> {
  const apiKey = getApiKey()
  return fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
  })
}

function cachePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`)
}

function readCache(key: string): unknown | null {
  const file = cachePath(key)
  if (!fs.existsSync(file)) return null
  const stats = fs.statSync(file)
  if (Date.now() - stats.mtimeMs > CACHE_TTL) return null
  return JSON.parse(fs.readFileSync(file, "utf-8"))
}

function writeCache(key: string, data: unknown): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  fs.writeFileSync(cachePath(key), JSON.stringify(data))
}

function mapMatch(raw: Record<string, unknown>): Match {
  return {
    id: raw.id as number,
    homeTeam: {
      name: (raw.home_team as Record<string, unknown>)?.name as string || "Home",
      logo: (raw.home_team as Record<string, unknown>)?.logo as string | undefined,
    },
    awayTeam: {
      name: (raw.away_team as Record<string, unknown>)?.name as string || "Away",
      logo: (raw.away_team as Record<string, unknown>)?.logo as string | undefined,
    },
    league: {
      name: (raw.league as Record<string, unknown>)?.name as string || "",
      logo: (raw.league as Record<string, unknown>)?.logo as string | undefined,
    },
    kickoff: (raw.event_date || raw.start_date || raw.kickoff || "") as string,
    status: raw.status as string,
  }
}

function mapPrediction(raw: Record<string, unknown>, matchId: number): Prediction {
  return {
    matchId,
    probHomeWin: (raw.prob_home_win as number) ?? 0,
    probDraw: (raw.prob_draw as number) ?? 0,
    probAwayWin: (raw.prob_away_win as number) ?? 0,
    probBttsYes: (raw.prob_btts_yes as number) ?? 0,
    probOver25: (raw.prob_over_25 as number) ?? 0,
    expectedHomeGoals: (raw.expected_home_goals as number) ?? 0,
    expectedAwayGoals: (raw.expected_away_goals as number) ?? 0,
    odds: raw.odds as Record<string, number> | undefined,
    confidence: raw.confidence as number | undefined,
  }
}

export async function getUpcomingMatches(): Promise<Match[]> {
  const cached = readCache("matches")
  if (cached) return cached as Match[]

  const res = await fetchWithAuth("/events/?status=notstarted&limit=200")
  if (!res.ok) throw new Error(`Failed to fetch matches: ${res.statusText}`)
  const data = (await res.json()) as { results?: Record<string, unknown>[] }
  const matches = (data.results || []).map(mapMatch)
  writeCache("matches", matches)
  return matches
}

export async function getMatchDetail(id: number): Promise<Match | null> {
  const cached = readCache(`match-${id}`)
  if (cached) return cached as Match

  const res = await fetchWithAuth(`/events/${id}/`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Failed to fetch match ${id}: ${res.statusText}`)
  }
  const raw = (await res.json()) as Record<string, unknown>
  const match = mapMatch(raw)
  writeCache(`match-${id}`, match)
  return match
}

export async function getPredictions(): Promise<Prediction[]> {
  const cached = readCache("predictions")
  if (cached) return cached as Prediction[]

  const res = await fetchWithAuth("/predictions/?upcoming=true&limit=300")
  if (!res.ok) throw new Error(`Failed to fetch predictions: ${res.statusText}`)
  const data = (await res.json()) as { results?: Record<string, unknown>[] }
  const predictions = (data.results || []).map((p, i) => mapPrediction(p, i))
  writeCache("predictions", predictions)
  return predictions
}

export function predictionToBets(prediction: Prediction): Bet[] {
  const bets: Bet[] = [
    { label: "OVER 2.5", value: prediction.probOver25, confidence: prediction.probOver25 },
    { label: "BTTS", value: prediction.probBttsYes, confidence: prediction.probBttsYes },
    { label: "HOME", value: prediction.probHomeWin, confidence: prediction.probHomeWin },
  ]
  return bets.sort((a, b) => b.value - a.value)
}

export async function getTeamLogo(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return res.arrayBuffer()
  } catch {
    return null
  }
}
