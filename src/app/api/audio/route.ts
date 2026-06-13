import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const AUDIO_DIR = path.join(process.cwd(), "data", "audio")

export async function GET() {
  if (!fs.existsSync(AUDIO_DIR)) return NextResponse.json([])
  const files = fs.readdirSync(AUDIO_DIR).filter((f) => f.endsWith(".mp3") && !f.includes("_trimmed_") && !f.includes("_looped_"))
  const tracks = files.map((f) => ({
    filename: f,
    name: f.replace(".mp3", "").replace(/-/g, " ").replace(/_/g, " "),
  }))
  return NextResponse.json(tracks)
}

export async function POST(request: NextRequest) {
  try {
    if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true })
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(path.join(AUDIO_DIR, file.name), buffer)
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
