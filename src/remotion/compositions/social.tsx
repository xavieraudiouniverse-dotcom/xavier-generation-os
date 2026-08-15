import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_DISPLAY, FONT_MONO, INK, glow } from "../theme";
import { num, str, words, type TemplateComponent } from "../props";

/** Hook card — inspired by heyirfanaziz/remotion-tiktok (MIT). */
export const TikTokHookCard: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#FF006E");
  const s = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        background: str(p, "background", INK),
        fontFamily: FONT_DISPLAY,
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          width: "100%",
          borderRadius: 30,
          border: `1px solid ${accent}66`,
          background: "rgba(255,255,255,0.05)",
          padding: 48,
          transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px)`,
          opacity: s,
          boxShadow: glow(accent, 90),
        }}
      >
        <div style={{ fontFamily: FONT_MONO, letterSpacing: 5, fontSize: 20, color: accent }}>
          {str(p, "eyebrow", "POV")}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: num(p, "fontSize", 74),
            fontWeight: 900,
            color: "#FFF",
            lineHeight: 1.05,
          }}
        >
          {str(p, "hook", "You edited this in 4 minutes")}
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: "#FFFFFFAA" }}>
          {str(p, "subtitle", "Swipe for the timeline")}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelCountdown: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#00D4FF");
  const from = Math.round(num(p, "from", 3));
  const idx = Math.min(from - 1, Math.floor(frame / fps));
  const n = from - idx;
  const s = spring({ frame: frame - idx * fps, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill
      style={{
        background: str(p, "background", "#050505"),
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_DISPLAY,
      }}
    >
      <div
        style={{
          fontSize: 300,
          fontWeight: 900,
          color: accent,
          transform: `scale(${interpolate(s, [0, 1], [1.6, 1])})`,
          opacity: interpolate(s, [0, 0.3, 1], [0, 1, 1]),
          textShadow: glow(accent, 140),
        }}
      >
        {n}
      </div>
      <div style={{ position: "absolute", bottom: 120, fontSize: 40, color: "#FFF" }}>
        {str(p, "label", "Drop incoming")}
      </div>
    </AbsoluteFill>
  );
};

export const StoryQuote: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#FFD700");
  const list = words(str(p, "quote", "Taste is the last unfair advantage"));

  return (
    <AbsoluteFill
      style={{
        background: str(p, "background", INK),
        fontFamily: FONT_DISPLAY,
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        {list.map((w, i) => {
          const s = spring({ frame: frame - i * 4, fps, config: { damping: 16 } });
          return (
            <span
              key={i}
              style={{
                fontSize: num(p, "fontSize", 68),
                fontWeight: 800,
                color: "#FFF",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 40, fontFamily: FONT_MONO, fontSize: 24, color: accent }}>
        — {str(p, "author", "Xavier")}
      </div>
    </AbsoluteFill>
  );
};

export const StatBurst: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#00D4FF");
  const target = num(p, "value", 1000000);
  const s = spring({ frame, fps, config: { damping: 30, stiffness: 60 } });
  const shown = Math.round(target * s).toLocaleString();

  return (
    <AbsoluteFill
      style={{
        background: str(p, "background", INK),
        fontFamily: FONT_DISPLAY,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: num(p, "fontSize", 130),
          fontWeight: 900,
          color: "#FFF",
          textShadow: glow(accent, 110),
        }}
      >
        {str(p, "prefix", "")}
        {shown}
        {str(p, "suffix", "+")}
      </div>
      <div style={{ marginTop: 18, fontFamily: FONT_MONO, letterSpacing: 6, color: accent, fontSize: 26 }}>
        {str(p, "label", "TEMPLATES IN THE LIBRARY")}
      </div>
    </AbsoluteFill>
  );
};
