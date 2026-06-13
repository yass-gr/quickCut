import { NextRequest, NextResponse } from "next/server"
import { execSync } from "child_process"
import path from "path"
import fs from "fs"

const AUDIO_DIR = path.join(process.cwd(), "data", "audio")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, start, end } = body
    if (!filename || start === undefined || end === undefined) {
      return NextResponse.json({ error: "filename, start, end required" }, { status: 400 })
    }

    const inputPath = path.join(AUDIO_DIR, filename)
    if (!fs.existsSync(inputPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const segLen = end - start
    if (segLen <= 0) {
      return NextResponse.json({ error: "end must be > start" }, { status: 400 })
    }

    const safeName = filename.replace(/\.mp3$/i, "")
    const outName = `${safeName}_preview_${Date.now()}.mp3`
    const outPath = path.join(AUDIO_DIR, outName)

    execSync(
      `ffmpeg -y -ss ${start} -t ${segLen} -i "${inputPath}" -c copy "${outPath}"`,
      { stdio: "ignore" },
    )

    if (segLen < 15) {
      const loopCount = Math.ceil(15 / segLen)
      const loopedName = outName.replace(/\.mp3$/, "_looped.mp3")
      const loopedPath = path.join(AUDIO_DIR, loopedName)
      execSync(
        `ffmpeg -y -stream_loop ${loopCount - 1} -i "${outPath}" -c copy -t 15 "${loopedPath}"`,
        { stdio: "ignore" },
      )
      fs.unlinkSync(outPath)
      return NextResponse.json({ url: `/api/audio/${loopedName}`, filename: loopedName })
    }

    return NextResponse.json({ url: `/api/audio/${outName}`, filename: outName })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Trim failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
