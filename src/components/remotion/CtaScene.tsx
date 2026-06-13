import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  useVideoConfig,
  Img,
} from "remotion";
import { staticFile } from "remotion";
import { t } from "../../lib/translations";
import type { Language } from "../../lib/translations";

interface CtaSceneProps {
  hookText: [string, string];
  backgroundImage: string | null;
  backgroundPosition: string;
  language: Language;
}

export function CtaScene({
  hookText,
  backgroundImage,
  backgroundPosition,
  language,
}: CtaSceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, Math.round(fps * 0.3), Math.round(fps * 3), Math.round(fps * 4)],
    [0, 1, 1, 1],
    { extrapolateRight: "clamp" },
  );

  // Icon entrance
  const iconProgress = interpolate(frame, [0, Math.round(fps * 0.5)], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.2, 0.64, 1),
  });
  const iconScale = interpolate(iconProgress, [0, 1], [0.4, 1]);

  // Text entrance
  const textProgress = interpolate(
    frame,
    [Math.round(fps * 0.2), Math.round(fps * 0.6)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );
  const textY = interpolate(textProgress, [0, 1], [30, 0]);

  // Sub text
  const subProgress = interpolate(
    frame,
    [Math.round(fps * 0.4), Math.round(fps * 0.75)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  // Breathing glow
  const breathe = interpolate(
    frame % (fps * 3),
    [0, fps * 1.5, fps * 3],
    [0.15, 0.35, 0.15],
    { extrapolateRight: "clamp" },
  );

  // Background blur + fade in
  const bgProgress = interpolate(frame, [0, Math.round(fps * 0.6)], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const bgBlur = interpolate(bgProgress, [0, 1], [0, 20]);
  const bgOpacity = interpolate(bgProgress, [0, 1], [0, 0.7]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background image with blur + fade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: backgroundImage
            ? `url(${backgroundImage}) ${backgroundPosition}/cover`
            : "#000",
          filter: `blur(${bgBlur}px)`,
          WebkitFilter: `blur(${bgBlur}px)`,
          opacity: bgOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,255,65,0.05), transparent 60%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
        }}
      >
        {/* App Icon */}
        <div style={{ position: "relative", transform: `scale(${iconScale})` }}>
          <div
            style={{
              position: "absolute",
              inset: -24,
              borderRadius: 48,
              background: `radial-gradient(circle, rgba(0,255,65,${breathe}), transparent 70%)`,
            }}
          />
          <div
            style={{
              width: 240,
              height: 240,
              borderRadius: 52,
              overflow: "hidden",
              position: "relative",
              boxShadow:
                "0 0 100px rgba(0,255,65,0.3), 0 20px 80px rgba(0,0,0,0.6)",
            }}
          >
            <Img
              src={staticFile("icon.png")}
              style={{ width: 240, height: 240, objectFit: "cover" }}
            />
          </div>
        </div>

        {/* MSSOUGRA */}
        <div
          style={{
            fontFamily: "Flick, sans-serif",
            fontWeight: 700,
            fontSize: 96,
            color: "#00ff41",
            textShadow:
              "0 4px 30px rgba(0,0,0,0.9), 0 0 60px rgba(0,255,65,0.3)",
            letterSpacing: "0.04em",
            transform: `translateY(${textY}px)`,
            opacity: textProgress,
            lineHeight: 1,
          }}
        >
          {t(language, "MSSOUGRA AI")}
        </div>

        {/* CTA */}
        <div
          style={{
            fontFamily: "Flick, sans-serif",
            fontWeight: 700,
            fontSize: 56,
            color: "#ffffff",
            letterSpacing: "0.04em",
            opacity: textProgress,
            transform: `translateY(${textY}px)`,
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
            textAlign: "center",
          }}
        >
          {t(language, "")}
          <br />
          {t(language, "link in bio")}
        </div>

        {/* URL */}
        <div
          style={{
            fontFamily: "Flick, sans-serif",
            fontSize: 28,
            color: "#a3a3a3",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            opacity: subProgress,
          }}
        >
          {t(language, "or mssougra.vercel.app")}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          color: "rgba(0,255,65,0.15)",
          textAlign: "center",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {t(language, "MSSOUGRA AI")}
      </div>
    </AbsoluteFill>
  );
}
