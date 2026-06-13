"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useWizard } from "@/context/WizardContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Match, Tip } from "@/types"

function formatKickoff(dateStr: string): { date: string; time: string } {
  if (!dateStr) return { date: "TBD", time: "" }
  const d = new Date(dateStr)
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  return { date, time }
}

export function StepMatch() {
  const { state, dispatch } = useWizard()
  const [matches, setMatches] = useState<Match[]>([])
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showKeyInput, setShowKeyInput] = useState(!state.apiKey)
  const [search, setSearch] = useState("")

  const fetchData = useCallback(async () => {
    if (!state.apiKey) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/matches", {
        headers: { "x-api-key": state.apiKey },
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed") }
      const data = await res.json()
      setMatches(data.matches || [])
      setTips(data.tips || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally { setLoading(false) }
  }, [state.apiKey])

  useEffect(() => { if (state.apiKey) fetchData() }, [fetchData, state.apiKey])

  const [loadingLogo, setLoadingLogo] = useState<string | null>(null)

  const handleSelect = async (match: Match) => {
    const tip = tips.find((t) => t.id === match.id)
    if (!tip) return

    setLoadingLogo(match.match_home)

    // Fetch logos for both teams on-demand
    const [homeRes, awayRes] = await Promise.all([
      fetch(`/api/team-logo?name=${encodeURIComponent(match.match_home)}`).then((r) => r.json()),
      fetch(`/api/team-logo?name=${encodeURIComponent(match.match_away)}`).then((r) => r.json()),
    ])

    // Proxy logo URLs through our server to avoid CORS issues
    const enriched = {
      ...match,
      home_logo: homeRes.url ? `/api/logo-proxy?url=${encodeURIComponent(homeRes.url)}` : undefined,
      away_logo: awayRes.url ? `/api/logo-proxy?url=${encodeURIComponent(awayRes.url)}` : undefined,
    }

    setLoadingLogo(null)
    dispatch({ type: "SELECT_MATCH", payload: { match: enriched, prediction: tip } })
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return matches
    const q = search.toLowerCase()
    return matches.filter(
      (m) =>
        m.match_home.toLowerCase().includes(q) ||
        m.match_away.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q)
    )
  }, [matches, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(a.kickoff || 0).getTime() - new Date(b.kickoff || 0).getTime())
  }, [filtered])

  if (showKeyInput) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-flick text-white">API Key Required</h2>
          <p className="text-xs font-mono mt-1" style={{ color: "#a3a3a3" }}>Enter your BSD API key to fetch matches</p>
        </div>
        <div className="max-w-md space-y-3">
          <Input
            type="password"
            value={state.apiKey}
            onChange={(e) => dispatch({ type: "SET_API_KEY", payload: e.target.value })}
            className="bg-surface border-outline-variant text-white font-mono text-sm"
            placeholder="BSD API Key..."
            style={{ background: "#061206", borderColor: "#1b4d1b", color: "#fff" }}
          />
          <Button
            onClick={() => {
              fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bsd_api_key: state.apiKey }),
              })
              setShowKeyInput(false)
              fetchData()
            }}
            disabled={!state.apiKey}
            className="font-mono text-xs"
            style={{ background: "#00ff41", color: "#000" }}
          >
            Load Matches
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-flick text-white">Choose Match</h2>
          <p className="text-xs font-mono mt-1" style={{ color: "#a3a3a3" }}>Select an upcoming match for your video</p>
        </div>
        <button
          onClick={() => setShowKeyInput(true)}
          className="text-xs font-mono underline"
          style={{ color: "#a3a3a3" }}
        >
          Change API key
        </button>
      </div>

      {loading && <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>Loading matches...</p>}
      {error && <p className="text-xs font-mono" style={{ color: "#ff4444" }}>{error}</p>}
      {!loading && matches.length === 0 && state.apiKey && (
        <p className="text-xs font-mono" style={{ color: "#a3a3a3" }}>No matches found. Check your API key.</p>
      )}

      {!loading && matches.length > 0 && (
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={14}
            style={{ color: "#a3a3a3" }}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team or league..."
            className="pl-9 font-mono text-sm"
            style={{ background: "#061206", borderColor: "#1b4d1b", color: "#fff" }}
          />
        </div>
      )}

      <div className="grid gap-3 max-h-[55vh] overflow-y-auto pr-2">
        {sorted.map((match) => {
          const isSelected = state.selectedMatch?.id === match.id
          const { date, time } = formatKickoff(match.kickoff)
          const tip = tips.find((t) => t.id === match.id)
          return (
            <button
              key={match.id}
              onClick={() => handleSelect(match)}
              disabled={loadingLogo === match.match_home}
              className="w-full text-left p-3 rounded-lg border transition-all disabled:opacity-50"
              style={{
                background: isSelected ? "rgba(0,255,65,0.08)" : "#101010",
                borderColor: isSelected ? "#00ff41" : "#1b4d1b",
                borderWidth: isSelected ? 2 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                {match.home_logo && (
                  <img
                    src={match.home_logo}
                    alt=""
                    className="w-8 h-8 rounded-full object-contain shrink-0"
                    style={{ background: "#1b4d1b33" }}
                  />
                )}

                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sm font-bold truncate" style={{ color: "#fff" }}>
                    {match.match_home}
                  </span>
                  <span className="font-mono text-[11px] font-bold shrink-0" style={{ color: "#558855" }}>
                    VS
                  </span>
                  <span className="font-mono text-sm font-bold truncate" style={{ color: "#fff" }}>
                    {match.match_away}
                  </span>
                  {match.away_logo && (
                    <img
                      src={match.away_logo}
                      alt=""
                      className="w-6 h-6 rounded-full object-contain shrink-0"
                      style={{ background: "#1b4d1b33" }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <span
                    className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                    style={{ background: "#1b4d1b33", color: "#558855" }}
                  >
                    {match.league}
                  </span>
                  {tip && (
                    <span
                      className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                      style={{
                        background:
                          tip._confidence >= 80
                            ? "rgba(92,255,106,0.1)"
                            : tip._confidence >= 60
                              ? "rgba(0,255,65,0.08)"
                              : "rgba(163,163,163,0.08)",
                        color:
                          tip._confidence >= 80
                            ? "#5CFF6A"
                            : tip._confidence >= 60
                              ? "#00ff41"
                              : "#a3a3a3",
                      }}
                    >
                      {tip._confidence}%
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-right leading-tight" style={{ color: "#d0ffd0" }}>
                    {date}
                    {time && <span className="block" style={{ color: "#558855" }}>{time}</span>}
                  </span>
                  {isSelected && (
                    <span
                      className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                      style={{ background: "rgba(0,255,65,0.15)", color: "#00ff41" }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
        {!loading && search && sorted.length === 0 && (
          <p className="text-xs font-mono text-center py-8" style={{ color: "#a3a3a3" }}>
            No matches match &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      <p className="text-xs font-mono" style={{ color: "#558855" }}>
        {sorted.length} match{sorted.length !== 1 ? "es" : ""}
      </p>
    </div>
  )
}
