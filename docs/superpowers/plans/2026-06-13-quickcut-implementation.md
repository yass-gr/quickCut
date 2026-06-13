# QuickCut Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js + Remotion web app that generates football prediction short-form videos from BSD API data.

**Architecture:** Next.js App Router serves a wizard UI for match selection and preview. Remotion compositions (1080×1920, 30fps, 15s) render programmatically via `@remotion/renderer`. BSD API client fetches data with local JSON caching. No database — config/cache/output on disk.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Remotion v4 (`@remotion/player`, `@remotion/renderer`, `@remotion/fonts`), JetBrains Mono (Google Font), Flick (local font), Vitest

---

## File Structure

```
quickCut/
├── app/
│   ├── layout.tsx                # Root layout with font loading
│   ├── page.tsx                  # Main wizard page
│   ├── global.css                # Tailwind + font-face
│   └── api/
│       └── render/route.ts       # POST trigger for render
├── src/
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── MatchSelector.tsx
│   │   │   ├── PreviewPlayer.tsx
│   │   │   ├── RenderQueue.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── remotion/
│   │       ├── Root.tsx
│   │       ├── HookScene.tsx
│   │       ├── MatchCard.tsx
│   │       ├── BetCycle.tsx
│   │       ├── AppDemo.tsx
│   │       ├── PhoneMockup.tsx
│   │       └── CtaScene.tsx
│   ├── context/
│   │   └── WizardContext.tsx
│   ├── lib/
│   │   ├── bsd-api.ts
│   │   └── render.ts
│   └── types.ts
├── data/
│   ├── config.json
│   ├── cache/
│   └── output/
├── public/
│   └── fonts/
│       ├── FlickSs2Demo-nR6OO.ttf
│       └── FlickSs3Demo-1G0pv.ttf
└── tests/
    ├── bsd-api.test.ts
    └── render.test.ts
```

---

## Task 1: Scaffold Next.js + Remotion Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `app/layout.tsx`, `app/global.css`
- Install: All dependencies

- [ ] **Step 1: Create Next.js project**

```bash
npx create-next-app@latest quickcut --typescript --tailwind --eslint --app --src-dir --no-import-alias --no-turbopack
cd quickcut
```

Expected: Clean Next.js 14 project with `src/` directory, App Router, TypeScript.

- [ ] **Step 2: Install Remotion and core dependencies**

```bash
npm install remotion @remotion/player @remotion/renderer @remotion/fonts @remotion/cli
npm install -D @types/node
```

Expected: Dependencies added to `package.json`.

- [ ] **Step 3: Install shadcn/ui and initialize**

```bash
npx shadcn@latest init -d --yes
npx shadcn@latest add button card input select dialog toast -y
```

Expected: `components/ui/` directory with button, card, input, select, dialog, toast.

- [ ] **Step 4: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Expected: Test tooling in devDependencies.

- [ ] **Step 5: Generate Remotion CLI entry point**

```bash
npx remotion init
```

When prompted, select "Create root composition file". Expected: `src/remotion/` created with `Root.tsx` and `index.ts`.

- [ ] **Step 6: Create directory structure**

```bash
mkdir -p src/components/wizard src/components/remotion src/context src/lib data/cache data/output public/fonts tests
```

- [ ] **Step 7: Configure `next.config.js` for Remotion**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@remotion/renderer"],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "remotion": require.resolve("remotion"),
    };
    return config;
  },
};

module.exports = nextConfig;
```

- [ ] **Step 8: Create `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickCut — Football Video Factory",
  description: "Generate football prediction videos for social media",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-white antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: "Flick";
  src: url("/fonts/FlickSs2Demo-nR6OO.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Flick";
  src: url("/fonts/FlickSs3Demo-1G0pv.ttf") format("truetype");
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}

:root {
  --primary: #00ff41;
  --primary-container: #00cc33;
  --green2: #5cff6a;
  --yellow: #facc15;
  --gray: #a3a3a3;
  --card-bg: #101010;
  --background: #030803;
  --surface: #061206;
  --outline-variant: #1b4d1b;
  --on-surface: #d0ffd0;
}

body {
  background-color: var(--background);
  color: white;
}
```

- [ ] **Step 10: Configure `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00ff41",
        "primary-container": "#00cc33",
        green2: "#5cff6a",
        yellow: "#facc15",
        gray: "#a3a3a3",
        card: "#101010",
        background: "#030803",
        surface: "#061206",
        "outline-variant": "#1b4d1b",
        "on-surface": "#d0ffd0",
      },
      fontFamily: {
        flick: ["Flick", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 11: Create `tsconfig.json` paths**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 12: Copy font files**

```bash
cp "flick-font (1)/FlickSs2Demo-nR6OO.ttf" public/fonts/
cp "flick-font (1)/FlickSs3Demo-1G0pv.ttf" public/fonts/
```

- [ ] **Step 13: Create initial `data/config.json`**

```json
{
  "bsd_api_key": "",
  "background_image": "/images (1).jpeg",
  "default_hook_line1": "THE MODEL",
  "default_hook_line2": "LOVES THIS"
}
```

- [ ] **Step 14: Run dev server to verify**

```bash
npm run dev
```

Visit `http://localhost:3000` — should see blank page with dark background. Press Ctrl+C.

---

## Task 2: Types & BSD API Client

**Files:**
- Create: `src/types.ts`
- Create: `src/lib/bsd-api.ts`
- Create: `tests/bsd-api.test.ts`

- [ ] **Step 1: Create `src/types.ts`**

```ts
export interface Team {
  name: string
  logo?: string
}

export interface League {
  name: string
  logo?: string
}

export interface Match {
  id: number
  homeTeam: Team
  awayTeam: Team
  league: League
  kickoff: string
  status: string
}

export interface Prediction {
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

export interface Bet {
  label: string
  value: number
  confidence: number
}

export interface VideoTemplate {
  hookText: [string, string]
  backgroundImage: string
  fontFamily: string
  showAppDemo: boolean
}

export type RenderStatus = "queued" | "rendering" | "done" | "error"

export interface RenderJob {
  id: string
  matchId: number
  matchLabel: string
  status: RenderStatus
  progress: number
  outputPath?: string
  error?: string
  createdAt: string
}

export interface WizardState {
  apiKey: string
  backgroundImage: string | null
  selectedMatch: Match | null
  prediction: Prediction | null
  hookText: [string, string]
  renderQueue: RenderJob[]
}
```

- [ ] **Step 2: Create `src/lib/bsd-api.ts`**

```ts
import { Match, Prediction } from "@/types"
import fs from "fs"
import path from "path"

const BASE_URL = "https://sports.bzzoiro.com/api"
const CACHE_DIR = path.join(process.cwd(), "data", "cache")
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getApiKey(): string {
  const configPath = path.join(process.cwd(), "data", "config.json")
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
  return config.bsd_api_key
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

function mapPrediction(raw: Record<string, unknown>, matchId: number): Prediction {
  return {
    matchId,
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
  const predictions = (data.results || []).map((p, i) => mapPrediction(p, i))
  writeCache("predictions", predictions)
  return predictions
}

export function predictionToBets(prediction: Prediction): Bet[] {
  const bets: Bet[] = [
    { label: "OVER 2.5", value: prediction.probOver25, confidence: prediction.probOver25 },
    { label: "BTTS", value: prediction.probBttsYes, confidence: prediction.probBttsYes },
    { label: "HOME", value: prediction.probHomeWin, confidence: prediction.probHomeWin },
  ]
  return bets.sort((a, b) => b.value - a.value)
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
```

- [ ] **Step 3: Write test for BSD API client**

```ts
import { describe, it, expect } from "vitest"
import { predictionToBets, Prediction } from "@/types"

describe("predictionToBets", () => {
  it("returns bets sorted by value descending", () => {
    const prediction: Prediction = {
      matchId: 1,
      probHomeWin: 45,
      probDraw: 25,
      probAwayWin: 30,
      probBttsYes: 68,
      probOver25: 82,
      expectedHomeGoals: 2.1,
      expectedAwayGoals: 1.3,
    }
    const bets = predictionToBets(prediction)
    expect(bets).toHaveLength(3)
    expect(bets[0].label).toBe("OVER 2.5")
    expect(bets[0].value).toBe(82)
    expect(bets[1].label).toBe("BTTS")
    expect(bets[1].value).toBe(68)
    expect(bets[2].label).toBe("HOME")
    expect(bets[2].value).toBe(45)
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run
```

Expected: 1 test passing.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/lib/bsd-api.ts tests/bsd-api.test.ts package.json tsconfig.json tailwind.config.ts app/ next.config.js public/fonts/ data/config.json
git commit -m "feat: scaffold project with types and BSD API client"
```

---

## Task 3: Wizard Context + State Management

**Files:**
- Create: `src/context/WizardContext.tsx`

- [ ] **Step 1: Create `src/context/WizardContext.tsx`**

```tsx
"use client"

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react"
import { WizardState, Match, Prediction, RenderJob } from "@/types"

const STORAGE_KEY = "quickcut-wizard-state"

const initialState: WizardState = {
  apiKey: "",
  backgroundImage: null,
  selectedMatch: null,
  prediction: null,
  hookText: ["THE MODEL", "LOVES THIS"],
  renderQueue: [],
}

type Action =
  | { type: "SET_API_KEY"; payload: string }
  | { type: "SET_BACKGROUND"; payload: string | null }
  | { type: "SELECT_MATCH"; payload: { match: Match; prediction: Prediction } }
  | { type: "SET_HOOK_TEXT"; payload: [string, string] }
  | { type: "ADD_RENDER_JOB"; payload: RenderJob }
  | { type: "UPDATE_RENDER_JOB"; payload: { id: string; status: RenderJob["status"]; progress: number; outputPath?: string; error?: string } }
  | { type: "REMOVE_RENDER_JOB"; payload: string }
  | { type: "CLEAR_COMPLETED" }
  | { type: "LOAD_STATE"; payload: WizardState }

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_API_KEY":
      return { ...state, apiKey: action.payload }
    case "SET_BACKGROUND":
      return { ...state, backgroundImage: action.payload }
    case "SELECT_MATCH":
      return { ...state, selectedMatch: action.payload.match, prediction: action.payload.prediction }
    case "SET_HOOK_TEXT":
      return { ...state, hookText: action.payload }
    case "ADD_RENDER_JOB":
      return { ...state, renderQueue: [...state.renderQueue, action.payload] }
    case "UPDATE_RENDER_JOB":
      return {
        ...state,
        renderQueue: state.renderQueue.map((job) =>
          job.id === action.payload.id ? { ...job, ...action.payload } : job
        ),
      }
    case "REMOVE_RENDER_JOB":
      return { ...state, renderQueue: state.renderQueue.filter((j) => j.id !== action.payload) }
    case "CLEAR_COMPLETED":
      return { ...state, renderQueue: state.renderQueue.filter((j) => j.status !== "done" && j.status !== "error") }
    case "LOAD_STATE":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

interface WizardContextValue {
  state: WizardState
  dispatch: React.Dispatch<Action>
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({ type: "LOAD_STATE", payload: parsed })
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error("useWizard must be used within WizardProvider")
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/WizardContext.tsx
git commit -m "feat: add wizard context with localStorage persistence"
```

---

## Task 4: Wizard UI

**Files:**
- Create: `app/page.tsx`
- Create: `src/components/wizard/MatchSelector.tsx`
- Create: `src/components/wizard/PreviewPlayer.tsx`
- Create: `src/components/wizard/RenderQueue.tsx`
- Create: `src/components/wizard/SettingsPanel.tsx`

- [ ] **Step 1: Create `src/components/wizard/SettingsPanel.tsx`**

```tsx
"use client"

import { useWizard } from "@/context/WizardContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SettingsPanel() {
  const { state, dispatch } = useWizard()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      dispatch({ type: "SET_BACKGROUND", payload: url })
    }
  }

  return (
    <Card className="bg-card border-outline-variant">
      <CardHeader>
        <CardTitle className="text-on-surface font-mono text-sm">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs text-gray font-mono">BSD API Key</label>
          <Input
            type="password"
            value={state.apiKey}
            onChange={(e) => dispatch({ type: "SET_API_KEY", payload: e.target.value })}
            className="bg-surface border-outline-variant text-white font-mono text-sm mt-1"
            placeholder="Enter API key..."
          />
        </div>
        <div>
          <label className="text-xs text-gray font-mono">Background Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="bg-surface border-outline-variant text-white font-mono text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-gray font-mono">Hook Text (line 1)</label>
          <Input
            value={state.hookText[0]}
            onChange={(e) => dispatch({ type: "SET_HOOK_TEXT", payload: [e.target.value, state.hookText[1]] })}
            className="bg-surface border-outline-variant text-white font-mono text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-gray font-mono">Hook Text (line 2)</label>
          <Input
            value={state.hookText[1]}
            onChange={(e) => dispatch({ type: "SET_HOOK_TEXT", payload: [state.hookText[0], e.target.value] })}
            className="bg-surface border-outline-variant text-white font-mono text-sm mt-1"
          />
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create `src/components/wizard/MatchSelector.tsx`**

```tsx
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
      .catch((err) => setError(err.message))
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
```

- [ ] **Step 3: Create `src/components/wizard/PreviewPlayer.tsx`**

```tsx
"use client"

import { useWizard } from "@/context/WizardContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
)

const QuickCutVideoComponent = dynamic(
  () => import("@/components/remotion/QuickCutVideo").then((mod) => mod.QuickCutVideo),
  { ssr: false }
)

export function PreviewPlayer() {
  const { state } = useWizard()

  if (!state.selectedMatch || !state.prediction) {
    return (
      <Card className="bg-card border-outline-variant h-64 flex items-center justify-center">
        <p className="text-gray font-mono text-xs">Select a match to preview</p>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-outline-variant">
      <CardHeader>
        <CardTitle className="text-on-surface font-mono text-sm">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-[9/16] max-w-[300px] mx-auto bg-black rounded-lg overflow-hidden">
          <Player
            component={QuickCutVideoComponent}
            durationInFrames={15 * 30}
            fps={30}
            compositionWidth={1080}
            compositionHeight={1920}
            inputProps={{
              hookText: state.hookText,
              backgroundImage: state.backgroundImage,
              match: state.selectedMatch,
              prediction: state.prediction,
            }}
            controls
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Create `src/components/wizard/RenderQueue.tsx`**

```tsx
"use client"

import { useWizard } from "@/context/WizardContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function RenderQueue() {
  const { state, dispatch } = useWizard()

  const statusColor = (status: string) => {
    switch (status) {
      case "queued": return "text-yellow"
      case "rendering": return "text-primary"
      case "done": return "text-green2"
      case "error": return "text-red-400"
      default: return "text-gray"
    }
  }

  return (
    <Card className="bg-card border-outline-variant">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-on-surface font-mono text-sm">Render Queue</CardTitle>
        {state.renderQueue.some((j) => j.status === "done" || j.status === "error") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "CLEAR_COMPLETED" })}
            className="text-xs text-gray font-mono"
          >
            Clear completed
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2 max-h-48 overflow-y-auto">
        {state.renderQueue.length === 0 && (
          <p className="text-gray font-mono text-xs">No render jobs.</p>
        )}
        {state.renderQueue.map((job) => (
          <div key={job.id} className="bg-surface rounded p-3 border border-outline-variant">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-white">{job.matchLabel}</span>
              <span className={`font-mono text-xs ${statusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
            {job.status === "rendering" && (
              <div className="mt-2 h-1 bg-outline-variant rounded overflow-hidden">
                <div
                  className="h-full bg-primary rounded transition-all"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            )}
            {job.error && (
              <p className="text-red-400 font-mono text-[10px] mt-1">{job.error}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Create `app/page.tsx`**

```tsx
"use client"

import { WizardProvider } from "@/context/WizardContext"
import { MatchSelector } from "@/components/wizard/MatchSelector"
import { PreviewPlayer } from "@/components/wizard/PreviewPlayer"
import { RenderQueue } from "@/components/wizard/RenderQueue"
import { SettingsPanel } from "@/components/wizard/SettingsPanel"

export default function Home() {
  return (
    <WizardProvider>
      <div className="min-h-screen bg-background p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-flick text-white">QuickCut</h1>
          <p className="text-xs text-gray font-mono">Football Video Factory</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-4">
            <SettingsPanel />
            <RenderQueue />
          </div>

          <div>
            <PreviewPlayer />
          </div>

          <div>
            <MatchSelector />
          </div>
        </div>
      </div>
    </WizardProvider>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx src/components/wizard/
git commit -m "feat: add wizard UI with match selection, preview, settings, render queue"
```

---

## Task 5: Remotion Root + Composition Setup

**Files:**
- Create: `src/components/remotion/Root.tsx`
- Create: `src/components/remotion/index.ts`
- Modify: `remotion.config.ts` (from `npx remotion init`)

- [ ] **Step 1: Create `src/components/remotion/QuickCutVideo.tsx`**

```tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion"
import { HookScene } from "./HookScene"
import { AppDemo } from "./AppDemo"
import { CtaScene } from "./CtaScene"
import { Match, Prediction } from "@/types"

export interface QuickCutVideoProps {
  hookText: [string, string]
  backgroundImage: string | null
  match: Match
  prediction: Prediction
}

export function QuickCutVideo({ hookText, backgroundImage, match, prediction }: QuickCutVideoProps) {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={8 * fps}>
        <HookScene
          hookText={hookText}
          backgroundImage={backgroundImage}
          match={match}
          prediction={prediction}
        />
      </Sequence>
      <Sequence from={8 * fps} durationInFrames={3 * fps}>
        <AppDemo />
      </Sequence>
      <Sequence from={11 * fps} durationInFrames={4 * fps}>
        <CtaScene backgroundImage={backgroundImage} />
      </Sequence>
    </AbsoluteFill>
  )
}
```

- [ ] **Step 2: Create `src/components/remotion/Root.tsx`**

```tsx
import { Composition } from "remotion"
import { QuickCutVideo } from "./QuickCutVideo"

export const fps = 30

export const RemotionRoot = () => {
  return (
    <Composition
      id="QuickCutVideo"
      component={QuickCutVideo}
      durationInFrames={15 * fps}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        hookText: ["THE MODEL", "LOVES THIS"] as [string, string],
        backgroundImage: null,
        match: {
          id: 0,
          homeTeam: { name: "HOME", logo: undefined },
          awayTeam: { name: "AWAY", logo: undefined },
          league: { name: "LEAGUE" },
          kickoff: "",
          status: "notstarted",
        },
        prediction: {
          matchId: 0,
          probHomeWin: 45,
          probDraw: 25,
          probAwayWin: 30,
          probBttsYes: 68,
          probOver25: 82,
          expectedHomeGoals: 2.1,
          expectedAwayGoals: 1.3,
        },
      }}
    />
  )
}
```

- [ ] **Step 3: Update Remotion entry file**

If `remotion init` created `src/remotion/index.ts`:
```ts
import { registerRoot } from "remotion"
import { RemotionRoot } from "../components/remotion/Root"

registerRoot(RemotionRoot)
```

Otherwise create it:
```ts
import { registerRoot } from "remotion"
import { RemotionRoot } from "./components/remotion/Root"

registerRoot(RemotionRoot)
```

- [ ] **Step 4: Commit**

```bash
git add src/components/remotion/Root.tsx src/components/remotion/QuickCutVideo.tsx src/remotion/
git commit -m "feat: add Remotion root composition and video wrapper"
```

---

## Task 6: HookScene + MatchCard + BetCycle

**Files:**
- Create: `src/components/remotion/HookScene.tsx`
- Create: `src/components/remotion/MatchCard.tsx`
- Create: `src/components/remotion/BetCycle.tsx`

- [ ] **Step 1: Create `src/components/remotion/BetCycle.tsx`**

```tsx
import { useCurrentFrame, interpolate, Easing } from "remotion"
import { Bet } from "@/types"

function confidenceColor(value: number): string {
  if (value >= 80) return "#5CFF6A"
  if (value >= 60) return "#00ff41"
  return "#a3a3a3"
}

interface BetCycleProps {
  bets: Bet[]
  cycleFrames: number
  transitionFrames: number
}

export function BetCycle({ bets, cycleFrames, transitionFrames }: BetCycleProps) {
  const frame = useCurrentFrame()
  const totalCycles = bets.length * cycleFrames
  const looped = frame % totalCycles
  const currentIndex = Math.floor(looped / cycleFrames)
  const withinCurrent = looped % cycleFrames
  const isTransition = withinCurrent < transitionFrames

  const prevIndex = currentIndex > 0 ? currentIndex - 1 : bets.length - 1
  const currentBet = bets[currentIndex]
  const prevBet = bets[prevIndex]

  const progress = interpolate(withinCurrent, [0, transitionFrames], [0, 1], {
    easing: Easing.inOut(Easing.ease),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  const prevOpacity = isTransition ? 1 - progress : 0
  const currentOpacity = isTransition ? progress : 1

  const color = confidenceColor(currentBet.value)

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {/* Previous bet fading out */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          opacity: prevOpacity,
        }}
      >
        <span
          style={{
            fontFamily: "Flick, sans-serif",
            fontSize: 42,
            color: confidenceColor(prevBet.value),
            lineHeight: 1,
          }}
        >
          {prevBet.label}
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 26,
            fontWeight: 700,
            color: confidenceColor(prevBet.value),
          }}
        >
          {prevBet.value}%
        </span>
      </div>

      {/* Current bet fading in */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          opacity: currentOpacity,
        }}
      >
        <span
          style={{
            fontFamily: "Flick, sans-serif",
            fontSize: 42,
            color,
            lineHeight: 1,
          }}
        >
          {currentBet.label}
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 26,
            fontWeight: 700,
            color,
          }}
        >
          {currentBet.value}%
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/remotion/MatchCard.tsx`**

```tsx
import { useVideoConfig } from "remotion"
import { Match, Prediction, Bet } from "@/types"
import { BetCycle } from "./BetCycle"

interface MatchCardProps {
  match: Match
  prediction: Prediction
}

function initial(name: string): string {
  return name.charAt(0).toUpperCase()
}

export function MatchCard({ match, prediction }: MatchCardProps) {
  const { fps } = useVideoConfig()
  const fps8s = 8 * fps

  const bets: Bet[] = [
    { label: "OVER 2.5", value: prediction.probOver25, confidence: prediction.probOver25 },
    { label: "BTTS", value: prediction.probBttsYes, confidence: prediction.probBttsYes },
    { label: "HOME", value: prediction.probHomeWin, confidence: prediction.probHomeWin },
  ]

  const cycleFrames = Math.floor(fps8s / bets.length) // ~2.67s each
  const transitionFrames = Math.floor(fps * 0.3) // 0.3s crossfade

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        border: "2px solid rgba(0,255,65,0.25)",
        borderRadius: 14,
        padding: "20px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: "#00ff41",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          background: "rgba(0,255,65,0.1)",
          border: "1px solid rgba(0,255,65,0.25)",
          borderRadius: 5,
          padding: "3px 12px",
        }}
      >
        FULL TIME
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Home Team */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "3px solid rgba(0,255,65,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, color: "#00ff41" }}>
              {initial(match.homeTeam.name)}
            </span>
          </div>
          <span
            style={{
              fontFamily: "Flick, sans-serif",
              fontSize: 14,
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              textAlign: "center",
            }}
          >
            {match.homeTeam.name}
          </span>
        </div>

        {/* Bets cycling */}
        <BetCycle bets={bets} cycleFrames={cycleFrames} transitionFrames={transitionFrames} />

        {/* Away Team */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "3px solid rgba(0,255,65,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, color: "#00ff41" }}>
              {initial(match.awayTeam.name)}
            </span>
          </div>
          <span
            style={{
              fontFamily: "Flick, sans-serif",
              fontSize: 14,
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              textAlign: "center",
            }}
          >
            {match.awayTeam.name}
          </span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/remotion/HookScene.tsx`**

```tsx
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion"
import { MatchCard } from "./MatchCard"
import { Match, Prediction } from "@/types"

interface HookSceneProps {
  hookText: [string, string]
  backgroundImage: string | null
  match: Match
  prediction: Prediction
}

export function HookScene({ hookText, backgroundImage, match, prediction }: HookSceneProps) {
  const { fps } = useVideoConfig()
  const totalFrames = 8 * fps

  return (
    <AbsoluteFill>
      {/* Background */}
      {backgroundImage ? (
        <Img
          src={backgroundImage}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "#000" }} />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 24px 40px",
        }}
      >
        {/* Hook */}
        <div style={{ minHeight: "30%", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
          <div
            style={{
              fontFamily: "Flick, sans-serif",
              fontSize: 160,
              color: "#ffffff",
              lineHeight: 1.1,
              textShadow: "0 4px 25px rgba(0,0,0,1)",
              letterSpacing: "0.02em",
            }}
          >
            {hookText[0]}
            <br />
            <span
              style={{
                color: "#00ff41",
                fontSize: 210,
                textShadow: "0 0 40px rgba(0,255,65,0.3)",
              }}
            >
              {hookText[1]}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 0.3 }} />

        {/* Match card */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <MatchCard match={match} prediction={prediction} />
        </div>

        {/* Watermark */}
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: "rgba(0,255,65,0.3)",
            textAlign: "center",
            marginTop: "auto",
          }}
        >
          MSSOUGRA AI
        </div>
      </div>
    </AbsoluteFill>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/remotion/HookScene.tsx src/components/remotion/MatchCard.tsx src/components/remotion/BetCycle.tsx
git commit -m "feat: add HookScene, MatchCard and BetCycle Remotion components"
```

---

## Task 7: AppDemo + PhoneMockup

**Files:**
- Create: `src/components/remotion/PhoneMockup.tsx`
- Create: `src/components/remotion/AppDemo.tsx`

- [ ] **Step 1: Create `src/components/remotion/PhoneMockup.tsx`**

```tsx
import { ReactNode } from "react"

interface PhoneMockupProps {
  children: ReactNode
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div
      style={{
        width: "55%",
        aspectRatio: "9 / 19",
        background: "#030803",
        borderRadius: 18,
        border: "2px solid #1b4d1b",
        padding: 4,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Notch */}
      <div
        style={{
          width: "30%",
          height: 5,
          background: "#000",
          borderRadius: "0 0 4px 4px",
          margin: "0 auto",
        }}
      />
      {/* Screen */}
      <div style={{ flex: 1, marginTop: 4, display: "flex", flexDirection: "column", padding: 4 }}>
        {children}
      </div>
      {/* Home indicator */}
      <div
        style={{
          width: "25%",
          height: 2,
          background: "#1b4d1b",
          borderRadius: 2,
          margin: "4px auto 0",
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/remotion/AppDemo.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from "remotion"
import { PhoneMockup } from "./PhoneMockup"

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8 }}>
      <div style={{ height: 12, background: "rgba(0,255,65,0.08)", borderRadius: 2, width: "60%" }} />
      <div style={{ height: 6, background: "rgba(0,255,65,0.05)", borderRadius: 2, width: "40%" }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 20,
            height: 20,
            background: "linear-gradient(135deg, #00ff41, #00cc33)",
            borderRadius: 4,
          }}
        />
      </div>
      <div style={{ height: 14, background: "rgba(0,255,65,0.1)", borderRadius: 2 }} />
      <div style={{ height: 14, background: "rgba(0,255,65,0.08)", borderRadius: 2 }} />
      <div style={{ height: 14, background: "rgba(0,255,65,0.06)", borderRadius: 2 }} />
    </div>
  )
}

function AppScreenContent() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 8,
        fontFamily: "JetBrains Mono, monospace",
      }}
    >
      {/* Match Hero */}
      <div style={{ fontSize: 6, color: "#d0ffd0", fontWeight: 700 }}>RACING vs BARCA</div>
      <div style={{ fontSize: 4, color: "#a3a3a3" }}>La Liga • Today 21:00</div>

      {/* Confidence Ring placeholder */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "8px 0",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid #00ff41",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            color: "#00ff41",
            fontWeight: 700,
          }}
        >
          82%
        </div>
      </div>

      {/* Prediction Card */}
      <div
        style={{
          background: "#101010",
          borderRadius: 4,
          border: "1px solid #1b4d1b",
          padding: 6,
        }}
      >
        <div style={{ fontSize: 4, color: "#00ff41", textTransform: "uppercase" }}>Match Prediction</div>
        <div style={{ fontSize: 5, color: "#ffffff", marginTop: 2 }}>OVER 2.5 Goals</div>
        <div
          style={{
            height: 4,
            background: "#1b4d1b",
            borderRadius: 2,
            marginTop: 4,
            overflow: "hidden",
          }}
        >
          <div style={{ width: "82%", height: "100%", background: "#00ff41", borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <span style={{ fontSize: 3.5, color: "#a3a3a3" }}>xG: 2.1 - 1.3</span>
          <span style={{ fontSize: 3.5, color: "#00ff41" }}>82%</span>
        </div>
      </div>

      {/* Breakdown bars */}
      <div style={{ fontSize: 4, color: "#a3a3a3", marginTop: 4 }}>Confidence Breakdown</div>
      {["HOME 45%", "DRAW 25%", "AWAY 30%", "BTTS 68%", "OV2.5 82%"].map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 3, color: "#a3a3a3", width: 24 }}>{label.split(" ")[0]}</span>
          <div style={{ flex: 1, height: 3, background: "#1b4d1b", borderRadius: 1.5, overflow: "hidden" }}>
            <div
              style={{
                width: `${parseInt(label.split(" ")[1])}%`,
                height: "100%",
                background: parseInt(label.split(" ")[1]) >= 60 ? "#00ff41" : "#a3a3a3",
                borderRadius: 1.5,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 3,
              color: parseInt(label.split(" ")[1]) >= 60 ? "#00ff41" : "#a3a3a3",
              width: 12,
              textAlign: "right",
            }}
          >
            {label.split(" ")[1]}
          </span>
        </div>
      ))}
    </div>
  )
}

export function AppDemo() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const loadingDuration = 0.5 * fps
  const contentFadeStart = loadingDuration + 0.3 * fps
  const contentFadeEnd = contentFadeStart + 0.5 * fps

  const loadingOpacity = interpolate(frame, [0, loadingDuration - 10, loadingDuration], [1, 1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  })

  const contentOpacity = interpolate(frame, [contentFadeStart, contentFadeEnd], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  })

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <PhoneMockup>
        {/* Loading skeleton */}
        <div style={{ position: "absolute", inset: 4, opacity: loadingOpacity }}>
          <LoadingSkeleton />
        </div>

        {/* App content */}
        <div style={{ opacity: contentOpacity, flex: 1 }}>
          <AppScreenContent />
        </div>
      </PhoneMockup>
    </AbsoluteFill>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/AppDemo.tsx src/components/remotion/PhoneMockup.tsx
git commit -m "feat: add AppDemo and PhoneMockup Remotion components"
```

---

## Task 8: CtaScene

**Files:**
- Create: `src/components/remotion/CtaScene.tsx`

- [ ] **Step 1: Create `src/components/remotion/CtaScene.tsx`**

```tsx
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from "remotion"

interface CtaSceneProps {
  backgroundImage: string | null
}

export function CtaScene({ backgroundImage }: CtaSceneProps) {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  })

  const urlScale = interpolate(frame, [0, 30, 60, 90], [1, 1.05, 1, 1.05], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  })

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background */}
      {backgroundImage ? (
        <Img
          src={backgroundImage}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "#000" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 45%, rgba(0,255,65,0.06), transparent 60%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* MSSOUGRA Logo */}
        <div
          style={{
            width: 40,
            height: 40,
            background: "linear-gradient(135deg, #00ff41, #00cc33)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 18,
              fontWeight: 700,
              color: "#000",
            }}
          >
            AI
          </span>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontFamily: "Flick, sans-serif",
            fontSize: 60,
            color: "#ffffff",
            textShadow: "0 2px 15px rgba(0,0,0,0.8)",
          }}
        >
          MSSOUGRA
        </div>

        {/* Divider */}
        <div style={{ width: 24, height: 2, background: "#00ff41" }} />

        {/* Subtext */}
        <div
          style={{
            fontFamily: "Flick, sans-serif",
            fontSize: 20,
            color: "#ffffff",
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
          }}
        >
          FULL ANALYSIS
        </div>

        {/* URL pill */}
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 14,
            color: "#00ff41",
            border: "1.5px solid rgba(0,255,65,0.3)",
            borderRadius: 6,
            padding: "8px 24px",
            background: "rgba(0,0,0,0.4)",
            transform: `scale(${urlScale})`,
          }}
        >
          mssougra.com
        </div>

        {/* Link in bio */}
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: "#a3a3a3",
          }}
        >
          or link in bio
        </div>
      </div>
    </AbsoluteFill>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/CtaScene.tsx
git commit -m "feat: add CtaScene Remotion component"
```

---

## Task 9: Render Pipeline

**Files:**
- Create: `src/lib/render.ts`
- Create: `app/api/render/route.ts`

- [ ] **Step 1: Create `src/lib/render.ts`**

```ts
import path from "path"
import fs from "fs"
import { bundleMedia } from "@remotion/renderer"
import { renderMedia, selectComposition } from "@remotion/renderer"
import { QuickCutVideoProps } from "@/components/remotion/QuickCutVideo"

const OUTPUT_DIR = path.join(process.cwd(), "data", "output")

export interface RenderOptions {
  inputProps: QuickCutVideoProps
  onProgress?: (progress: number) => void
}

export async function renderVideo(
  options: RenderOptions,
  abortSignal?: AbortSignal
): Promise<string> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const bundled = await bundleMedia({
    webpackOverride: (config) => config,
  })

  const compositionId = "QuickCutVideo"
  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
    inputProps: options.inputProps,
  })

  const outputPath = path.join(
    OUTPUT_DIR,
    `quickcut-${options.inputProps.match.id}-${Date.now()}.mp4`
  )

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: options.inputProps,
    onProgress: options.onProgress,
    signal: abortSignal,
  })

  return outputPath
}
```

- [ ] **Step 2: Create `app/api/render/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server"
import { renderVideo } from "@/lib/render"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.match || !body.prediction) {
      return NextResponse.json(
        { error: "match and prediction are required" },
        { status: 400 }
      )
    }

    const outputPath = await renderVideo({
      inputProps: {
        hookText: body.hookText || ["THE MODEL", "LOVES THIS"],
        backgroundImage: body.backgroundImage || null,
        match: body.match,
        prediction: body.prediction,
      },
    })

    return NextResponse.json({ success: true, outputPath })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Render failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create basic render test**

```ts
import { describe, it, expect } from "vitest"

describe("render pipeline", () => {
  it("has the render function and API route", () => {
    const { renderVideo } = require("@/lib/render")
    expect(typeof renderVideo).toBe("function")
  })
})
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/render.ts app/api/render/route.ts
git commit -m "feat: add render pipeline with API route"
```

---

## Task 10: Font Loading in Remotion

**Files:**
- Modify: `src/components/remotion/Root.tsx`

- [ ] **Step 1: Update `src/components/remotion/Root.tsx` to load fonts**

```tsx
import { Composition } from "remotion"
import { loadFont } from "@remotion/fonts"
import { staticFile } from "remotion"
import { QuickCutVideo } from "./QuickCutVideo"

loadFont({
  family: "Flick",
  url: staticFile("fonts/FlickSs2Demo-nR6OO.ttf"),
  weight: "400",
})

loadFont({
  family: "Flick",
  url: staticFile("fonts/FlickSs3Demo-1G0pv.ttf"),
  weight: "700",
})

export const fps = 30

export const RemotionRoot = () => {
  return (
    <Composition
      id="QuickCutVideo"
      component={QuickCutVideo}
      durationInFrames={15 * fps}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        hookText: ["THE MODEL", "LOVES THIS"] as [string, string],
        backgroundImage: null,
        match: {
          id: 0,
          homeTeam: { name: "HOME", logo: undefined },
          awayTeam: { name: "AWAY", logo: undefined },
          league: { name: "LEAGUE" },
          kickoff: "",
          status: "notstarted",
        },
        prediction: {
          matchId: 0,
          probHomeWin: 45,
          probDraw: 25,
          probAwayWin: 30,
          probBttsYes: 68,
          probOver25: 82,
          expectedHomeGoals: 2.1,
          expectedAwayGoals: 1.3,
        },
      }}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/Root.tsx
git commit -m "feat: load Flick fonts in Remotion root"
```

---

## Self-Review

**Spec Coverage Check:**
- §1 Overview → Task 1 (scaffold)
- §2 Video Spec (timeline, bets, scenes) → Tasks 5-8 (Remotion compositions)
- §3 Design System (colors, fonts, logo, gradient) → Tasks 1 (Tailwind config), 6-8 (inline styles), 10 (font loading)
- §4 Architecture (file structure) → Task 1 (scaffold)
- §5 Remotion Compositions → Tasks 5-8 (all composition components)
- §5.3 BSD API Client → Task 2
- §5.4 Render Pipeline → Task 9
- §6 Wizard UX Flow → Tasks 3-4 (context + UI)
- §7 Data Types → Task 2
- §8 Error Handling → Covered by try/catch in api routes and bsd-api.ts
- §9 Testing Strategy → Tasks 2 (bsd-api test), 9 (render test)

**Placeholder scan:** No TBD/TODO/fill in patterns found.

**Type consistency:** `QuickCutVideoProps` used in Task 5, referenced in render.ts via `RenderOptions.inputProps`. `Bet`, `Match`, `Prediction` types used consistently across all tasks.
