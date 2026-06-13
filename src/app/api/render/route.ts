import { NextRequest, NextResponse } from "next/server"
import { renderVideo } from "@/lib/render"
import { execSync } from "child_process"
import path from "path"
import fs from "fs"

const AUDIO_DIR = path.join(process.cwd(), "data", "audio")
const CACHE_DIR = path.join(process.cwd(), "data", "cache", "logos")

async function imageToDataUrl(url: string): Promise<string | null> {
  try {
    if (url.startsWith("/api/logo-proxy")) {
      // Read from our local cache
      const proxyUrl = new URL(url, "http://localhost").searchParams.get("url")
      if (!proxyUrl) return null
      const key = Buffer.from(proxyUrl).toString("base64url").slice(0, 64)
      const cacheFile = path.join(CACHE_DIR, `${key}.bin`)
      if (fs.existsSync(cacheFile)) {
        const buf = fs.readFileSync(cacheFile)
        return `data:image/png;base64,${buf.toString("base64")}`
      }
    }
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const mime = res.headers.get("content-type") || "image/png"
    return `data:${mime};base64,${buf.toString("base64")}`
  } catch {
    return null
  }
}

function trimAudio(
  filename: string,
  startSec: number,
  endSec: number,
): string {
  const inputPath = path.join(AUDIO_DIR, filename)
  if (!fs.existsSync(inputPath)) return filename

  const segLen = endSec - startSec
  if (segLen <= 0) return filename

  const safeName = filename.replace(/\.mp3$/i, "")
  const outName = `${safeName}_render_${Date.now()}.mp3`
  const outPath = path.join(AUDIO_DIR, outName)

  execSync(
    `ffmpeg -y -ss ${startSec} -t ${segLen} -i "${inputPath}" -c copy "${outPath}"`,
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
    return loopedName
  }

  return outName
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.match || !body.prediction) {
      return NextResponse.json({ error: "match and prediction required" }, { status: 400 })
    }

    let audioFile = body.audioFile as string | null

    if (audioFile) {
      const trimStart = body.audioTrimStart ?? 0
      const trimEnd = body.audioTrimEnd ?? 15
      audioFile = trimAudio(audioFile, trimStart, trimEnd)
    }

    // Inline logo images as data URLs so server-side Remotion can load them
    const match = body.match ? { ...body.match } : null
    if (match?.home_logo) match.home_logo = (await imageToDataUrl(match.home_logo)) || match.home_logo
    if (match?.away_logo) match.away_logo = (await imageToDataUrl(match.away_logo)) || match.away_logo

    const inputProps = {
      ...body,
      match,
      audioUrl: audioFile ? `/api/audio/${audioFile}` : null,
      audioVolume: body.audioVolume ?? 100,
    }

    const outputPath = await renderVideo({ inputProps })
    return NextResponse.json({ success: true, outputPath })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Render failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
