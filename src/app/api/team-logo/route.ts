import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"

const CACHE_DIR = path.join(process.cwd(), "data", "cache", "logos")
const SPORTSDB = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php"

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")
  if (!name) return NextResponse.json({ url: null })

  const key = slug(name)
  const cacheFile = path.join(CACHE_DIR, `${key}.json`)

  // Check local cache
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, "utf-8"))
    return NextResponse.json(cached)
  }

  try {
    const res = await fetch(`${SPORTSDB}&t=${encodeURIComponent(name)}`)
    const data = await res.json()
    const teams = data?.teams as Record<string, unknown>[] | undefined
    const badgeUrl = teams?.[0]?.strBadge as string | undefined

    const result = { url: badgeUrl || null }

    // Cache to disk
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(cacheFile, JSON.stringify(result))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ url: null })
  }
}
