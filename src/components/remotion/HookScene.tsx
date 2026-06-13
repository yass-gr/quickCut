import { AbsoluteFill, useCurrentFrame, interpolate, Easing, useVideoConfig, Img } from "remotion"
import type { Match, Tip } from "@/types"

interface HookSceneProps {
  hookText: [string, string]
  backgroundImage: string | null
  match: Match | null
  prediction: Tip | null
}

const MOCK_MATCH: Match = {
  id: 0,
  match_home: "HOME",
  match_away: "AWAY",
  league: "LEAGUE",
  kickoff: "",
}

function getConfColor(pct: number): string {
  if (pct >= 80) return "#5CFF6A"
  if (pct >= 60) return "#00ff41"
  return "#a3a3a3"
}

function teamInitial(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?"
}

function teamColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const colors = ["#00ff41", "#5CFF6A", "#00cc33", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"]
  return colors[Math.abs(hash) % colors.length]
}

function BetCycle({ prediction }: { prediction: Tip | null }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const bets = prediction
    ? [
        { label: prediction._best_market_pick, sub: prediction._best_market_type, pct: prediction._best_market_prob ?? 50 },
        { label: `${prediction._prob_home_win?.toFixed(0) ?? "?"}%`, sub: "HOME WIN", pct: prediction._prob_home_win ?? 50 },
        { label: `${prediction._prob_away_win?.toFixed(0) ?? "?"}%`, sub: "AWAY WIN", pct: prediction._prob_away_win ?? 50 },
        prediction._prob_btts_yes != null ? { label: prediction._prob_btts_yes > 50 ? "YES" : "NO", sub: "BTTS", pct: Math.max(prediction._prob_btts_yes, 100 - prediction._prob_btts_yes) } : null,
        prediction._prob_over_25 != null ? { label: `O${prediction._prob_over_25 > 50 ? "2.5" : "2.5"}`, sub: "OVER/UNDER", pct: Math.max(prediction._prob_over_25, 100 - prediction._prob_over_25) } : null,
      ].filter(Boolean) as { label: string; sub: string; pct: number }[]
    : [
        { label: "OVER 2.5", sub: "best", pct: 82 },
        { label: "68%", sub: "BTTS", pct: 68 },
        { label: "45%", sub: "HOME", pct: 45 },
      ]

  const cycleDuration = Math.round(1.5 * fps)
  const cycleIndex = Math.floor(frame / cycleDuration) % bets.length
  const bet = bets[cycleIndex]
  const animFrame = frame % cycleDuration
  const opacity = interpolate(animFrame, [0, 10, cycleDuration - 10, cycleDuration], [0, 1, 1, 0], { extrapolateRight: "clamp" })
  const y = interpolate(animFrame, [0, 10], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })
  const color = getConfColor(bet.pct)

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 26,
        color: "#a3a3a3",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        {bet.sub}
      </span>
      <span style={{
        fontFamily: "Flick, sans-serif",
        fontWeight: 700,
        fontSize: 64,
        color,
        textShadow: `0 0 30px ${color}50`,
        lineHeight: 1,
      }}>
        {bet.label}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: 36,
        color,
      }}>
        {bet.pct}%
      </span>
    </div>
  )
}

export function HookScene(props: HookSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const globalOpacity = interpolate(frame, [0, Math.round(fps * 0.3)], [0, 1], { extrapolateRight: "clamp" })
  const hookSlide = interpolate(frame, [0, fps], [-20, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })
  const cardSlide = interpolate(frame, [Math.round(fps * 0.3), fps], [30, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })
  const cardOpacity = interpolate(frame, [Math.round(fps * 0.3), fps], [0, 1], { extrapolateRight: "clamp" })

  const match = props.match || MOCK_MATCH

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: props.backgroundImage
            ? `url(${props.backgroundImage}) center/cover`
            : "linear-gradient(135deg, #1a3a2e, #2d1a1a)",
        }}
      />
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "180px 50px 180px",
        }}
      >
        {/* Hook */}
        <div
          style={{
            transform: `translateY(${hookSlide}px)`,
          }}
        >
          <div style={{
            fontFamily: "Flick, sans-serif",
            fontWeight: 700,
            fontSize: 96,
            color: "#ffffff",
            lineHeight: 1.15,
            textShadow: "0 4px 25px rgba(0,0,0,1)",
          }}>
            {props.hookText[0]}
            <br />
            <span style={{
              color: "#00ff41",
              fontSize: 120,
              textShadow: "0 0 50px rgba(0,255,65,0.4)",
            }}>
              {props.hookText[1]}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 0.5 }} />

        {/* Match Card */}
        <div
          style={{
            opacity: cardOpacity,
            transform: `translateY(${cardSlide}px)`,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "2px solid rgba(0,255,65,0.25)",
            borderRadius: 24,
            padding: "36px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          {/* FULL TIME badge */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 28,
            color: "#00ff41",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            background: "rgba(0,255,65,0.1)",
            border: "1px solid rgba(0,255,65,0.25)",
            borderRadius: 5,
            padding: "8px 24px",
          }}>
            FULL TIME
          </div>

          {/* Logos + Bet cycle row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 80,
            marginTop: 8,
          }}>
            {/* Home */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              {match.home_logo ? (
                <Img
                  src={match.home_logo}
                  style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "contain", border: "2.5px solid rgba(0,255,65,0.3)" }}
                />
              ) : (
                <div style={{
                  width: 110, height: 110, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: teamColor(match.match_home),
                  border: "2.5px solid rgba(0,255,65,0.3)",
                  boxShadow: "0 0 20px rgba(0,255,65,0.15)",
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: 36,
                    color: "#000",
                  }}>
                    {teamInitial(match.match_home)}
                  </span>
                </div>
              )}
              <span style={{
                fontFamily: "Flick, sans-serif",
                fontSize: 34,
                color: "#ffffff",
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                textAlign: "center",
              }}>
                {match.match_home}
              </span>
            </div>

            {/* Bet cycles here */}
            <BetCycle prediction={props.prediction} />

            {/* Away */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              {match.away_logo ? (
                <Img
                  src={match.away_logo}
                  style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "contain", border: "2.5px solid rgba(0,255,65,0.3)" }}
                />
              ) : (
                <div style={{
                  width: 110, height: 110, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: teamColor(match.match_away),
                  border: "2.5px solid rgba(0,255,65,0.3)",
                  boxShadow: "0 0 20px rgba(0,255,65,0.15)",
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: 36,
                    color: "#000",
                  }}>
                    {teamInitial(match.match_away)}
                  </span>
                </div>
              )}
              <span style={{
                fontFamily: "Flick, sans-serif",
                fontSize: 34,
                color: "#ffffff",
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                textAlign: "center",
              }}>
                {match.match_away}
              </span>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          color: "rgba(0,255,65,0.25)",
          textAlign: "center",
          marginTop: "auto",
        }}>
          MSSOUGRA AI
        </div>
      </div>
    </AbsoluteFill>
  )
}
