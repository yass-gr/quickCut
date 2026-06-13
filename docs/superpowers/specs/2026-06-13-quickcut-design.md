# QuickCut — Football Video Factory Spec

Date: 2026-06-13
Status: Draft

---

## 1. Overview

QuickCut is a Next.js + Remotion web application (served locally) that generates TikTok/Reel short-form videos (1080×1920, 30fps, 15s, MP4 H.264) from MSSOUGRA/BSD API football prediction data. Single-user, local PC, no cloud.

### Key Constraints
- Single-user, local only, no auth
- 5-15 videos/day with <15 min total work
- BSD API (`https://sports.bzzoiro.com/api`) for match data, predictions, logos
- No database — JSON files on disk for config, templates, cache, music manifest
- Next.js App Router + shadcn/ui + Tailwind CSS
- Remotion: `@remotion/renderer` (programmatic) + `@remotion/player` (preview)
- Wizard state: React Context + localStorage

---

## 2. Video Spec

### Canvas
- 1080×1920, 30fps, 15s duration
- Codec: H.264 (MP4 container)
- Background: Single user-selected image, full-frame with radial gradient overlay
- No cards — semi-transparent blurred pill overlays instead

### Scene Timeline

| Scene | Time | Content |
|-------|------|---------|
| **Hook + Card (bets cycle)** | 0-8s | Top: Hook text in Flick font ("THE MODEL / LOVES THIS"). Center: Match card (blurred pill) with team logos left/right. Between logos, bets cycle every ~1.5s: OVER 2.5 82% → BTTS 68% → HOME 45%. |
| **App Demo** | 8-11s | Phone mockup with simulated MSSOUGRA app match page (loading → scroll through hero, confidence ring, prediction card, breakdown). |
| **CTA** | 11-15s | MSSOUGRA logo (green gradient square) + "FULL ANALYSIS" + URL pill `mssougra.com` + "or link in bio" |

### Bet Cycling
Bets cycle in the card center (replacing "tips" label) every 1.5s with a crossfade transition:

| Bet | Color | Condition |
|-----|-------|-----------|
| OVER 2.5 82% | `#5CFF6A` | confidence ≥ 80% |
| BTTS 68% | `#00ff41` | confidence 60-79% |
| HOME 45% | `#a3a3a3` | confidence < 60% |

Colors are driven by the confidence value, not static per bet type.

### App Demo Section (3s)
- Phone mockup frame (rounded rectangle, dark border, notch)
- Inside: simulated MSSOUGRA match detail page
  - Brief loading state (pulsing grid skeleton)
  - Match hero: teams, league, kickoff time
  - Confidence ring (SVG animated arc + count-up %)
  - Prediction card (pick label, confidence bar, xG, badges)
  - Confidence breakdown (10-bar rows)
- All styled with exact app theme tokens (see §3)

---

## 3. Design System

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
- **Flick** (Ss2Demo variant for regular, Ss3Demo for bold) — Hooks, display text, team names, bet values
- **JetBrains Mono** — Data, percentages, labels, watermark, app demo UI
- **Montserrat** — Fallback (bundled via npm)

Font files are copied from `flick-font (1)/` to `public/fonts/` as part of project setup. Only Flick Ss2Demo (regular) and Ss3Demo (bold) variants are used.

### MSSOUGRA Logo
- 32×32 rounded square (border-radius: 8px)
- Background: `linear-gradient(135deg, #00ff41, #00cc33)`
- "AI" text in JetBrains Mono, black, bold

### Gradient Overlay
```css
background: linear-gradient(180deg,
  rgba(0,0,0,0.2) 0%,
  rgba(0,0,0,0.1) 20%,
  rgba(0,0,0,0.35) 50%,
  rgba(0,0,0,0.8) 100%
);
```

---

## 4. Architecture

### Application Layers
1. **BSD API Client** (`src/lib/bsd-api.ts`) — Fetch matches, predictions, team logos
2. **Wizard UI** (`app/`, `src/components/wizard/`) — Match selection, preview, render trigger
3. **Remotion Compositions** (`src/components/remotion/`) — All video scenes
4. **Render Pipeline** (`src/lib/render.ts`, `app/api/render/`) — Programmatic rendering with queue

### File Structure
```
quickCut/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Main wizard
│   └── api/
│       └── render/               # Render trigger endpoint
├── src/
│   ├── components/
│   │   ├── wizard/               # UI components
│   │   │   ├── MatchSelector.tsx
│   │   │   ├── PreviewPlayer.tsx
│   │   │   ├── RenderQueue.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── remotion/             # Video compositions
│   │       ├── Root.tsx          # Root composition (3 scenes)
│   │       ├── HookScene.tsx     # 0-8s: hook + card + bets
│   │       ├── MatchCard.tsx     # Team logos + pill backdrop
│   │       ├── BetCycle.tsx      # Cycling bets with crossfade
│   │       ├── AppDemo.tsx       # 8-11s: phone mockup + app UI
│   │       ├── CtaScene.tsx      # 11-15s: brand lockup
│   │       └── PhoneMockup.tsx   # Reusable phone frame
│   ├── context/
│   │   └── WizardContext.tsx     # Wizard state + localStorage
│   ├── lib/
│   │   ├── bsd-api.ts            # BSD API client
│   │   └── render.ts             # Remotion renderer wrapper
│   └── types.ts                  # Shared types
├── public/
│   └── fonts/                    # Flick, JetBrains Mono
├── data/                         # JSON cache, config
│   ├── config.json               # API key, defaults
│   ├── cache/                    # Cached API responses
│   └── templates/                # Saved video templates
├── flick-font (1)/               # Source font files
└── images (1).jpeg               # Sample background
```

### Data Flow
```
1. User opens wizard → loads cached matches from data/cache/
2. BSD API Client fetches fresh matches (background)
3. User selects match → preview in Remotion Player
4. User clicks "Render" → Render Pipeline queues job
5. Render Pipeline calls @remotion/renderer → writes MP4 to data/output/
```

---

## 5. Components Detail

### 5.1 Remotion Compositions

#### Root.tsx
- Main `<Composition>` wrapping all 3 scenes in sequence
- Manages shared data: match, predictions, background image
- Uses `<Sequence>` for timeline partitioning

#### HookScene.tsx (0-8s)
- Full-frame background image + gradient overlay
- Top-aligned hook text in Flick font:
  - Line 1: "THE MODEL" in white (~160px at 1080p)
  - Line 2: "LOVES THIS" in `#00ff41` with text-shadow glow (~210px)
- Center-aligned MatchCard component
- Watermark "MSSOUGRA AI" bottom-right in JetBrains Mono (opacity 0.3)

#### MatchCard.tsx
- Blurred pill container: `background: rgba(0,0,0,0.5); backdrop-filter: blur(8px)`
- Border: `2px solid rgba(0,255,65,0.25); border-radius: 14px`
- Content (centered, stacked):
  - Badge: "FULL TIME" in green, pill-shaped tag
  - Row: [Home Logo] [BetCycle] [Away Logo]
  - Team names below logos in Flick font (~30px)
- Logos: circular (72px), with border 3px rgba(0,255,65,0.3)
- Falls back to team initial letter if no logo URL

#### BetCycle.tsx
- Accepts array of bet objects: `{ label: string, value: number, confidence: number }`
- Cycles through bets with `<TransitionSeries>` (crossfade, 0.3s transition)
- Each bet shows:
  - Label in Flick font (e.g. "OVER 2.5")
  - Percentage in JetBrains Mono bold (e.g. "82%")
- Color determined by confidence value:
  - ≥80%: `#5CFF6A`
  - 60-79%: `#00ff41`
  - <60%: `#a3a3a3`
- Default bets from BSD API: prob_over_25, prob_btts_yes, prob_home_win
- Each bet visible for ~1.5s, 3 bets cycles ~2x in 8s window

#### AppDemo.tsx (8-11s)
- Animate in from above (slide down, 0.3s)
- Phone mockup centered, ~55% width
- Inside phone: simulated MSSOUGRA app screen
- Animation sequence:
  1. 0s-0.5s: Loading skeleton (pulsing rectangles)
  2. 0.5s-0.8s: Content fades in, loading hides
  3. 0.8s-2.5s: Static display of match detail page
  4. 2.5s-3s: Hold
- Match detail page content:
  - Match hero: team names, league badge, kickoff
  - Confidence ring: SVG arc (animated from 0 to value) + count-up number
  - Prediction card: pick label, confidence bar, xG values
  - Confidence breakdown: 10 horizontal bars with labels
- All using MSSOUGRA theme tokens (background `#030803`, surface `#061206`, etc.)

#### PhoneMockup.tsx
- Reusable component for phone frame
- Aspect ratio 9:19, border-radius 18px, border 2px `#1b4d1b`
- Background `#030803`
- Notch: centered pill at top
- Home indicator: thin pill at bottom
- Children rendered inside screen area

#### CtaScene.tsx (11-15s)
- Fade in from black (0.3s)
- Background image with 0.75 opacity dark overlay
- Central layout (stacked, centered):
  1. MSSOUGRA logo: 40×40, gradient bg, "AI" text
  2. "MSSOUGRA" in Flick font, white, ~60px
  3. Thin green divider line (2px)
  4. "FULL ANALYSIS" in Flick font, white, small
  5. URL pill: "mssougra.com" in JetBrains Mono, green, bordered
  6. "or link in bio" in JetBrains Mono, gray
- Slow pulse animation on URL pill (scale 1↔1.05)

### 5.2 Wizard UI Components

#### MatchSelector.tsx
- Searchable list of upcoming matches from BSD API
- Each row: team logos + names, league, kickoff time
- Click to select and preview

#### PreviewPlayer.tsx
- Uses `<Player>` from `@remotion/player`
- Responsive preview of selected match video
- Play/pause, scrub controls
- Shows real-time bet cycling and animations

#### RenderQueue.tsx
- List of queued renders with progress bars
- Status: queued / rendering / done / error
- Click to open output folder
- Clear completed button

#### SettingsPanel.tsx
- BSD API key input
- Background image upload
- Default hook text templates
- Output directory
- Font configuration

### 5.3 BSD API Client (`src/lib/bsd-api.ts`)
- Singleton service class
- Methods:
  - `getUpcomingMatches()` → returns `Match[]`
  - `getMatchDetail(id)` → returns `MatchDetail`
  - `getPredictions()` → returns `Prediction[]`
  - `getTeamLogo(url)` → returns ArrayBuffer for cache
- Auth: `Authorization: Token {BSD_API_KEY}` from `data/config.json`
- Caching: responses saved to `data/cache/` with TTL
- Error handling: retry on 429, fail with message on 4xx/5xx

### 5.4 Render Pipeline (`src/lib/render.ts`)
- Wraps `@remotion/renderer.renderMedia()`
- Input props: match data, background image path, font paths
- Output: `data/output/{match-id}-{timestamp}.mp4`
- Queue: sequential FIFO (one render at a time)
- Progress callback updates WizardContext
- Webhook on completion (optional, for notification)

---

## 6. Wizard UX Flow

1. **Launch** → Wizard opens at `localhost:3000`
2. **Configure** → Enter BSD API key, select background image
3. **Select matches** → Browse upcoming matches, pick one
4. **Preview** → See video preview with Remotion Player
5. **Edit hook** → Customize hook text (optional)
6. **Render** → Click render → queued in pipeline
7. **Wait** → Progress shown in render queue
8. **Done** → MP4 saved to `data/output/`

State persisted in localStorage via WizardContext (config, recent matches, render history).

---

## 7. Data Types

```typescript
interface Match {
  id: number
  homeTeam: { name: string; logo?: string }
  awayTeam: { name: string; logo?: string }
  league: { name: string; logo?: string }
  kickoff: string
  status: string
}

interface Prediction {
  matchId: number
  probHomeWin: number
  probDraw: number
  probAwayWin: number
  probBttsYes: number
  probOver25: number
  expectedHomeGoals: number
  expectedAwayGoals: number
  odds?: Record<string, number>
  confidence?: number
}

interface Bet {
  label: string
  value: number
  confidence: number
}

interface VideoTemplate {
  hookText: [string, string]  // [line1, line2]
  backgroundImage: string     // path
  fontFamily: string
  showAppDemo: boolean
}
```

---

## 8. Error Handling

- **BSD API unavailable**: Show stale cached matches, display warning banner
- **Invalid API key**: Clear error in settings, prevent render
- **Render failure**: Error state in queue, show Remotion error log
- **Missing font**: Fall back to Montserrat, warn in UI
- **Missing image**: Use solid black background
- **No predictions available**: Skip betting section, show simplified card

---

## 9. Testing Strategy

- **Remotion compositions**: Render single frames with `renderStill()` for visual diff
- **BSD API client**: Mock fetch, test caching, error handling
- **Wizard UI**: Vitest + React Testing Library
- **Render pipeline**: Test queue management, progress callbacks
- **Integration**: Full render of a sample match, verify output MP4 exists

---

## 10. Future Considerations (Out of Scope)

- Batch rendering multiple matches
- Music/sound overlay
- Automatic upload to TikTok/YouTube
- Analytics on video performance
- Multi-language support
