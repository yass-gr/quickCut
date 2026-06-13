import type { Match, Tip } from "@/types"

let apiKey: string | null = null

export function setApiKey(key: string) { apiKey = key }
export function getApiKey(): string | null { return apiKey }

const BASE_URL = "https://sports.bzzoiro.com/api"

async function bsdFetch(path: string): Promise<Response> {
  if (!apiKey) throw new Error("BSD API key not set")
  return fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Token ${apiKey}` },
  })
}

function getTeamName(raw: Record<string, unknown>, key: string): string {
  const v = raw[key]
  if (typeof v === "string") return v
  if (v && typeof v === "object") return ((v as Record<string, unknown>)?.name as string) || ""
  return ""
}

function getLeagueName(raw: Record<string, unknown>): string {
  const v = raw.league
  if (typeof v === "string") return v
  if (v && typeof v === "object") return ((v as Record<string, unknown>)?.name as string) || ""
  return ""
}

function getLogo(raw: Record<string, unknown>, key: string): string | undefined {
  const v = raw[key]
  if (v && typeof v === "object") return (v as Record<string, unknown>).logo as string | undefined
  return undefined
}

function eventToMatch(raw: Record<string, unknown>): Match {
  return {
    id: raw.id as number,
    match_home: getTeamName(raw, "home_team"),
    match_away: getTeamName(raw, "away_team"),
    league: getLeagueName(raw),
    kickoff: (raw.event_date || raw.start_date || raw.kickoff || "") as string,
    status: (raw.status as string) || "notstarted",
    home_logo: getLogo(raw, "home_team"),
    away_logo: getLogo(raw, "away_team"),
  }
}

function pct(v: unknown, def: number): number {
  if (v == null) return def
  const n = Number(v)
  if (isNaN(n)) return def
  return n <= 1 ? Math.round(n * 100) : Math.round(n)
}

function predictionToTip(pred: Record<string, unknown>, evt?: Record<string, unknown>): Tip {
  const e = (pred.event as Record<string, unknown>) || {}
  const hp = pct(pred.prob_home_win, 50)
  const dp = pct(pred.prob_draw, 0)
  const ap = pct(pred.prob_away_win, 50)
  const probBtts = pred.prob_btts_yes != null ? pct(pred.prob_btts_yes, 50) : null
  const probOver25 = pred.prob_over_25 != null ? pct(pred.prob_over_25, 50) : null

  const contenders: { type: string; prob: number; pick: string }[] = [
    { type: "1X2", prob: hp, pick: "1" },
    { type: "1X2", prob: dp, pick: "X" },
    { type: "1X2", prob: ap, pick: "2" },
  ]

  if (probBtts != null) {
    const prob = Math.max(probBtts, 100 - probBtts)
    contenders.push({ type: "BTTS", prob, pick: prob === probBtts ? "YES" : "NO" })
  }

  if (probOver25 != null) {
    const prob = Math.max(probOver25, 100 - probOver25)
    contenders.push({
      type: "OVER/UNDER 2.5",
      prob,
      pick: prob === probOver25 ? "OVER 2.5" : "UNDER 2.5",
    })
  }

  const best = contenders.reduce((a, b) => (a.prob >= b.prob ? a : b))
  const eventId = Number(evt?.id ?? (e as { id?: number })?.id ?? pred.event_id ?? pred.match_id ?? 0)

  return {
    id: eventId,
    match_home: evt ? eventToMatch(evt).match_home : "",
    match_away: evt ? eventToMatch(evt).match_away : "",
    league: evt ? eventToMatch(evt).league : "",
    kickoff: evt ? eventToMatch(evt).kickoff : "",
    _confidence: best.prob,
    _prob_home_win: hp,
    _prob_draw: dp,
    _prob_away_win: ap,
    _prob_btts_yes: probBtts,
    _prob_over_25: probOver25,
    _expected_home_goals: (pred.expected_home_goals as number) ?? null,
    _expected_away_goals: (pred.expected_away_goals as number) ?? null,
    _best_market_type: best.type,
    _best_market_pick: best.pick,
    _best_market_prob: best.prob,
    odds_cotesport: (pred.odds as number) ?? null,
    venue: evt?.venue ? { name: ((evt.venue as Record<string, unknown>).name as string) || "", city: ((evt.venue as Record<string, unknown>).city as string) || "" } : null,
  }
}

export async function getUpcomingMatches(): Promise<{ matches: Match[]; tips: Tip[] }> {
  const [eventsRes, predictionsRes] = await Promise.all([
    bsdFetch("/events/?status=notstarted&limit=200"),
    bsdFetch("/predictions/?upcoming=true&limit=300"),
  ])

  if (!eventsRes.ok) throw new Error(`BSD events: ${eventsRes.status}`)
  if (!predictionsRes.ok) throw new Error(`BSD predictions: ${predictionsRes.status}`)

  const eventsData = await eventsRes.json() as { results?: Record<string, unknown>[] }
  const predictionsData = await predictionsRes.json() as { results?: Record<string, unknown>[] }

  const events = (eventsData.results || []) as Record<string, unknown>[]
  const predictions = (predictionsData.results || []) as Record<string, unknown>[]

  const predByEventId: Record<number, Record<string, unknown>> = {}
  for (const p of predictions) {
    const eid = (p.event as Record<string, unknown>)?.id as number | undefined
    if (eid) predByEventId[eid] = p
  }

  const matches: Match[] = []
  const tips: Tip[] = []

  for (const evt of events) {
    const match = eventToMatch(evt)
    matches.push(match)
    const pred = predByEventId[evt.id as number]
    if (pred) tips.push(predictionToTip(pred, evt))
  }

  tips.sort((a, b) => b._confidence - a._confidence)
  return { matches, tips }
}
