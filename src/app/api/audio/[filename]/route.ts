import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const AUDIO_DIR = path.join(process.cwd(), "data", "audio")

export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params
  const safe = path.basename(filename)
  const filePath = path.join(AUDIO_DIR, safe)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=3600",
    },
  })
}
