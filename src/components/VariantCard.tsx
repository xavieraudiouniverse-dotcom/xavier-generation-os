import React from "react";

export default function VariantCard({ variant, engine, onApply }: any) {
  function handlePreview() {
    alert(`Previewing variant: ${variant.name} (mock)`);
  }

  function handleApply() {
    const patch = {
      id: `patch-${variant.id}-${Date.now()}`,
      variantId: variant.id,
      name: variant.name,
      proposal: variant.proposal,
      appliedAt: new Date().toISOString(),
    };
    onApply && onApply(patch);
    alert(`Applied variant: ${variant.name} (mock)`);
  }

  function handleUndo() {
    const undone = engine.undo();
    if (undone) alert(`Undo applied: ${undone.id}`);
    else alert("Nothing to undo");
  }

  return (
    <div className="variant-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{variant.name}</div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>{variant.summary}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="mini-btn" onClick={handlePreview}>Preview</button>
          <button className="btn" onClick={handleApply}>Apply</button>
          <button className="mini-btn" onClick={handleUndo}>Undo</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>Proposal:</div>
        <pre style={{ marginTop: 8, background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8 }}>{JSON.stringify(variant.proposal, null, 2)}</pre>
      </div>
    </div>
  );
}
