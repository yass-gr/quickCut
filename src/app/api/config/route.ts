import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const CONFIG_PATH = path.join(process.cwd(), "data", "config.json")

export async function GET() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"))
    return NextResponse.json(config)
  } catch { return NextResponse.json({}) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = fs.existsSync(CONFIG_PATH) ? JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")) : {}
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ ...existing, ...body }, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
