import { NextRequest, NextResponse } from "next/server"
import { getUpcomingMatches, setApiKey } from "@/lib/bsd-api"
import fs from "fs"
import path from "path"

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
    return NextResponse.json({ matches, tips })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
