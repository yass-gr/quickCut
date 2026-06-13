# QuickCut — Handoff Document

> Full context for any AI agent to pick up development. Last updated: 2026-06-13

---

## 1. What It Is

QuickCut generates 15-second TikTok/Reel/Shorts football prediction videos. User configures everything through a Next.js wizard UI, previews in-browser via Remotion Player, then renders MP4 H.264 server-side.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| Video | Remotion | 4.0.476 |
| Video (server) | @remotion/bundler + @remotion/renderer | 4.0.476 |
| Video (preview) | @remotion/player | 4.0.476 |
| UI | Tailwind CSS v4 + shadcn/ui (base-ui v1.5) | - |
| Fonts | Flick (display), JetBrains Mono (data) | - |
| State | React Context + useReducer + localStorage | - |
| Routing | Next.js search params (`?step=match`) | - |
| Build | TypeScript + Turbopack | TS 5 |
| Audio trim | ffmpeg (child_process execSync) | system |
| Icons | lucide-react | 1.18 |
| Toasts | sonner | 2.0 |

---

## 3. Directory Structure

```
quickCut/
├── AGENTS.md                     # Next.js rules (auto-loaded)
├── CLAUDE.md                     # @AGENTS.md
├── data/
│   ├── audio/                    # Uploaded + trimmed MP3s
│   ├── cache/logos/              # Cached TheSportsDB badge images (SHA-256 key, .bin)
│   ├── config.json               # Persistent config (BSD API key)
│   ├── output/                   # Rendered MP4 files
│   └── templates/                # Video template definitions (JSON)
├── public/
│   └── fonts/                    # FlickSs2Demo (regular), FlickSs3Demo (bold)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── audio/            # GET list, POST upload MP3
│   │   │   ├── audio/[filename]/ # GET serve MP3 file
│   │   │   ├── config/           # GET/POST persist config
│   │   │   ├── download/         # GET serve rendered MP4
│   │   │   ├── logo-proxy/       # CORS proxy for TheSportsDB CDN
│   │   │   ├── matches/          # GET BSD matches + predictions
│   │   │   ├── predictions/      # GET predictions only
│   │   │   ├── render/           # POST trigger server-side render
│   │   │   ├── team-logo/        # GET search TheSportsDB for badge
│   │   │   ├── templates/        # GET list templates
│   │   │   └── trim-audio/       # POST ffmpeg trim (preview)
│   │   ├── globals.css           # Tailwind theme + font-face
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Wizard UI (6 steps)
│   ├── components/
│   │   ├── remotion/
│   │   │   ├── QuickCutVideo.tsx   # Root composition (3 sequences)
│   │   │   ├── HookScene.tsx       # Hook text + match card + bet cycling (0-8s)
│   │   │   ├── AppDemo.tsx         # Phone mockup with match details (8-11s)
│   │   │   └── CtaScene.tsx        # MSSOUGRA branding (11-15s)
│   │   ├── ui/                   # shadcn primitives (button, input, card)
│   │   └── wizard/
│   │       ├── StepMatch.tsx       # Match selection + logo fetch
│   │       ├── StepBackground.tsx  # Image upload
│   │       ├── StepTemplate.tsx    # Template picker + hook text editor
│   │       ├── StepAudio.tsx       # Track picker + upload + volume + trim
│   │       ├── StepPreview.tsx     # Remotion Player preview
│   │       └── StepDownload.tsx    # Render button + download links
│   ├── context/
│   │   └── WizardContext.tsx     # Global wizard state (reducer + localStorage + URL sync)
│   ├── lib/
│   │   ├── bsd-api.ts            # BSD API client
│   │   ├── render.ts             # Remotion renderVideo wrapper
│   │   └── utils.ts              # cn() helper
│   ├── remotion/
│   │   └── index.tsx             # Remotion Composition root
│   └── types.ts                  # All shared TypeScript types
├── next.config.js                # serverExternalPackages for Remotion
├── tsconfig.json
├── package.json
└── vitest.config.ts              # Vitest config
```

---

## 4. API Endpoints

### `/api/matches` (GET)
- Headers: `x-api-key: {key}`
- Returns `{ matches: Match[], tips: Tip[] }`
- Calls BSD `/events/?status=notstarted&limit=200` + `/predictions/?upcoming=true&limit=300`
- Merges predictions-to-events by event ID
- **No longer fetches team logos** — that's done client-side on match selection
- Sorts tips by confidence descending

### `/api/team-logo` (GET)
- Query: `name` (team name)
- Searches TheSportsDB free API: `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t={name}`
- Returns `{ url: "https://r2.thesportsdb.com/..." | null }`
- Rate limit retry: 3 attempts (1s/2s/3s backoff) on HTTP 429
- TheSportsDB free tier: 1000 req/day, 1 req/second recommended
- **CRITICAL: Uses `?t=` not `&t=`** — this was broken before 2026-06-13

### `/api/logo-proxy` (GET)
- Query: `url` (TheSportsDB CDN URL, URL-encoded)
- Fetches badge image from TheSportsDB CDN (`r2.thesportsdb.com` which has NO CORS headers)
- Serves with `Access-Control-Allow-Origin: *`
- Caches to `data/cache/logos/{sha256[:32]}.bin`
- Cache key: SHA-256 hex digest of downstream URL, truncated to 32 chars
- **CACHE KEY HISTORY**: Previously used `base64url.slice(0,64)` which caused collisions (both Inter Turku and AC Oulu badges mapped to same key because only the different suffix differed after 64 chars)

### `/api/render` (POST)
- Body: `{ match, prediction, hookText, backgroundImage, audioFile, audioVolume, audioTrimStart, audioTrimEnd }`
- Inlines logo images as data URLs (via `imageToDataUrl`) for server-side Chromium
- Trims audio with ffmpeg (supports looping if segment < 15s)
- Calls `renderVideo()` from `lib/render.ts`
- Returns `{ success: true, outputPath: "/path/to/output.mp4" }`

### `/api/config` (GET/POST)
- GET: Returns `data/config.json`
- POST: Merges body into config, persists to disk

### `/api/audio` (GET/POST)
- GET: Lists audio files (filters out `_trimmed_` and `_looped_` artifacts)
- POST: Upload MP3 via `FormData { file }`

### `/api/audio/[filename]` (GET)
- Serves MP3 with proper content-type/length headers

### `/api/trim-audio` (POST)
- Body: `{ filename, start, end }`
- Uses ffmpeg to cut segment, loops if < 15s
- Creates preview files (`_preview_` suffix) for the browser preview

### `/api/templates` (GET)
- Reads all JSON files from `data/templates/`
- Returns `VideoTemplate[]`

### `/api/download` (GET)
- Query: `path` (absolute path to output MP4)
- Serves file with `Content-Disposition: attachment`

### `/api/predictions` (GET)
- Same as matches but returns only `tips` array

---

## 5. Data Types (src/types.ts)

```typescript
Match {
  id, match_home, match_away, league, kickoff, status,
  home_logo?, away_logo?    // string URLs (proxy URLs, set client-side on selection)
}

Tip {
  id, match_home, match_away, league, kickoff,
  _confidence: number,         // 0-100 (best market prob)
  _prob_home_win, _prob_draw, _prob_away_win: number | null,
  _prob_btts_yes, _prob_over_25: number | null,
  _best_market_type: string,   // "1X2" | "BTTS" | "OVER/UNDER 2.5"
  _best_market_pick: string,   // "1" | "X" | "2" | "YES" | "NO" | "OVER 2.5" | "UNDER 2.5"
  _best_market_prob?: number,
  odds_cotesport, venue?
}

WizardState {
  apiKey, backgroundImage,
  selectedMatch: Match | null,
  prediction: Tip | null,
  hookText: [string, string],
  selectedTemplate: VideoTemplate | null,
  selectedAudio: string | null,
  audioVolume: number,        // 0-100
  audioTrimStart/End: number, // seconds
  renderQueue: RenderJob[]
}

VideoTemplate {
  id, name, description,
  hookText: [string, string],
  showAppDemo, showCta: boolean,
  betCycleSeconds: number
}
```

---

## 6. Wizard Flow

State managed by `WizardContext` (React Context + `useReducer`). Steps via URL search params (`?step=match`).

| Step  | Component | What user does |
|-------|-----------|----------------|
| match | StepMatch | Enter API key → load matches → select one |
| background | StepBackground | Upload background image via file picker (`image/*`) → converted to data URL via `FileReader.readAsDataURL` → preview shown (or dashed placeholder if none, with text: "No image selected — video will use a black background") → "Remove" button clears it back to null. In the video, `HookScene` renders it as a `background: url(...) center/cover` on the full frame with a gradient overlay below for readability. Falls back to a dark green/red gradient `linear-gradient(135deg, #0a1f12 0%, #1a0a0a 50%, #0a1f12 100%)` when null. Data URLs work directly in Remotion input props — no server-side conversion needed. |
| template | StepTemplate | Pick template → edit hook text |
| audio | StepAudio | Upload/pick MP3 → set volume → drag 15s trim window → play/pause preview |
| preview | StepPreview | Watch in-browser via Remotion Player |
| download | StepDownload | Click "Render Video" → wait → download MP4 |

State persists to `localStorage` key `quickcut-wizard-state` on every change.

---

## 7. BSD API (lib/bsd-api.ts)

- **Base**: `https://sports.bzzoiro.com/api`
- **Auth**: `Authorization: Token {key}` header
- **Key**: `a185e94cab65759adaec28cc07f8fd2b532e8012` (persisted in `data/config.json`)
- **Endpoints used**: `/events/?status=notstarted&limit=200`, `/predictions/?upcoming=true&limit=300`
- **Probability values**: BSD returns 0-1 scale. `pct()` helper converts to 0-100 at source (if ≤ 1, multiply by 100; if NaN, return default)
- **Team names**: Can be string or `{name: string}` object. `getTeamName()` handles both
- **Logos**: BSD has NO team logo data. `home_team`/`away_team` fields are plain strings. The `getLogo()` function exists in `eventToMatch()` but BSD always returns undefined for it
- **Match merging**: Predictions reference events by `event.id`. Matches are merged 1:1 with their corresponding prediction

---

## 8. Team Logo Pipeline (TheSportsDB)

**Flow when user selects a match:**

1. `StepMatch.handleSelect(match)` calls `/api/team-logo?name={team_name}` for both teams in parallel
2. Each call searches TheSportsDB `searchteams.php?t={name}` and returns the `strBadge` URL
3. StepMatch constructs proxy URLs: `/api/logo-proxy?url={encodeURIComponent(badgeUrl)}`
4. StepMatch dispatches `SELECT_MATCH` with the enriched match (has `home_logo`/`away_logo`)
5. Browser preview: `Img` components in HookScene load from proxy URLs (same-origin, no CORS)
6. Server render: `/api/render` converts proxy URLs to data URLs via `imageToDataUrl()`:
   - Reads from `data/cache/logos/{sha256}.bin` (populated by logo-proxy)
   - If cache miss, fetches directly from TheSportsDB CDN (server-side, no CORS issue)
   - Produces `data:image/png;base64,...` string for the Remotion input props

**Fallback**: If no logo URL (TheSportsDB returned null or error), HookScene renders a colored circle with team initials. Colors are deterministic from team name hash.

**TheSportsDB API details:**
- Free tier: `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t={name}`
- No API key needed for free tier
- Rate limit: ~1000 requests/day, ~1 req/second. Exceeding triggers HTTP 429
- Returns `{ teams: [{ strBadge: "https://r2.thesportsdb.com/images/media/team/badge/xxx.png" }] }`
- CDN (`r2.thesportsdb.com`) returns 200 OK but NO `access-control-allow-origin` header → blocks browser
- That's why `/api/logo-proxy` exists — serves images with `Access-Control-Allow-Origin: *`

**Bugs fixed (2026-06-13):**
1. **URL syntax**: Was `searchteams.php&t=Inter+Turku` (missing `?`), all calls silently returned null
2. **Rate limit**: Was `Promise.all` over 140 teams, hitting 429 on every call. Changed to on-demand fetch (2 requests max)
3. **Cache collision**: `base64url.slice(0,64)` caused collisions (both Inter Turku and AC Oulu had same key since first 64 base64 chars covered only common URL prefix). Changed to SHA-256 hex digest, truncated to 32 chars

---

## 9. Video Composition (Remotion)

**Root**: `QuickCutVideo.tsx` — 3 sequences at 30fps, 1080×1920

### HookScene (0-8s, 240 frames)
- Hook text: line 1 (96px Flick, white) + line 2 (120px, green `#00ff41`) with 0.3s fade-in + slide
- Match card: glass card (`rgba(0,0,0,0.55)` with blur, green border)
- Team logos: 110px circles (real badge or colored initials fallback)
- Team names: 34px Flick, white
- Bet cycling: cycles through 3-5 bets every ~1.5s (based on available prediction data):
  - Best market pick (largest probability)
  - Home win %
  - Away win %
  - BTTS % (if available)
  - Over/Under 2.5 % (if available)
- Confidence colors: `#5CFF6A` (≥80%), `#00ff41` (60-79%), `#a3a3a3` (<60%)
- Padding: 180px top/bottom, 50px sides

### AppDemo (8-11s, 90 frames)
- Slide in, fade out at end
- Phone mockup (55% width, 9:19 aspect, green border, dark screen)
- App header: small MSSOUGRA AI logo + text
- Match card inside: league, teams, confidence ring (SVG circle with stroke-dashoffset), best bet row
- "SEE IT IN ACTION" label
- Fade out over last 0.5s

### CtaScene (11-15s, 120 frames)
- Green MSSOUGRA AI logo (80px square with gradient "AI")
- "MSSOUGRA" text (72px Flick, green)
- "mssougra.com" pill button (24px)
- Fade in
- No match data — pure branding

### Audio
- Single `Audio` component in root with volume control (0-100 scale, converted to 0-1)
- Audio source: pre-trimmed MP3 segment via ffmpeg (server-side pre-cut)
- If audio segment < 15s, ffmpeg loops it to fill 15s

### Fonts
- `Flick`: loaded via `@remotion/fonts` `loadFont()` from `staticFile("fonts/FlickSs*Demo-*.ttf")`
- `JetBrains Mono`: system monospace (assumed available)

---

## 10. Audio System

### Upload
- POST `/api/audio` with `FormData { file: MP3 }`
- Saved to `data/audio/` with original filename

### Preview trim (StepAudio)
- Audio file decoded with Web Audio API (`fetch → arrayBuffer → decodeAudioData`)
- Fixed 15s sliding window: single range slider adjusts start position (0 to `duration - 15`)
- Playback: `AudioBufferSourceNode.start(0, offset, duration)` with `GainNode` for volume
- Playhead cursor over the track bar
- Auto-stop at trim end
- **No HTMLAudioElement** — uses Web Audio API exclusively for precise segment playback

### Render trim
- `/api/render` and `/api/trim-audio` use `ffmpeg -ss {start} -t {segLen} -i {input} -c copy {output}`
- If trimmed segment < 15s: loops with `ffmpeg -stream_loop N -i ... -c copy -t 15`
- Creates temporary files with `_render_` or `_preview_` suffix (cleaned up by listing filter)
- `-c copy` for fast, lossless cutting (stream copy, no re-encode)

---

## 11. Configuration

`data/config.json`:
```json
{
  "bsd_api_key": "a185e94cab65759adaec28cc07f8fd2b532e8012",
  "background_image": null,
  "default_hook_line1": "THE MODEL",
  "default_hook_line2": "LOVES THIS"
}
```

BSD API key is also configurable via the wizard UI (StepMatch → "Change API key" button).

---

## 12. Templates

Stored as JSON in `data/templates/`. Three built-in:

### Standard ("THE MODEL LOVES THIS")
- Hook + Card + App Demo + CTA
- 15 seconds total
- Bet cycle: ~2.67s per bet (3 cycles → 8s card segment)

### Quick ("PICK OF THE DAY")
- Hook + Card + CTA (no App Demo)
- 12 seconds total
- Bet cycle: 2s per bet (4 cycles → 8s card segment)

### Card Focus ("TODAY'S MATCH")
- Emphasizes match card, shorter hook, no App Demo
- 12 seconds total (roughly)
- Bet cycle: 2.5s per bet

---

## 13. Build & Run

```bash
npm run dev          # Next.js dev server (Turbopack, port 3000)
npx tsc --noEmit     # TypeScript check
npx next build       # Full Next.js build (for Remotion server-side)
```

### Critical config:
`next.config.js` must have:
```js
serverExternalPackages: ["@remotion/renderer", "@remotion/bundler"],
```
These are native Node.js packages that cannot be bundled by Turbopack/webpack.

### Port conflicts:
If port 3000 is in use, Next.js auto-selects 3001. Kill stale server with `kill {PID}`.

---

## 14. Known Issues & Gotchas

### TheSportsDB rate limiting
- Free tier is ~1000 req/day, but burst of concurrent requests triggers 429
- Current approach (on-demand fetch, 2 requests only) works reliably
- First request to a new team name causes a ~1-2s delay during match selection

### Cache state from stale code
- `data/cache/logos/` may contain `.bin` files from old `base64url.slice(0,64)` key scheme
- Old files are stale (not read by current code). Safe to delete.
- Clear with: `rm -rf data/cache/logos/*`

### Remotion render failures
- `@remotion/bundler` uses esbuild internally — runs in Node.js server context
- Server must have fonts available (JetBrains Mono on system)
- Flick fonts are loaded via `loadFont()` in the Remotion component, not system
- Chromium (Puppeteer) is bundled with Remotion — no system Chrome needed
- Audio must be served via HTTP URL (not local file path) for Remotion's `Audio` component

### Misc
- Browser preview audio uses Web Audio API — first play requires user gesture (handled by click-to-play)
- ffmpeg must be installed on the system for audio trimming
- TheSportsDB doesn't always find teams (e.g., non-English names, misspellings) — falls back to initials
- `@remotion/fonts` `loadFont()` is async — `QuickCutVideo` returns null until fonts load
- Wizard doesn't validate match selection before allowing "Continue" — user can proceed to template without selecting

---

## 15. NPM Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npx tsc --noEmit` | TypeScript check |
| `npx next build` | Production build |
| `npx remotion --help` | Remotion CLI (if needed for debugging) |
| `npx vitest run` | Run tests (if any) |

---

## 16. Recent Development History

2026-06-13:
- **Fixed**: Team logos not showing — root cause was `${SPORTSDB}&t=Liverpool` (missing `?`)
- **Fixed**: Rate-limit crashes — moved from batch fetch (140 concurrent requests) to on-demand (2 requests on match selection)
- **Fixed**: Cache key collisions — SHA-256 hex digest instead of `base64url.slice(0,64)`
- **Added**: `/api/team-logo` endpoint with 3x retry on 429
- **Added**: `loadingLogo` state in StepMatch with disabled button during logo fetch
- **Fixed**: `imageToDataUrl` in render route falls back to downstream URL when cache misses
- **Tested**: Full API pipeline verified via curl — matches → team-logo → logo-proxy → data URLs — all passing

2026-06-12:
- Created full project scaffold
- Added Remotion scenes (HookScene, AppDemo, CtaScene)
- Added audio upload + trim with ffmpeg
- Added Web Audio API playback (replaced HTMLAudioElement)
- Created wizard flow with 6 steps
- Added TheSportsDB integration for team logos
- Added CORS proxy for TheSportsDB CDN
- Added data URL inlining for server-side render
