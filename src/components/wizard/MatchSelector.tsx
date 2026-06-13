"use client"

import { useState, useEffect } from "react"
import { useWizard } from "@/context/WizardContext"
import { Match, Prediction } from "@/types"
import { getUpcomingMatches, getPredictions, predictionToBets } from "@/lib/bsd-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function MatchSelector() {
  const { state, dispatch } = useWizard()
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!state.apiKey) return
    setLoading(true)
    setError(null)
    Promise.all([getUpcomingMatches(), getPredictions()])
      .then(([m, p]) => {
        setMatches(m)
        setPredictions(p)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load matches"))
      .finally(() => setLoading(false))
  }, [state.apiKey])

  const handleSelect = (match: Match) => {
    const pred = predictions.find((p) => p.matchId === match.id)
    if (pred) {
      dispatch({ type: "SELECT_MATCH", payload: { match, prediction: pred } })
    }
  }

  return (
    <Card className="bg-card border-outline-variant">
      <CardHeader>
        <CardTitle className="text-on-surface font-mono text-sm">Upcoming Matches</CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto space-y-2">
        {loading && <p className="text-gray font-mono text-xs">Loading matches...</p>}
        {error && <p className="text-red-400 font-mono text-xs">{error}</p>}
        {!state.apiKey && <p className="text-gray font-mono text-xs">Enter API key in settings to load matches.</p>}
        {matches.length === 0 && !loading && !error && state.apiKey && (
          <p className="text-gray font-mono text-xs">No upcoming matches found.</p>
        )}
        {matches.map((match) => {
          const isSelected = state.selectedMatch?.id === match.id
          const pred = predictions.find((p) => p.matchId === match.id)
          const bestBet = pred ? predictionToBets(pred)[0] : null
          return (
            <Button
              key={match.id}
              variant={isSelected ? "default" : "outline"}
              className={`w-full justify-start text-left h-auto py-3 px-4 font-mono text-xs ${
                isSelected ? "bg-primary text-black" : "border-outline-variant text-white"
              }`}
              onClick={() => handleSelect(match)}
            >
              <div className="flex flex-col gap-1 w-full">
                <span className="font-bold">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </span>
                <span className="text-[10px] opacity-70">
                  {match.league.name} • {new Date(match.kickoff).toLocaleDateString()}
                </span>
                {bestBet && <span className="text-[10px] opacity-60">Best: {bestBet.label} {bestBet.value}%</span>}
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
