import path from "path"
import fs from "fs"
import { renderMedia, selectComposition, makeCancelSignal } from "@remotion/renderer"
import { bundle } from "@remotion/bundler"
import type { QuickCutVideoProps } from "@/components/remotion/QuickCutVideo"

const OUTPUT_DIR = path.join(process.cwd(), "data", "output")

export interface RenderOptions {
  inputProps: QuickCutVideoProps
  onProgress?: (progress: number) => void
}

export async function renderVideo(
  options: RenderOptions,
  abortSignal?: AbortSignal
): Promise<string> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const bundled = await bundle({
    entryPoint: path.join(process.cwd(), "src", "remotion", "index.ts"),
  })

  const compositionId = "QuickCutVideo"
  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
    inputProps: options.inputProps as unknown as Record<string, unknown>,
  })

  const outputPath = path.join(
    OUTPUT_DIR,
    `quickcut-${options.inputProps.match.id}-${Date.now()}.mp4`
  )

  const { cancelSignal, cancel } = makeCancelSignal()
  if (abortSignal) {
    abortSignal.addEventListener("abort", cancel)
  }

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: options.inputProps as unknown as Record<string, unknown>,
    onProgress: options.onProgress
      ? (p) => options.onProgress!(p.progress)
      : undefined,
    cancelSignal,
  })

  return outputPath
}
