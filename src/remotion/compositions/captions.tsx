import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_DISPLAY, FONT_MONO, INK, glow } from "../theme";
import { num, str, words, type TemplateComponent } from "../props";

const Stage = ({ children, bg }: { children: React.ReactNode; bg: string }) => (
  <AbsoluteFill
    style={{
      background: bg,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT_DISPLAY,
      padding: 64,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Karaoke fill — inspired by ahgsql/remotion-subtitles (MIT). */
export const KaraokePop: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#00D4FF");
  const list = words(str(p, "text", "Every frame is a decision"));
  const per = num(p, "wordsPerSecond", 2.4);
  const active = Math.floor((frame / fps) * per);

  return (
    <Stage bg={str(p, "background", INK)}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center" }}>
        {list.map((w, i) => {
          const on = i <= active;
          const s = spring({ frame: frame - (i / per) * fps, fps, config: { damping: 14 } });
          return (
            <span
              key={`${w}-${i}`}
              style={{
                fontSize: num(p, "fontSize", 82),
                fontWeight: 800,
                letterSpacing: -1,
                color: on ? accent : "#ffffff",
                opacity: on ? 1 : 0.35,
                transform: `scale(${on ? 0.96 + s * 0.12 : 0.96})`,
                textShadow: on ? glow(accent, 60) : "none",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </Stage>
  );
};

/** One-word highlight box. */
export const WordHighlight: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#FF006E");
  const list = words(str(p, "text", "Cut faster. Ship sharper. Stay premium."));
  const hold = Math.max(4, Math.round(fps / num(p, "wordsPerSecond", 2.2)));
  const i = Math.min(list.length - 1, Math.floor(frame / hold));
  const s = spring({ frame: frame - i * hold, fps, config: { damping: 12, stiffness: 140 } });

  return (
    <Stage bg={str(p, "background", INK)}>
      <div
        style={{
          background: accent,
          padding: "18px 44px",
          borderRadius: 18,
          transform: `scale(${0.82 + s * 0.18}) rotate(${interpolate(s, [0, 1], [-3, 0])}deg)`,
          boxShadow: glow(accent, 90),
        }}
      >
        <span style={{ fontSize: num(p, "fontSize", 96), fontWeight: 900, color: "#0A0A0A" }}>
          {list[i]}
        </span>
      </div>
    </Stage>
  );
};

/** Terminal typewriter caption. */
export const TypewriterTerminal: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#00D4FF");
  const text = str(p, "text", "rendering timeline // 4K // no watermark");
  const chars = Math.floor((frame / fps) * num(p, "charsPerSecond", 22));
  const caret = Math.floor(frame / 8) % 2 === 0;

  return (
    <Stage bg={str(p, "background", "#050507")}>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: num(p, "fontSize", 46),
          color: accent,
          border: `1px solid ${accent}55`,
          borderRadius: 12,
          padding: "28px 34px",
          maxWidth: "88%",
          textShadow: glow(accent, 40),
        }}
      >
        <span style={{ opacity: 0.5 }}>{str(p, "prefix", "$")} </span>
        {text.slice(0, chars)}
        <span style={{ opacity: caret ? 1 : 0 }}>▌</span>
      </div>
    </Stage>
  );
};

/** Stacked bouncing lines. */
export const BounceStack: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#FFD700");
  const lines = str(p, "text", "Premium\nAI editing\nfor creators").split("\n");

  return (
    <Stage bg={str(p, "background", INK)}>
      <div style={{ display: "grid", gap: 10, textAlign: "center" }}>
        {lines.map((line, i) => {
          const s = spring({ frame: frame - i * 7, fps, config: { damping: 11 } });
          return (
            <span
              key={i}
              style={{
                fontSize: num(p, "fontSize", 78),
                fontWeight: 800,
                color: i % 2 === 0 ? "#FFFFFF" : accent,
                transform: `translateY(${interpolate(s, [0, 1], [70, 0])}px)`,
                opacity: s,
                textShadow: i % 2 === 0 ? "none" : glow(accent, 50),
              }}
            >
              {line}
            </span>
          );
        })}
      </div>
    </Stage>
  );
};
