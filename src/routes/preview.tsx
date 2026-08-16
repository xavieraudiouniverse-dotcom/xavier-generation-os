import React, { useEffect, useState } from "react";
import CinematicPreview from "../components/CinematicPreview";
import FloatingHUD from "../components/FloatingHUD";
import "../styles/design-tokens.css";
import "../styles/preview.css";
import XavierOrb from "../components/XavierOrb";
import orbConnector from "../components/OrbConnector";
import DirectorSuggestionPanel from "../components/DirectorSuggestionPanel";

export default function PreviewRoute() {
  const [suggestion, setSuggestion] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const off = orbConnector.on("director:started", () => setAnalyzing(true));
    const off2 = orbConnector.on("director:suggestion", (s: any) => {
      setAnalyzing(false);
      setSuggestion(s);
    });
    return () => {
      off();
      off2();
    };
  }, []);

  function handleOrbOpen() {
    // use preview context (mock): time range & approximate duration
    const context = { location: "preview", approxDuration: 28, dialogueDetected: true };
    orbConnector.requestDirectorCut(context);
  }

  function applySuggestion(s: any) {
    alert("Director's Cut applied to preview (mock)");
    setSuggestion(null);
  }

  function previewSuggestion(s: any) {
    alert("Previewing Director's Cut (mock)");
  }

  return (
    <div style={{ padding: 40, minHeight: "100vh", background: "linear-gradient(180deg,var(--bg), #070708)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ color: "var(--text)", marginBottom: 12 }}>Cinematic Preview — HUD demo</h2>
        <div style={{ position: "relative" }}>
          <CinematicPreview />
          <FloatingHUD actions={[{ id: "director", label: "Director's Cut" }, { id: "open", label: "Open in Editor" }]} />
        </div>
        <p style={{ color: "var(--muted)", marginTop: 16 }}>The preview auto-hides controls while playing, the HUD floats above the preview and provides quick access to common actions.</p>

        <div style={{ marginTop: 20 }}>
          <XavierOrb onOpen={handleOrbOpen} />
        </div>

        {analyzing && (
          <div style={{ position: "fixed", left: 20, bottom: 20, background: "rgba(0,0,0,0.6)", padding: 12, borderRadius: 8, color: "var(--muted)" }}>Analyzing preview…</div>
        )}

        {suggestion && (
          <DirectorSuggestionPanel suggestion={suggestion} onApply={applySuggestion} onPreview={previewSuggestion} onClose={() => setSuggestion(null)} />
        )}

      </div>
    </div>
  );
}
