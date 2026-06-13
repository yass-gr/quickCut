import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import type { VideoTemplate } from "@/types"

export async function GET() {
  const templatesDir = path.join(process.cwd(), "data", "templates")
  if (!fs.existsSync(templatesDir)) return NextResponse.json([])
  
  const files = fs.readdirSync(templatesDir).filter((f) => f.endsWith(".json"))
  const templates: VideoTemplate[] = files.map((f) => JSON.parse(fs.readFileSync(path.join(templatesDir, f), "utf-8")))
  return NextResponse.json(templates)
}
