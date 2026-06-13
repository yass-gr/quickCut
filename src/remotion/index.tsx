import { Composition } from "remotion"
import { QuickCutVideo } from "../components/remotion/QuickCutVideo"

export const RemotionRoot = () => {
  return (
    <Composition
      id="QuickCutVideo"
      component={QuickCutVideo as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audioUrl: null }}
    />
  )
}
