import { NextRequest, NextResponse } from "next/server"
import fs from "fs"

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get("path")
  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="quickcut.mp4"`,
    },
  })
}
