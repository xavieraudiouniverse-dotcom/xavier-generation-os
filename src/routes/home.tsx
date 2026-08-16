import React from "react";
import "../styles/design-tokens.css";

export default function HomeRoute() {
  return (
    <div style={{ padding: "48px", minHeight: "100vh", background: "linear-gradient(180deg,var(--bg), #070708)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>XAVIER</div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>GENERATION OS</div>
        </div>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <button className="btn">Create</button>
          <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.04)", color: "var(--muted)", padding: "8px 12px", borderRadius: 8 }}>Projects</button>
          <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.04)", color: "var(--muted)", padding: "8px 12px", borderRadius: 8 }}>Library</button>
        </nav>
      </header>

      <main style={{ display: "grid", gridTemplateColumns: "360px 1fr 320px", gap: 32 }}>
        {/* Left column - nav / recent */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Recent Projects</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>SKATE_STORY.AI</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>CINEMATIC_TRAILER</div>
            <div style={{ height: 8 }} />
            <button className="btn">New Project</button>
          </div>

          <div className="panel" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Templates</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)", color: "var(--text)", border: "1px solid rgba(255,255,255,0.03)" }}>Social Short — 9:16</button>
              <button style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)", color: "var(--text)", border: "1px solid rgba(255,255,255,0.03)" }}>Cinematic Trailer — 16:9</button>
            </div>
          </div>
        </aside>

        {/* Center hero */}
        <section>
          <div style={{ borderRadius: 16, padding: 32, background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", boxShadow: "0 20px 60px rgba(3,6,12,0.6)" }}>
            <h1 style={{ fontSize: 40, margin: 0, fontWeight: 700 }}>WHAT DO YOU WANT TO CREATE?</h1>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>Describe your idea — Xavier will suggest a director's cut, templates and intelligent edits.</p>

            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <textarea placeholder="Describe your idea... e.g. ‘Create a cinematic 60-second trailer about a Māori warrior crossing an ancient ocean.’" style={{ flex: 1, minHeight: 120, padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.3)", color: "var(--text)", border: "1px solid rgba(255,255,255,0.03)" }} />

              <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 12 }}>
                <button className="btn" style={{ width: "100%", padding: "14px 16px", fontSize: 16 }}>Generate Video</button>

                <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Quick actions</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.03)", background: "transparent" }}>Text → Video</button>
                    <button style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.03)", background: "transparent" }}>Image → Video</button>
                    <button style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.03)", background: "transparent" }}>Video → Video</button>
                    <button style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.03)", background: "transparent" }}>Script → Film</button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, color: "var(--muted)", fontSize: 13 }}>Tip: Try “Make this feel like a $50M cinematic trailer”</div>
          </div>

          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, borderRadius: 12, overflow: "hidden" }} className="preview-sample">
                <div className="frame">Large preview / hero</div>
              </div>

              <aside style={{ width: 320 }}>
                <div className="ai-card">
                  <h4>Xavier — Suggestions</h4>
                  <p style={{ color: "var(--muted)", margin: 0 }}>Director’s Cut and templates tailored to your prompt.</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button>Director's Cut</button>
                    <button>Open Studio</button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Right column - inspector */}
        <aside>
          <div className="panel" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>AI Studio</div>
            <div style={{ color: "var(--muted)", marginBottom: 12 }}>Generate, refine and manage your creations</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>Open Generation Studio</button>
              <button style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>My Library</button>
              <button style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>Export History</button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
