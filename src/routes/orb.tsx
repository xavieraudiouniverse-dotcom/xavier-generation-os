import React from "react";
import XavierOrb from "../components/XavierOrb";
import AICard from "../components/AICard";
import "../styles/design-tokens.css";
import "../styles/orb.css";

export default function OrbRoute() {
  return (
    <div style={{ padding: 40, minHeight: "100vh", background: "linear-gradient(180deg,var(--bg), #060607)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0 }}>Xavier Orb — Assistant demo</h2>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Shortcut: Ctrl/Cmd + K</div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <XavierOrb />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
          <div style={{ borderRadius: 12, overflow: "hidden" }} className="preview-sample">
            <div className="frame">Editor preview (mock)</div>
          </div>

          <div>
            <AICard />
          </div>
        </div>

      </div>
    </div>
  );
}
