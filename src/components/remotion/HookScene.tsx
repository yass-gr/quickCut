import { AbsoluteFill, useCurrentFrame, interpolate, Easing, useVideoConfig, Img } from "remotion"
import type { Match, Tip } from "../../types"
import { t, tPick, tType, tHookSegment } from "../../lib/translations"
import type { Language } from "../../lib/translations"

interface HookSceneProps {
  hookText: [string, string]
  backgroundImage: string | null
  backgroundPosition: string
  language: Language
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

function BetCycle({ prediction, language }: { prediction: Tip | null; language: Language }) {

  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const bets = prediction
    ? [
        { label: tPick(language, prediction._best_market_pick), sub: tType(language, prediction._best_market_type), pct: prediction._best_market_prob ?? 50 },
        { label: t(language, "HOME"), sub: t(language, "HOME WIN"), pct: prediction._prob_home_win ?? 50 },
        { label: t(language, "AWAY"), sub: t(language, "AWAY WIN"), pct: prediction._prob_away_win ?? 50 },
        prediction._prob_btts_yes != null ? { label: prediction._prob_btts_yes > 50 ? t(language, "YES") : t(language, "NO"), sub: t(language, "BOTH TO SCORE"), pct: Math.max(prediction._prob_btts_yes, 100 - prediction._prob_btts_yes) } : null,
        prediction._prob_over_25 != null ? { label: prediction._prob_over_25 > 50 ? t(language, "OVER 2.5") : t(language, "UNDER 2.5"), sub: t(language, "TOTAL GOALS"), pct: Math.max(prediction._prob_over_25, 100 - prediction._prob_over_25) } : null,
      ].filter(Boolean) as { label: string; sub: string; pct: number }[]
    : [
        { label: t(language, "OVER 2.5"), sub: t(language, "TOTAL GOALS"), pct: 82 },
        { label: t(language, "HOME"), sub: t(language, "HOME WIN"), pct: 68 },
        { label: t(language, "AWAY"), sub: t(language, "AWAY WIN"), pct: 45 },
      ]

  const cycleDuration = Math.round(1.5 * fps)
  const cycleIndex = Math.floor(frame / cycleDuration) % bets.length
  const bet = bets[cycleIndex]
  const animFrame = frame % cycleDuration

  // Spring entrance for each bet (first 15% of cycle)
  const betEntranceFrames = Math.round(fps * 0.15)
  const betProgress = interpolate(animFrame, [0, betEntranceFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  })
  const betScale = interpolate(betProgress, [0, 1], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  })
  // Opacity: fade in using betProgress, hold, fade out using same as before but we can reuse
  const opacityIn = interpolate(animFrame, [0, betEntranceFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  })
  const opacityOut = interpolate(animFrame, [cycleDuration - betEntranceFrames, cycleDuration], [1, 0], {
    extrapolateLeft: "clamp",
  })
  const opacity = animFrame < betEntranceFrames ? opacityIn : animFrame > cycleDuration - betEntranceFrames ? opacityOut : 1

  // Small vertical bounce
  const y = interpolate(animFrame, [0, betEntranceFrames], [18, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  const color = getConfColor(bet.pct)

  const glowPulse = interpolate(
    animFrame,
    [0, cycleDuration / 2, cycleDuration],
    [0.3, 0.6, 0.3],
    { extrapolateRight: "clamp" }
  )

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{
        fontFamily: "Flick, sans-serif",
        fontWeight: 700,
        fontSize: 28,
        color: "#558855",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      }}>
        {bet.sub}
      </span>
      <span style={{
        fontFamily: "Flick, sans-serif",
        fontWeight: 700,
        fontSize: 72,
        color: "#ffffff",
        textShadow: `0 0 ${50 * glowPulse}px ${color}${Math.round(glowPulse * 255).toString(16).padStart(2, "0")}`,
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}>
        {bet.label}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: 40,
        color: "#00ff41",
        letterSpacing: "0.02em",
      }}>
        {bet.pct}%
      </span>
    </div>
  )
}
function TeamLogo({
  logo,
  name,
  size,
  delay,
  side,
}: {
  logo?: string
  name: string
  size: number
  delay: number
  side: 'left' | 'right'
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const enterProgress = interpolate(frame, [delay, delay + Math.round(fps * 0.5)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  })
  const logoOpacity = enterProgress
  const borderGlow = interpolate(enterProgress, [0, 1], [0, 0.3])

  // Slide in from side
  const slideDistance = 120
  const slideOffset = side === 'left'
    ? interpolate(enterProgress, [0, 1], [-slideDistance, 0])
    : interpolate(enterProgress, [0, 1], [slideDistance, 0])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        opacity: logoOpacity,
        transform: `translateX(${slideOffset}px)`,
      }}
    >
      {logo ? (
        <div style={{ position: "relative", width: size, height: size }}>
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(0,255,65,${borderGlow}), transparent 70%)`,
            }}
          />
          <Img
            src={logo}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              objectFit: "contain",
              position: "relative",
              background: "transparent",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: teamColor(name),
            boxShadow: "0 0 40px rgba(0,255,65,0.15)",
          }}
        >
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: size * 0.33,
            color: "#000",
          }}>
            {teamInitial(name)}
          </span>
        </div>
      )}
      <span style={{
        fontFamily: "Flick, sans-serif",
        fontWeight: 700,
        fontSize: 36,
        color: "#ffffff",
        textShadow: "0 2px 14px rgba(0,0,0,0.9)",
        textAlign: "center",
        letterSpacing: "-0.01em",
        maxWidth: 220,
        lineHeight: 1.15,
      }}>
        {name}
      </span>
    </div>
  )
}

export function HookScene(props: HookSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const globalOpacity = interpolate(frame, [0, Math.round(fps * 0.25)], [0, 1], { extrapolateRight: "clamp" })
  // Background rotation
  // Background rotation (slow triangle wave, 60s cycle, +/-0.5deg)
  const cycleFrames = fps * 60
  const halfCycle = cycleFrames / 2
  const phase = frame % cycleFrames
  let bgRotation = 0
  if (phase < halfCycle) {
    bgRotation = interpolate(phase, [0, halfCycle], [-0.5, 0.5], { extrapolateRight: "clamp" })
  } else {
    bgRotation = interpolate(phase, [halfCycle, cycleFrames], [0.5, -0.5], { extrapolateRight: "clamp" })
  }
  // Gradient overlay pulse (slow)
  const gradientPulse = interpolate(frame % (fps * 8), [0, fps * 4], [1, 1.015], { extrapolateRight: "clamp" })
  // Hook text entrance - staggered lines
  const line1Progress = interpolate(frame, [0, Math.round(fps * 0.6)], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  })
  const line2Progress = interpolate(frame, [Math.round(fps * 0.15), Math.round(fps * 0.75)], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  })
  const hook1Y = interpolate(line1Progress, [0, 1], [-35, 0])
  const hook2Y = interpolate(line2Progress, [0, 1], [-35, 0])

  // Card entrance
  const cardDelay = Math.round(fps * 0.4)
  const cardProgress = interpolate(frame, [cardDelay, cardDelay + Math.round(fps * 0.5)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  })
  const cardY = interpolate(cardProgress, [0, 1], [50, 0])
  const cardScale = interpolate(cardProgress, [0, 1], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  })

  const match = props.match || MOCK_MATCH

  // Exit slide - slides up and fades in last 1s
  const exitStart = Math.round(7.5 * fps)
  const exitProgress = interpolate(frame, [exitStart, exitStart + Math.round(fps * 0.8)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0, 0.3, 1),
  })
  const exitY = interpolate(exitProgress, [0, 1], [0, -300])
  const exitOpacity = interpolate(exitProgress, [0, 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })

  return (
    <AbsoluteFill style={{ opacity: globalOpacity * exitOpacity, transform: `translateY(${exitY}px) scale(${interpolate(exitProgress, [0, 1], [1, 0.95])})` }}>
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: props.backgroundImage
            ? `url(${props.backgroundImage}) ${props.backgroundPosition}/cover`
            : "linear-gradient(135deg, #0a1f12 0%, #1a0a0a 50%, #0a1f12 100%)",
          transform: `rotate(${bgRotation}deg) scale(1.12)`,
        }}
      />
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
        transform: `scale(${gradientPulse})`,
          background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Subtle radial accent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 35%, rgba(0,255,65,0.04), transparent 60%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "140px 48px 120px",
        }}
      >
        {/* Hook */}
        <div style={{ marginTop: 180 }}>
          <div style={{
            fontFamily: "Flick, sans-serif",
            fontWeight: 700,
            fontSize: 100,
        color: "#00ff41",
            lineHeight: 1.05,
            textShadow: "0 4px 30px rgba(0,0,0,1)",
            transform: `translateY(${hook1Y}px)`,
            opacity: line1Progress,
          }}>
            {tHookSegment(props.language, props.hookText[0], props.hookText[1], 0)}
          </div>
          <div style={{
            fontFamily: "Flick, sans-serif",
            fontWeight: 700,
            fontSize: 128,
            color: "#00ff41",
            textShadow: "0 0 60px rgba(0,255,65,0.4), 0 4px 30px rgba(0,0,0,1)",
            lineHeight: 1.05,
            marginTop: 4,
            transform: `translateY(${hook2Y}px)`,
            opacity: line2Progress,
          }}>
            {tHookSegment(props.language, props.hookText[0], props.hookText[1], 1)}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 0.15 }} />

        {/* Match Card - BIG */}
        <div
          style={{
            opacity: cardProgress,
            transform: `translateY(${cardY}px) scale(${cardScale})`,
            background: "rgba(3,8,3,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(0,255,65,0.15)",
            borderRadius: 24,
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            boxShadow: "0 12px 80px rgba(0,0,0,0.7), 0 0 120px rgba(0,255,65,0.05)",
          }}
        >
          {/* League + FULL TIME badge */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20,
              color: "#00ff41",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              background: "rgba(0,255,65,0.08)",
              border: "1px solid rgba(0,255,65,0.2)",
              borderRadius: 8,
              padding: "8px 24px",
              fontWeight: 600,
            }}>
              {t(props.language, "FULL TIME")}
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 22,
              color: "#558855",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}>
              {match.league}
            </span>
          </div>

          {/* Logos + Bet cycle row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            width: "100%",
            marginTop: 8,
          }}>
            <TeamLogo
              logo={match.home_logo}
              name={match.match_home}
              size={228}
              delay={cardDelay + Math.round(fps * 0.15)}
              side="left"
            />

            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <BetCycle prediction={props.prediction} language={props.language} />
            </div>

            <TeamLogo
              logo={match.away_logo}
              name={match.match_away}
              size={228}
              delay={cardDelay + Math.round(fps * 0.25)}
              side="right"
            />
          </div>

          {/* Subtle bottom accent line */}
          <div style={{
            width: 70,
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.3), transparent)",
            marginTop: 8,
          }} />
        </div>

        {/* Watermark */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 15,
          color: "rgba(0,255,65,0.18)",
          textAlign: "center",
          marginTop: "auto",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}>
          {t(props.language, "MSSOUGRA AI")}
        </div>
      </div>
    </AbsoluteFill>
  )
}
