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
