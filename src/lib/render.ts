import path from "path"
import fs from "fs"
import { renderMedia, selectComposition } from "@remotion/renderer"
import { bundle } from "@remotion/bundler"

const OUTPUT_DIR = path.join(process.cwd(), "data", "output")

export interface RenderOptions {
  inputProps: Record<string, unknown>
  onProgress?: (progress: number) => void
}

export async function renderVideo(options: RenderOptions): Promise<string> {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const bundled = await bundle({
    entryPoint: path.join(process.cwd(), "src", "remotion", "index.tsx"),
  })

  const composition = await selectComposition({
    serveUrl: bundled,
    id: "QuickCutVideo",
    inputProps: options.inputProps,
  })

  const outputPath = path.join(OUTPUT_DIR, `quickcut-${Date.now()}.mp4`)

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: options.inputProps,
    onProgress: options.onProgress
      ? ({ progress }) => options.onProgress!(Math.round(progress * 100))
      : undefined,
  })

  return outputPath
}
