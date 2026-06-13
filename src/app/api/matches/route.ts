import { NextResponse } from "next/server"
import { getUpcomingMatches } from "@/lib/bsd-api"

export async function GET() {
  try {
    const matches = await getUpcomingMatches()
    return NextResponse.json(matches)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch matches"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
