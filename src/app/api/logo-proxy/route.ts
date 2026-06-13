import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import crypto from "crypto"

const CACHE_DIR = path.join(process.cwd(), "data", "cache", "logos")

function cacheKey(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 32)
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url) return new NextResponse("Missing url", { status: 400 })

  const key = cacheKey(url)
  const cacheFile = path.join(CACHE_DIR, `${key}.bin`)

  // Serve from cache
  if (fs.existsSync(cacheFile)) {
    const data = fs.readFileSync(cacheFile)
    return new NextResponse(data, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }

  // Fetch and cache
  try {
    const res = await fetch(url)
    if (!res.ok) return new NextResponse("Not found", { status: 404 })
    const buffer = Buffer.from(await res.arrayBuffer())

    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(cacheFile, buffer)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch {
    return new NextResponse("Failed", { status: 500 })
  }
}
