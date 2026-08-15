import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_DISPLAY, FONT_MONO, INK, glow } from "../theme";
import { num, str, type TemplateComponent } from "../props";

/**
 * CSS-3D product card. A client-side-safe stand-in for remotion-dev/template-three
 * (MIT) — no WebGL, so it renders and exports entirely in the browser.
 */
export const ProductTurntableCard: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = str(p, "accent", "#00D4FF");
  const s = spring({ frame, fps, config: { damping: 22 } });
  const rotate = (frame * num(p, "spinSpeed", 1.6)) % 360;
  const image = str(p, "imageUrl", "");

  return (
    <AbsoluteFill
      style={{
        background: str(p, "background", INK),
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_DISPLAY,
        perspective: 1400,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(50% 45% at 50% 55%, ${accent}26, transparent 70%)`,
        }}
      />
      <div
        style={{
          width: 460,
          height: 460,
          borderRadius: 28,
          border: `1px solid ${accent}55`,
          background: "linear-gradient(150deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))",
          transform: `rotateY(${rotate}deg) scale(${interpolate(s, [0, 1], [0.75, 1])})`,
          transformStyle: "preserve-3d",
          boxShadow: glow(accent, 120),
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        {image ? (
          <Img src={image} style={{ width: "82%", height: "82%", objectFit: "contain" }} />
        ) : (
          <span style={{ fontSize: 34, color: "#FFFFFF88", fontFamily: FONT_MONO }}>
            {str(p, "placeholder", "ADD PRODUCT IMAGE")}
          </span>
        )}
      </div>
      <div style={{ marginTop: 44, textAlign: "center", opacity: s }}>
        <div style={{ fontSize: num(p, "fontSize", 62), fontWeight: 900, color: "#FFF" }}>
          {str(p, "title", "Signature Series")}
        </div>
        <div style={{ marginTop: 8, fontFamily: FONT_MONO, fontSize: 26, color: accent }}>
          {str(p, "price", "$249")}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Photoreal WebGL turntable placeholder. Marked server-render-only in the registry:
 * a real glTF/three.js scene cannot be captured by the browser DOM exporter.
 */
export const WebglProductScene: TemplateComponent = (p) => {
  const frame = useCurrentFrame();
  const accent = str(p, "accent", "#FFD700");
  return (
    <AbsoluteFill
      style={{
        background: str(p, "background", "#050506"),
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_DISPLAY,
        color: "#FFF",
        textAlign: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: `2px dashed ${accent}77`,
          transform: `rotate(${frame * 1.2}deg)`,
        }}
      />
      <div style={{ position: "absolute", maxWidth: 640 }}>
        <div style={{ fontSize: 46, fontWeight: 900 }}>{str(p, "title", "3D Product Scene")}</div>
        <div style={{ marginTop: 14, fontFamily: FONT_MONO, fontSize: 20, color: accent }}>
          Requires server rendering (@remotion/three · glTF)
        </div>
      </div>
    </AbsoluteFill>
  );
};
