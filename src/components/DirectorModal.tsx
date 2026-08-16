import React, { useEffect, useState } from "react";
import "../styles/director.css";
import VariantCard from "../components/VariantCard";
import ChangePatchEngine from "../components/ChangePatchEngine";

export default function DirectorModal({ open, onClose, context, onApplyPatch }: any) {
  const [tab, setTab] = useState("variants");
  const [engine] = useState(() => new ChangePatchEngine());
  const [applied, setApplied] = useState<any[]>([]);

  useEffect(() => {
    function onChange() {
      setApplied(engine.getApplied());
    }
    engine.subscribe(onChange);
    return () => engine.unsubscribe(onChange);
  }, [engine]);

  if (!open) return null;

  const variants = [
    {
      id: "conservative",
      name: "Conservative",
      summary: "Small pacing and color adjustments, prioritize dialogue",
      proposal: { pacing: "+5%", color: "Subtle warmth", sound: "Dialogue lift +2dB" },
    },
    {
      id: "cinematic",
      name: "Cinematic",
      summary: "Stronger contrast, punchier cuts and cinematic grade",
      proposal: { pacing: "+18%", color: "Lift -6, Gamma +4, Gain +8", sound: "Reduce music -6dB on speech" },
    },
    {
      id: "high-energy",
      name: "High-energy",
      summary: "Aggressive pacing, rhythmic cuts and boosted music",
      proposal: { pacing: "+35%", color: "High saturation", sound: "Music +4dB, Sidechain on dialogue" },
    },
  ];

  return (
    <div className="director-modal-backdrop" role="dialog" aria-modal="true">
      <div className="director-modal">
        <div className="director-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Director’s Cut — Suggestions</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Context: {context?.location || "unknown"}</div>
          </div>
          <div className="director-actions">
            <button className="mini-btn" onClick={() => setTab("variants")} aria-pressed={tab === "variants"}>Variants</button>
            <button className="mini-btn" onClick={() => setTab("preview")} aria-pressed={tab === "preview"}>Timeline Preview</button>
            <button className="mini-btn" onClick={() => setTab("json")} aria-pressed={tab === "json"}>JSON Plan</button>
            <button className="mini-btn" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="director-body">
          {tab === "variants" && (
            <div className="variants-grid">
              {variants.map((v) => (
                <VariantCard
                  key={v.id}
                  variant={v}
                  engine={engine}
                  onApply={(patch: any) => {
                    engine.apply(patch);
                    onApplyPatch && onApplyPatch(patch);
                  }}
                />
              ))}
            </div>
          )}

          {tab === "preview" && (
            <div className="preview-area">
              <div style={{ color: "var(--muted)" }}>Timeline preview (mock): applied patches</div>
              <pre className="json-preview">{JSON.stringify(applied, null, 2)}</pre>
            </div>
          )}

          {tab === "json" && (
            <div className="json-area">
              <div style={{ color: "var(--muted)", marginBottom: 8 }}>Combined JSON plan (downloadable)</div>
              <pre className="json-preview">{JSON.stringify({ variants, applied }, null, 2)}</pre>
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify({ variants, applied }, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `director-plan-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
