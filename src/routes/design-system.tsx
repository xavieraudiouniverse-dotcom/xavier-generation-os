import React from "react";
import "../styles/design-tokens.css";

export default function DesignSystem() {
  return (
    <div className="ds-shell">
      <div className="ds-header">
        <div>
          <div className="ds-title">Xavier — Design system preview</div>
          <div className="ds-sub">Obsidan theme · tokens · motion</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn">Apply theme</button>
        </div>
      </div>

      <div className="palette" aria-hidden>
        <div className="swatch" style={{ background: "var(--primary)" }}>
          <div className="label">Primary<br/><small style={{color:'rgba(0,0,0,0.6)'}}>var(--primary)</small></div>
        </div>
        <div className="swatch" style={{ background: "var(--neon)" }}>
          <div className="label">Neon<br/><small style={{color:'rgba(0,0,0,0.6)'}}>var(--neon)</small></div>
        </div>
        <div className="swatch" style={{ background: "var(--accent)" }}>
          <div className="label">Accent<br/><small style={{color:'rgba(0,0,0,0.6)'}}>var(--accent)</small></div>
        </div>
        <div className="swatch" style={{ background: "var(--panel)" }}>
          <div className="label">Panel<br/><small style={{color:'rgba(255,255,255,0.6)'}}>var(--panel)</small></div>
        </div>
      </div>

      <div className="typography">
        <div className="h1">The quick brown fox — 48px</div>
        <div className="h2">UI Headline — 24px</div>
        <p>
          Body copy — 16px. This is a sample line of text to preview the typographic scale and color contrast with the obsidian theme.
        </p>
      </div>

      <div className="orb-demo">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div className="orb" role="button" aria-label="Xavier Orb">
            <div className="core" />
          </div>
          <div style={{color:'var(--muted)'}}>Xavier Orb — idle</div>
        </div>

        <div className="ai-card">
          <h4>AI Assistant — example</h4>
          <p style={{margin:'0 0 12px 0', color:'var(--muted)'}}>Suggested layouts based on current clip</p>
          <div style={{display:'flex',gap:8}}>
            <button>Split Screen</button>
            <button>Auto-Crop</button>
            <button>Overlay</button>
          </div>
        </div>

        <div style={{marginLeft:'auto'}}>
          <div className="preview-sample">
            <div className="frame">Cinematic preview sample</div>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:24,alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <div style={{marginBottom:12}}><strong>Controls</strong></div>
          <div style={{display:'flex',gap:12}}>
            <button className="btn">Generate</button>
            <button className="btn">Director's Cut</button>
          </div>
        </div>

        <div style={{width:320}}>
          <div style={{marginBottom:8}}><strong>Motion demo</strong></div>
          <div className="motion-box">Hover me</div>
        </div>
      </div>

    </div>
  );
}
