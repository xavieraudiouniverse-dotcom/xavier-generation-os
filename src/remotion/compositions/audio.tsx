import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_DISPLAY, FONT_MONO, INK, glow, rand } from "../theme";
import { num, str, type TemplateComponent } from "../props";

/**
 * Synthetic spectrum. Inspired by marcusstenbeck/remotion-audio-visualizers (MIT).
 * Real audio-reactive bars need @remotion/media-utils audio analysis of an attached
 * track; the synthetic driver keeps this fully client-side.
 */
const spectrum = (frame: number, bars: number, speed: number, energy: number) =>
  Array.from({ length: bars }).map((_, i) => {
    const wave =
      Math.abs(Math.sin((frame * speed) / 14 + i * 0.5)) * 0.6 +
      rand(i * 3.3 + Math.floor((frame * speed) / 4)) * 0.4;
    return Math.max(0.06, wave * energy);
  });

export const BarSpectrum: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const accent = str(p, "accent", "#00D4FF");
  const bars = Math.round(num(p, "bars", 48));
  const values = spectrum(frame, bars, num(p, "speed", 1), num(p, "energy", 1));

  return (
    <AbsoluteFill
      style={{
        background: str(p, "background", INK),
        fontFamily: FONT_DISPLAY,
        justifyContent: "flex-end",
        padding: 70,
      }}
    >
      <div style={{ fontSize: 46, fontWeight: 800, color: "#FFF", marginBottom: 26 }}>
        {str(p, "title", "Now Playing")}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: "45%" }}>
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${v * 100}%`,
              borderRadius: 4,
              background: `linear-gradient(180deg, ${accent}, ${accent}44)`,
              boxShadow: glow(accent, 26),
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const RadialPulse: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const accent = str(p, "accent", "#FF006E");
  const spokes = Math.round(num(p, "bars", 64));
  const values = spectrum(frame, spokes, num(p, "speed", 1), num(p, "energy", 1));
  const radius = num(p, "radius", 190);

  return (
    <AbsoluteFill
      style={{
        background: str(p, "background", "#050507"),
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_DISPLAY,
      }}
    >
      <div style={{ position: "relative", width: radius * 2, height: radius * 2 }}>
        {values.map((v, i) => {
          const angle = (i / spokes) * 360;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 5,
                height: radius * 0.5 * v + 14,
                marginLeft: -2.5,
                borderRadius: 3,
                background: accent,
                transformOrigin: `50% ${radius}px`,
                transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                boxShadow: glow(accent, 20),
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            inset: radius * 0.42,
            borderRadius: "50%",
            border: `2px solid ${accent}66`,
            display: "grid",
            placeItems: "center",
            color: "#FFF",
            fontSize: 30,
            fontWeight: 800,
            textAlign: "center",
            padding: 12,
          }}
        >
          {str(p, "title", "TRACK 01")}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const WaveformRibbon: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const accent = str(p, "accent", "#FFD700");
  const points = 120;
  const amp = num(p, "energy", 1) * 90;
  const path = Array.from({ length: points })
    .map((_, i) => {
      const x = (i / (points - 1)) * width;
      const y =
        Math.sin(i * 0.18 + frame * 0.12 * num(p, "speed", 1)) * amp * (0.4 + rand(i) * 0.6);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${(y + 200).toFixed(1)}`;
    })
    .join(" ");

  return (
    <AbsoluteFill
      style={{
        background: str(p, "background", INK),
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_DISPLAY,
      }}
    >
      <svg width={width} height={400} viewBox={`0 0 ${width} 400`}>
        <path d={path} fill="none" stroke={accent} strokeWidth={5} strokeLinecap="round" />
        <path d={path} fill="none" stroke={accent} strokeWidth={16} opacity={0.18} />
      </svg>
      <div
        style={{
          marginTop: 20,
          fontFamily: FONT_MONO,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: accent,
          fontSize: 24,
        }}
      >
        {str(p, "title", "Master mix")}
      </div>
      <div style={{ marginTop: 8, color: "#FFF", opacity: interpolate(frame, [0, 20], [0, 0.7]) }}>
        {str(p, "subtitle", "Xavier Generation OS")}
      </div>
    </AbsoluteFill>
  );
};
