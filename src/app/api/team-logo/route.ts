import { NextRequest, NextResponse } from "next/server"

const SPORTSDB = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php"

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")
  if (!name) return NextResponse.json({ url: null })

  // Retry up to 3 times with exponential backoff for rate limits
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${SPORTSDB}?t=${encodeURIComponent(name)}`, {
        headers: { "User-Agent": "QuickCut/1.0" },
      })

      if (res.status === 429) {
        // Rate limited — wait and retry
        await new Promise((r) => setTimeout(r, (attempt + 1) * 1000))
        continue
      }

      if (!res.ok) return NextResponse.json({ url: null })

      const data = await res.json()
      const teams = data?.teams as Record<string, unknown>[] | undefined
      const badgeUrl = (teams?.[0]?.strBadge as string) || null
      return NextResponse.json({ url: badgeUrl })
    } catch {
      return NextResponse.json({ url: null })
    }
  }

  return NextResponse.json({ url: null })
}
