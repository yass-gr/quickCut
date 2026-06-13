import { AbsoluteFill, useCurrentFrame, interpolate, Easing, useVideoConfig, Img, staticFile } from "remotion"
import type { Match, Tip } from "../../types"
import { t, tPick, tType, tConfidenceLabel } from "../../lib/translations"
import type { Language } from "../../lib/translations"

interface AppDemoProps {
  match: Match | null
  prediction: Tip | null
  backgroundImage: string | null
  backgroundPosition: string
  language: Language
}

function ConfidenceRing({ pct, delay }: { pct: number; delay: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const size = 100
  const stroke = 7
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r

  const progress = interpolate(frame, [delay, delay + Math.round(fps * 0.8)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  })
  const offset = circ - (pct / 100) * circ * progress
  const color = pct < 50 ? "#FACC15" : "#5CFF6A"
  const displayValue = Math.round(pct * progress)

  return (
    <div style={{ width: size, height: size, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" strokeWidth={stroke} stroke="#002200" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} stroke={color} />
      </svg>
      <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 32, color }}>
          {displayValue}<span style={{ fontSize: 14 }}>%</span>
        </span>
      </div>
    </div>
  )
}

function BreakdownBar({ label, count, delay }: { label: string; count: number; delay: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const barColor = count >= 5 ? "#5CFF6A" : "#FACC15"
  const p = interpolate(frame, [delay, delay + Math.round(fps * 0.5)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  })
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#fff", flex: 1, marginRight: 10 }}>{label}</span>
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ width: 8, height: 16, background: i < count ? barColor : "#002200", opacity: p }} />
        ))}
      </div>
    </div>
  )
}

function InsightRow({ text, delay }: { text: string; delay: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = interpolate(frame, [delay, delay + Math.round(fps * 0.3)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
  return (
    <div style={{ display: "flex", alignItems: "flex-start", opacity: p, transform: `translateX(${interpolate(p, [0, 1], [12, 0])}px)` }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: "#00ff41", marginRight: 14, marginTop: 1 }}>{"\u2022"}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "rgba(255,255,255,0.9)", flex: 1, lineHeight: "22px" }}>{text}</span>
    </div>
  )
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#a3a3a3", letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" as const }}>{children}</div>
)

const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: "32px 28px", borderWidth: 1, borderColor: "#1b4d1b", backgroundColor: "#101010" }}>{children}</div>
)

export function AppDemo({ match, prediction, backgroundImage, backgroundPosition, language }: AppDemoProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const slideIn = interpolate(frame, [0, Math.round(fps * 0.5)], [300, 0], {
    extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
  const opacityIn = interpolate(frame, [0, Math.round(fps * 0.12)], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.175, 0.885, 0.32, 1.275) });
  const opacityOut = interpolate(frame, [Math.round(fps * 2.5), Math.round(fps * 3)], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = frame < Math.round(fps * 0.12) ? opacityIn : frame > Math.round(fps * 2.5) ? opacityOut : 1;
  const phoneOpacity = interpolate(frame, [Math.round(fps * 0.15), Math.round(fps * 0.4)], [0, 1], { easing: Easing.bezier(0.175, 0.885, 0.32, 1.275), extrapolateRight: "clamp" })

  const home = match?.match_home || "HOME"
  const away = match?.match_away || "AWAY"
  const league = match?.league || "LEAGUE"
  const confidence = prediction?._confidence ?? 85

  const scrollStart = Math.round(fps * 1.0)
  const scrollEnd = Math.round(fps * 2.4)
  const scrollY = interpolate(frame, [scrollStart, scrollEnd], [0, -440], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  })

  const bd = {
    [t(language, "HOME WIN")]: Math.round((prediction?._prob_home_win ?? 45) / 10),
    [t(language, "DRAW")]: Math.round((prediction?._prob_draw ?? 25) / 10),
    [t(language, "AWAY WIN")]: Math.round((prediction?._prob_away_win ?? 30) / 10),
    [t(language, "BTTS")]: prediction?._prob_btts_yes != null ? Math.round(prediction._prob_btts_yes / 10) : 7,
    [t(language, "OVER 2.5")]: prediction?._prob_over_25 != null ? Math.round(prediction._prob_over_25 / 10) : 6,
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "absolute", inset: 0, background: backgroundImage ? `url(${backgroundImage}) ${backgroundPosition}/cover` : "#000" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.9) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 55%, rgba(0,255,65,0.03), transparent 60%)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, transform: `translateY(${slideIn}px)` }}>

        {/* Label above phone */}
        <div style={{ fontFamily: "Flick, sans-serif", fontSize: 62, color: "#00ff41", textShadow: "0 2px 16px rgba(0,0,0,0.9)", letterSpacing: "0.03em", fontWeight: 700 }}>{t(language, "GET FULL AI ANALYSIS")}</div>

        {/* === REALISTIC PHONE === */}
        <div style={{ position: "relative" }}>
          {/* Phone outer shell - titanium frame */}
          <div style={{
            width: 778,
            height: 1320,
            background: "linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 15%, #1c1c1e 50%, #2c2c2e 85%, #3a3a3c 100%)",
            borderRadius: 44,
            padding: 4,
            position: "relative",
            opacity: phoneOpacity,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.12), 0 0 0 2px rgba(0,0,0,0.4), 0 40px 120px rgba(0,0,0,0.95), 0 0 80px rgba(0,255,65,0.03), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}>
            {/* Titanium edge highlight - top */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 20,
              right: 20,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            }} />

            {/* Side buttons */}
            {/* Power button right */}
            <div style={{ position: "absolute", right: -4, top: 130, width: 4, height: 65, background: "linear-gradient(180deg, #4a4a4c, #2a2a2c, #4a4a4c)", borderRadius: "0 3px 3px 0", boxShadow: "1px 0 3px rgba(0,0,0,0.5)" }} />
            {/* Volume up left */}
            <div style={{ position: "absolute", left: -4, top: 110, width: 4, height: 36, background: "linear-gradient(180deg, #4a4a4c, #2a2a2c, #4a4a4c)", borderRadius: "3px 0 0 3px", boxShadow: "-1px 0 3px rgba(0,0,0,0.5)" }} />
            {/* Volume down left */}
            <div style={{ position: "absolute", left: -4, top: 154, width: 4, height: 36, background: "linear-gradient(180deg, #4a4a4c, #2a2a2c, #4a4a4c)", borderRadius: "3px 0 0 3px", boxShadow: "-1px 0 3px rgba(0,0,0,0.5)" }} />
            {/* Action button left */}
            <div style={{ position: "absolute", left: -4, top: 82, width: 4, height: 16, background: "linear-gradient(180deg, #555, #333, #555)", borderRadius: "3px 0 0 3px", boxShadow: "-1px 0 3px rgba(0,0,0,0.5)" }} />

            {/* Inner screen area */}
            <div style={{
              width: "100%",
              height: "100%",
              background: "#000",
              borderRadius: 40,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}>
              {/* Dynamic Island */}
              <div style={{
                position: "absolute",
                top: 11,
                left: "50%",
                transform: "translateX(-50%)",
                width: 82,
                height: 24,
                background: "#000",
                borderRadius: 14,
                zIndex: 30,
                boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
              }} />

              {/* Screen content */}
              <div style={{
                flex: 1,
                background: "#030303",
                borderRadius: 38,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}>
                {/* Status bar */}
                <div style={{
                  height: 52,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 6,
                  position: "relative",
                  zIndex: 15,
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#fff", fontWeight: 600 }}>{t(language, "9:41")}</span>
                </div>

                {/* Scrollable content */}
                <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                  <div style={{ transform: `translateY(${scrollY}px)`, display: "flex", flexDirection: "column" }}>

                    {/* HEADER */}
                    <div style={{ margin: "0 28px", padding: "18px 0", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "#00ff41" }}>{t(language, ">")}</span>
                      <span style={{ fontFamily: "Flick, sans-serif", fontSize: 20, color: "#00ff41", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{t(language, "MATCH ANALYSIS")}</span>
                    </div>

                    {/* MATCH SECTION */}
                    <div style={{ margin: "0 28px 28px" }}>
                      <SectionLabel>{t(language, "MATCH")}</SectionLabel>
                      <Card>
                        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 48 }}>
                          <div style={{ flex: 5 }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#a3a3a3", textAlign: "center", marginBottom: 14 }}>{league}</div>
                            <div style={{ fontFamily: "Flick, sans-serif", fontWeight: 700, fontSize: 22, textTransform: "uppercase", letterSpacing: 1, color: "#fff", textAlign: "center" }}>{home}</div>
                          </div>
                          <div style={{ flex: 2, alignItems: "center", display: "flex", flexDirection: "column" }}>
                            <div style={{ fontFamily: "Flick, sans-serif", fontWeight: 700, fontSize: 36, color: "#00ff41" }}>{t(language, "VS")}</div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 16, color: "#fff", marginTop: 14 }}>{t(language, "15:00")}</div>
                          </div>
                          <div style={{ flex: 5 }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#a3a3a3", textAlign: "center", marginBottom: 14 }}>{league}</div>
                            <div style={{ fontFamily: "Flick, sans-serif", fontWeight: 700, fontSize: 22, textTransform: "uppercase", letterSpacing: 1, color: "#fff", textAlign: "center" }}>{away}</div>
                          </div>
                        </div>
                        <div style={{ borderTop: "1px solid #1b4d1b", paddingTop: 22, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, letterSpacing: 1, textTransform: "uppercase", color: "#a3a3a3" }}>{league}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, letterSpacing: 1, textTransform: "uppercase", color: "#a3a3a3" }}>{t(language, "15:00")}</span>
                        </div>
                      </Card>
                    </div>

                    {/* AI CONFIDENCE */}
                    <div style={{ margin: "0 28px 28px" }}>
                      <SectionLabel>{t(language, "AI CONFIDENCE")}</SectionLabel>
                      <Card>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <ConfidenceRing pct={confidence} delay={Math.round(fps * 0.5)} />
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 16, letterSpacing: 3, color: "#00cc33", marginTop: 16, textTransform: "uppercase" }}>
                            {tConfidenceLabel(language, confidence)}
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* AI PREDICTION */}
                    <div style={{ margin: "0 28px 28px" }}>
                      <SectionLabel>{t(language, "AI PREDICTION")}</SectionLabel>
                      <Card>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: "#a3a3a3", marginBottom: 10 }}>{t(language, "BEST PICK")}</div>
                          <div style={{ fontFamily: "Flick, sans-serif", fontWeight: 700, fontSize: 40, letterSpacing: 1, color: "#00ff41" }}>{prediction ? tPick(language, prediction._best_market_pick) : t(language, "OVER 2.5")}</div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: "#00ff41", marginTop: 10 }}>[{prediction ? tType(language, prediction._best_market_type) : t(language, "TOTAL GOALS")}]</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 36 }}>
                          <div style={{ flex: 1, height: 18, borderRadius: 4, backgroundColor: "#002200", maxWidth: 240, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${confidence}%`, borderRadius: 4, background: confidence >= 50 ? "#5CFF6A" : "#FACC15" }} />
                          </div>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 22, color: confidence >= 80 ? "#5CFF6A" : confidence >= 60 ? "#00ff41" : "#a3a3a3" }}>{confidence}%</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14 }}>
                          {prediction?._prob_over_25 != null && <div style={{ border: "1px solid #5CFF6A", borderRadius: 4, padding: "8px 16px" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#5CFF6A" }}>{t(language, "OVER 2.5")}: {Math.round(prediction._prob_over_25)}%</span></div>}
                          {prediction?._prob_btts_yes != null && <div style={{ border: "1px solid #5CFF6A", borderRadius: 4, padding: "8px 16px" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#5CFF6A" }}>{t(language, "BTTS")}: {Math.round(prediction._prob_btts_yes)}%</span></div>}
                          {prediction?.odds_cotesport && <div style={{ border: "1px solid #1b4d1b", borderRadius: 4, padding: "8px 16px" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#a3a3a3" }}>@{prediction.odds_cotesport.toFixed(2)}</span></div>}
                        </div>
                      </Card>
                    </div>

                    {/* CONFIDENCE BREAKDOWN */}
                    <div style={{ margin: "0 28px 28px" }}>
                      <SectionLabel>{t(language, "CONFIDENCE BREAKDOWN")}</SectionLabel>
                      <Card>
                        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                          {Object.entries(bd).map(([label, count], i) => (
                            <BreakdownBar key={label} label={label} count={count} delay={scrollStart + Math.round(fps * 0.08 * i)} />
                          ))}
                        </div>
                      </Card>
                    </div>

                    {/* AI INSIGHT */}
                    <div style={{ margin: "0 28px 44px" }}>
                      <SectionLabel>{t(language, "AI INSIGHT")}</SectionLabel>
                      <Card>
                        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                          <InsightRow text={`${home} ${t(language, "have a strong home record this season")}`} delay={scrollStart + Math.round(fps * 0.15)} />
                          <InsightRow text={`${away} ${t(language, "struggles away from home recently")}`} delay={scrollStart + Math.round(fps * 0.25)} />
                          <InsightRow text={t(language, "Head-to-head favors the home side")} delay={scrollStart + Math.round(fps * 0.35)} />
                        </div>
                      </Card>
                    </div>

                  </div>
                </div>

                {/* Home indicator */}
                <div style={{ height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 134, height: 5, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", borderRadius: 100 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "rgba(0,255,65,0.15)", textAlign: "center", letterSpacing: "0.2em", textTransform: "uppercase" }}>{t(language, "MSSOUGRA AI")}</div>
    </AbsoluteFill>
  )
}
