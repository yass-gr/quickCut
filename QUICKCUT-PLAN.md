# QuickCut — Football Video Factory

## Vision
Build a Next.js + Remotion app that turns MSSOUGRA/BSD API football prediction data into TikTok/Reel short-form videos (1080×1920, 30fps, 15s, MP4 H.264). Single-user, local PC, no cloud.

---

## Constraints
- **Single-user**, local only, no cloud hosting or auth
- **5–15 videos/day** with <15 min total work
- Uses **BSD API** (`https://sports.bzzoiro.com/api`) for match data, predictions, team logos
- No database — **JSON files on disk** for config, templates, cache, music manifest
- **Next.js App Router** + **shadcn/ui** for wizard UI, **Tailwind CSS**
- **Remotion** for video: `@remotion/renderer` (programmatic) + `@remotion/player` (preview in wizard)
- Wizard state: **React Context + localStorage**

---

## Video Spec
- **Canvas**: 1080×1920, 30fps, 15s
- **Codec**: H.264
- **Background**: Single user-selected image, full-frame with radial gradient overlay
- **No cards** — semi-transparent blurred/pills over image instead

### Flow & Timeline

| Scene | Time | Content |
|-------|------|---------|
| **Hook + Card (bets cycle)** | 0–8s | **Top**: Hook text in Flick font (e.g. "THE MODEL / LOVES THIS"). **Center**: Match card (blurred pill) with team logos left/right. Between logos, bets cycle every ~1.5s: OVER 2.5 82% → BTTS 68% → HOME 45%. |
| **App Demo** | 8–11s | Phone mockup with simulated MSSOUGRA app match page (loading → scroll through hero, confidence ring, prediction card, breakdown). Reuses app design system. |
| **CTA** | 11–15s | MSSOUGRA logo (green gradient square) + "FULL ANALYSIS" + URL pill `mssougra.com` + "or link in bio" |

### Bet Cycling (in card center, replacing "tips")
- **OVER 2.5 82%** — #5CFF6A (high confidence, ≥80%)
- **BTTS 68%** — #00ff41 (medium, 60-79%)
- **HOME 45%** — #a3a3a3 (low, <60%)

### App Demo Section (3s)
- Phone mockup frame (rounded rectangle, dark border)
- Inside: simulated MSSOUGRA match detail page
  - Brief loading state (AiLoader-style grid)
  - Match hero: teams, league, kickoff time
  - Confidence ring (SVG arc + count-up %)
  - Prediction card (pick label, confidence bar, xG, badges)
  - Confidence breakdown (10-bar rows)
- All styled with exact app theme tokens

---

## Design System (from MSSOUGRA app)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#00ff41` | Main accent, confidence ring, labels |
| `primaryContainer` | `#00cc33` | Active states |
| `green2` | `#5CFF6A` | High confidence (≥80%) |
| `yellow` | `#FACC15` | Confidence ring fallback |
| `gray` | `#a3a3a3` | Secondary text, low confidence |
| `card` | `#101010` | Card backgrounds |
| `background` | `#030803` | Page background |
| `surface` | `#061206` | Surface containers |
| `outlineVariant` | `#1b4d1b` | Borders |
| `white` | `#ffffff` | Primary text over image |
| `onSurface` | `#d0ffd0` | Text on surfaces |

### Fonts
- **Flick** — Hooks, display text, team names, bet values (from `flick-font (1)/`)
- **JetBrains Mono** — Data, percentages, labels, watermark, app demo UI
- **Montserrat** — Fallback (bundled)

### Confidence Colors (from app source)
- ≥80%: `#5CFF6A`
- 60–79%: `#00ff41`
- <60%: `#a3a3a3`

### MSSOUGRA Logo
- 32×32 rounded square
- Background: `linear-gradient(135deg, #00ff41, #00cc33)`
- "AI" text in JetBrains Mono, black

---

## Architecture

### Agents (split by feature)
1. **BSD API Agent** — Fetch match data, predictions, team logos
2. **Wizard UI Agent** — Next.js pages, shadcn/ui, form state
3. **Remotion Compositions Agent** — All video scenes/components
4. **Render Pipeline Agent** — Programmatic rendering, batch queue

### File Structure (proposed)
```
quickCut/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx            # Main wizard
│   └── api/
│       └── render/         # Trigger render
├── src/
│   ├── components/
│   │   ├── wizard/         # UI components
│   │   └── remotion/       # Video compositions
│   │       ├── Root.tsx
│   │       ├── HookScene.tsx
│   │       ├── MatchCard.tsx
│   │       ├── BetCycle.tsx
│   │       ├── AppDemo.tsx        # Phone mockup + app UI
│   │       ├── CtaScene.tsx
│   │       └── PhoneMockup.tsx    # Reusable phone frame
│   ├── context/
│   │   └── WizardContext.tsx
│   ├── lib/
│   │   ├── bsd-api.ts     # BSD API client
│   │   └── render.ts      # Remotion renderer
│   └── types.ts
├── public/
│   └── fonts/             # Flick, Montserrat
├── data/                  # JSON cache, config
├── flick-font (1)/        # Flick font files
└── images (1).jpeg        # Sample background
```

### App Demo (PhoneMockup + AppScreen)
A Remotion composition that:
1. Renders a phone outline (rounded rect with notch)
2. Inside: simulates MSSOUGRA match detail page
3. Animates: loading grid → scroll through match hero, confidence ring (SVG animated arc + count-up number), prediction card, confidence breakdown bars
4. Uses exact theme tokens (colors, spacing, JetBrains Mono)

Data source: BSD API → match detail endpoint → mapped to `Tip` type shape

---

## BSD API Reference

### Endpoints
- `GET /events/?status=notstarted&limit=200` — Upcoming matches
- `GET /events/{id}/` — Match detail (teams, venue, form, H2H)
- `GET /predictions/?upcoming=true&limit=300` — Predictions with confidence

### Auth
Header: `Authorization: Token {BSD_API_KEY}`

### Key Data Fields
- `home_team.name`, `away_team.name`, `home_team.logo`, `away_team.logo`
- `league.name`
- `event_date`, `start_date`, `kickoff`
- Prediction: `prob_home_win`, `prob_draw`, `prob_away_win`, `prob_btts_yes`, `prob_over_25`
- `expected_home_goals`, `expected_away_goals`
- `odds`, `confidence`

---

## Next Steps
1. Write formal spec → `docs/superpowers/specs/YYYY-MM-DD-quickcut-design.md`
2. Self-review spec
3. User reviews spec
4. Invoke `writing-plans` skill
5. Build implementation plan
6. Execute (agent split by feature)
