import { NextRequest, NextResponse } from "next/server"
import { renderVideo } from "@/lib/render"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.match || !body.prediction) {
      return NextResponse.json({ error: "match and prediction required" }, { status: 400 })
    }
    const inputProps = {
      ...body,
      audioUrl: body.audioFile ? `/api/audio/${body.audioFile}` : null,
    }
    const outputPath = await renderVideo({ inputProps })
    return NextResponse.json({ success: true, outputPath })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Render failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
