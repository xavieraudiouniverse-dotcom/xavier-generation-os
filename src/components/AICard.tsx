import React from "react";
import "../styles/orb.css";

export default function AICard({ title = "Recommended layouts", suggestions = [] }: any) {
  return (
    <div className="ai-assistant-card" role="region" aria-label="AI Assistant">
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "var(--muted)", marginBottom: 12 }}>Based on your current clip</div>

      <div style={{ display: "grid", gap: 10 }}>
        <div className="ai-suggestion">
          <div className="ai-suggestion-title">Split Screen</div>
          <div className="ai-suggestion-sub">9:16 split</div>
          <button className="ai-apply">Apply</button>
        </div>

        <div className="ai-suggestion">
          <div className="ai-suggestion-title">Auto-Crop (Dynamic)</div>
          <div className="ai-suggestion-sub">Person tracking focus</div>
          <button className="ai-apply">Apply</button>
        </div>

        <div className="ai-suggestion">
          <div className="ai-suggestion-title">Cinematic Overlay</div>
          <div className="ai-suggestion-sub">Applies filters + text overlay</div>
          <button className="ai-apply">Apply</button>
        </div>
      </div>
    </div>
  );
}
