import React from "react";
import CinematicPreview from "../components/CinematicPreview";
import FloatingHUD from "../components/FloatingHUD";
import "../styles/design-tokens.css";
import "../styles/preview.css";

export default function PreviewRoute() {
  return (
    <div style={{ padding: 40, minHeight: "100vh", background: "linear-gradient(180deg,var(--bg), #070708)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ color: "var(--text)", marginBottom: 12 }}>Cinematic Preview — HUD demo</h2>
        <div style={{ position: "relative" }}>
          <CinematicPreview />
          <FloatingHUD actions={[{ id: "director", label: "Director's Cut" }, { id: "open", label: "Open in Editor" }]} />
        </div>
        <p style={{ color: "var(--muted)", marginTop: 16 }}>The preview auto-hides controls while playing, the HUD floats above the preview and provides quick access to common actions.</p>
      </div>
    </div>
  );
}
