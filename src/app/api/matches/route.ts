import { NextRequest, NextResponse } from "next/server"
import { getUpcomingMatches, setApiKey } from "@/lib/bsd-api"
import fs from "fs"
import path from "path"

const CACHE_DIR = path.join(process.cwd(), "data", "cache", "logos")
const SPORTSDB = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php"

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

async function fetchLogo(name: string): Promise<string | null> {
  const key = slug(name)
  const cacheFile = path.join(CACHE_DIR, `${key}.json`)

  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, "utf-8"))
    return cached.url
  }

  try {
    const res = await fetch(`${SPORTSDB}&t=${encodeURIComponent(name)}`)
    const data = await res.json()
    const teams = data?.teams as Record<string, unknown>[] | undefined
    const url = (teams?.[0]?.strBadge as string) || null

    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(cacheFile, JSON.stringify({ url }))

    return url
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const headerKey = request.headers.get("x-api-key")
    if (headerKey) {
      setApiKey(headerKey)
    } else {
      const configPath = path.join(process.cwd(), "data", "config.json")
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
        if (config.bsd_api_key) setApiKey(config.bsd_api_key)
      }
    }
    const { matches, tips } = await getUpcomingMatches()

    // Fetch logos for all unique team names
    const teamNames = new Set<string>()
    for (const m of matches) {
      teamNames.add(m.match_home)
      teamNames.add(m.match_away)
    }
    const logoResults = await Promise.all(
      Array.from(teamNames).map(async (name) => [name, await fetchLogo(name)] as const),
    )
    const logoMap = Object.fromEntries(logoResults)

    for (const m of matches) {
      m.home_logo = logoMap[m.match_home] || undefined
      m.away_logo = logoMap[m.match_away] || undefined
    }

    return NextResponse.json({ matches, tips })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
