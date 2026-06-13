import { NextResponse } from "next/server"
import { getPredictions } from "@/lib/bsd-api"

export async function GET() {
  try {
    const predictions = await getPredictions()
    return NextResponse.json(predictions)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch predictions"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
