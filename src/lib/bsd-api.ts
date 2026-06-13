import { Match, Prediction } from "@/types"
import fs from "fs"
import path from "path"

const BASE_URL = "https://sports.bzzoiro.com/api"
const CACHE_DIR = path.join(process.cwd(), "data", "cache")
const CACHE_TTL = 5 * 60 * 1000

let cachedApiKey: string | null = null

function getApiKey(): string {
  if (cachedApiKey) return cachedApiKey
  const configPath = path.join(process.cwd(), "data", "config.json")
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
  cachedApiKey = config.bsd_api_key
  return cachedApiKey!
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

function getMatchId(raw: Record<string, unknown>): number {
  const ref = raw.match ?? raw.event ?? raw.match_id ?? raw.event_id
  if (typeof ref === "number") return ref
  if (ref && typeof ref === "object") return (ref as Record<string, unknown>).id as number
  return 0
}

function mapPrediction(raw: Record<string, unknown>): Prediction {
  return {
    matchId: getMatchId(raw),
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
  const predictions = (data.results || []).map((p) => mapPrediction(p))
  writeCache("predictions", predictions)
  return predictions
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
