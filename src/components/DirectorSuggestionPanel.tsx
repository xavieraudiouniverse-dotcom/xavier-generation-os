import React from "react";

export default function DirectorSuggestionPanel({ suggestion, onApply, onPreview, onClose }: any) {
  if (!suggestion) return null;

  return (
    <div role="dialog" aria-label="Director suggestion" style={{ position: "absolute", right: 20, top: 20, width: 420, background: "linear-gradient(180deg, rgba(11,12,15,0.96), rgba(6,7,9,0.96))", padding: 16, borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Director's Cut — Proposed changes</div>
          <div style={{ color: "#99a1ad", fontSize: 13, marginTop: 6 }}>Auto-generated suggestion based on context</div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#99a1ad", cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 8 }}><strong>Pacing</strong>: {suggestion.proposal.pacing}</div>
        <div style={{ marginBottom: 8 }}><strong>Colour</strong>: {suggestion.proposal.color}</div>
        <div style={{ marginBottom: 8 }}><strong>Sound</strong>: {suggestion.proposal.sound}</div>
        <div style={{ marginBottom: 8 }}><strong>Transitions</strong>: {suggestion.proposal.transitions}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => onPreview && onPreview(suggestion)} style={{ padding: "8px 12px", borderRadius: 8, background: "linear-gradient(90deg,#6EE7FF,#8A6CFF)", border: "none", color: "#041018", fontWeight: 700, cursor: "pointer" }}>Preview</button>
        <button onClick={() => onApply && onApply(suggestion)} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", color: "#E6EEF3", cursor: "pointer" }}>Apply</button>
        <button onClick={() => {
          const blob = new Blob([JSON.stringify(suggestion, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `director-plan-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }} style={{ padding: "8px 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.04)", color: "#99a1ad", cursor: "pointer" }}>Download plan</button>
      </div>
    </div>
  );
}
