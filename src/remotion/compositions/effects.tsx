import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_DISPLAY, FONT_MONO, INK, glow, rand } from "../theme";
import { num, str, type TemplateComponent } from "../props";

const base = (bg: string): React.CSSProperties => ({
  background: bg,
  fontFamily: FONT_DISPLAY,
  alignItems: "center",
  justifyContent: "center",
  padding: 64,
  overflow: "hidden",
});

/** Neon title reveal — inspired by reactvideoeditor/remotion-templates (MIT). */
export const NeonTitleReveal: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const accent = str(p, "accent", "#00D4FF");
  const s = spring({ frame, fps, config: { damping: 16 } });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={base(str(p, "background", INK))}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(60% 50% at 50% 50%, ${accent}22, transparent 70%)`,
        }}
      />
      <div style={{ textAlign: "center", opacity: out }}>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 24,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: accent,
            opacity: interpolate(s, [0, 1], [0, 0.9]),
          }}
        >
          {str(p, "eyebrow", "Xavier Generation OS")}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: num(p, "fontSize", 108),
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: -3,
            transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
            textShadow: glow(accent, 90),
          }}
        >
          {str(p, "title", "Cut Like Cinema")}
        </div>
        <div
          style={{
            marginTop: 22,
            height: 3,
            width: interpolate(s, [0, 1], [0, 420]),
            marginInline: "auto",
            background: accent,
            boxShadow: glow(accent, 40),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** RGB glitch slices. */
export const GlitchSlice: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const accent = str(p, "accent", "#FF006E");
  const title = str(p, "title", "GLITCH");
  const intensity = num(p, "intensity", 18);
  const slices = 7;

  return (
    <AbsoluteFill style={base(str(p, "background", "#050505"))}>
      <div style={{ position: "relative" }}>
        {Array.from({ length: slices }).map((_, i) => {
          const off = (rand(frame * 0.7 + i) - 0.5) * intensity;
          return (
            <div
              key={i}
              style={{
                position: i === 0 ? "relative" : "absolute",
                inset: i === 0 ? undefined : 0,
                clipPath: `inset(${(i / slices) * 100}% 0 ${100 - ((i + 1) / slices) * 100}% 0)`,
                transform: `translateX(${off}px)`,
                fontSize: num(p, "fontSize", 130),
                fontWeight: 900,
                letterSpacing: -4,
                color: "#FFFFFF",
                textShadow: `${off}px 0 ${accent}, ${-off}px 0 #00D4FF`,
              }}
            >
              {title}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Kinetic split text. */
export const KineticSplit: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#FFD700");
  const s = spring({ frame, fps, config: { damping: 18 } });
  const gap = interpolate(s, [0, 1], [220, 26]);

  return (
    <AbsoluteFill style={{ ...base(str(p, "background", INK)), flexDirection: "row", gap }}>
      <span style={{ fontSize: num(p, "fontSize", 104), fontWeight: 900, color: "#FFFFFF" }}>
        {str(p, "left", "MAKE")}
      </span>
      <span
        style={{
          fontSize: num(p, "fontSize", 104),
          fontWeight: 900,
          color: accent,
          textShadow: glow(accent, 70),
        }}
      >
        {str(p, "right", "MOTION")}
      </span>
    </AbsoluteFill>
  );
};

/** Lower third with light sweep. */
export const LightSweepLowerThird: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#00D4FF");
  const s = spring({ frame, fps, config: { damping: 20 } });
  const sweep = interpolate(frame % 90, [0, 90], [-120, 220]);

  return (
    <AbsoluteFill
      style={{
        ...base(str(p, "background", INK)),
        alignItems: "flex-start",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderLeft: `4px solid ${accent}`,
          background: "rgba(255,255,255,0.05)",
          padding: "22px 40px",
          borderRadius: "0 14px 14px 0",
          transform: `translateX(${interpolate(s, [0, 1], [-420, 0])}px)`,
        }}
      >
        <div style={{ fontSize: num(p, "fontSize", 54), fontWeight: 800, color: "#FFFFFF" }}>
          {str(p, "name", "Xavier Reyes")}
        </div>
        <div style={{ marginTop: 6, fontFamily: FONT_MONO, fontSize: 22, color: accent }}>
          {str(p, "role", "Director of Photography")}
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${sweep}%`,
            width: 90,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            transform: "skewX(-18deg)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Grid zoom intro. */
export const GridZoomIntro: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#00D4FF");
  const s = spring({ frame, fps, config: { damping: 200 } });
  const scale = interpolate(s, [0, 1], [1.6, 1]);

  return (
    <AbsoluteFill style={base(str(p, "background", "#040406"))}>
      <div
        style={{
          position: "absolute",
          inset: -200,
          transform: `scale(${scale}) rotate(${interpolate(s, [0, 1], [6, 0])}deg)`,
          backgroundImage: `linear-gradient(${accent}22 1px, transparent 1px), linear-gradient(90deg, ${accent}22 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "relative",
          fontSize: num(p, "fontSize", 96),
          fontWeight: 900,
          color: "#FFFFFF",
          letterSpacing: -3,
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
          textShadow: glow(accent, 80),
        }}
      >
        {str(p, "title", "PROJECT ONE")}
      </div>
    </AbsoluteFill>
  );
};
