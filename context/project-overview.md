# QuickCut — Project Context

## Overview
QuickCut is a local Next.js + Remotion app that generates 15-second football prediction videos for TikTok/Reels. Single-user, no cloud.

## Tech Stack
- **Framework**: Next.js 16.2.9 (App Router)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Video**: Remotion 4.0.476 (`@remotion/renderer`, `@remotion/player`)
- **Data Source**: BSD API (`https://sports.bzzoiro.com/api`)
- **Fonts**: Flick (display), JetBrains Mono (data) — loaded via @remotion/fonts
- **Audio**: User-uploaded MP3 files, trimmed via UI
- **State**: React Context + localStorage persistence
- **Config**: JSON files on disk (`data/`)

## Video Spec
- 1080×1920, 30fps, 15 seconds, MP4 H.264
- Background: user-selected image with gradient overlay
- 3 scenes: Hook+Card (0-8s) → App Demo (8-11s) → CTA (11-15s)

## Directory Structure
```
quickCut/
├── context/           # Context docs for AI agents
├── data/              # JSON config, templates, audio, output
│   ├── config.json    # BSD API key, defaults
│   ├── templates/     # Video template presets
│   ├── audio/         # User-uploaded MP3s
│   └── output/        # Rendered videos
├── public/
│   └── fonts/         # Flick font files
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx   # Wizard entry
│   │   ├── globals.css
│   │   └── api/       # API routes
│   ├── components/
│   │   ├── wizard/    # Wizard step components
│   │   └── remotion/  # Video composition components
│   ├── context/       # React contexts
│   ├── lib/           # Utilities, API client, renderer
│   └── types.ts
├── package.json
├── next.config.js
├── tsconfig.json
└── postcss.config.mjs
```

## Wizard Flow
```
Step 1: Select Match  →  Step 2: Background  →  Step 3: Template  →  Step 4: Audio  →  Step 5: Preview  →  Step 6: Download
```

Each step is a page-like view (not a vertical scroll). User navigates forward/back.

## Design System (MSSOUGRA)
- Colors: background #030803, primary #00ff41, card #101010, gray #a3a3a3, outline #1b4d1b
- Fonts: Flick (headings), JetBrains Mono (UI/data)
- Confidence colors: ≥80% #5CFF6A, 60-79% #00ff41, <60% #a3a3a3

## BSD API
- Base: `https://sports.bzzoiro.com/api`
- Auth: `Authorization: Token {key}`
- Endpoints:
  - `GET /events/?status=notstarted&limit=200` — upcoming matches
  - `GET /events/{id}/` — match detail
  - `GET /predictions/?upcoming=true&limit=300` — predictions

## Key Files Created By
- Initial scaffold: AI (2026-06-13)
- Current rebuild: AI (2026-06-13)
