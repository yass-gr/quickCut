import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const CONFIG_PATH = path.join(process.cwd(), "data", "config.json")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.bsd_api_key || typeof body.bsd_api_key !== "string") {
      return NextResponse.json({ error: "bsd_api_key is required" }, { status: 400 })
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"))
    config.bsd_api_key = body.bsd_api_key
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update config"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
