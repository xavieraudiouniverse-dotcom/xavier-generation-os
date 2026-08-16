import React, { useState } from "react";
import DirectorModal from "../components/DirectorModal";
import TimelineDemo from "./timeline-demo";
import "../styles/director.css";

export default function DirectorDemoRoute() {
  const [open, setOpen] = useState(false);
  const [appliedPatches, setAppliedPatches] = useState<any[]>([]);

  function handleApplyPatch(patch: any) {
    setAppliedPatches((p) => [patch, ...p]);
  }

  return (
    <div style={{ padding: 40, minHeight: "100vh", background: "linear-gradient(180deg,var(--bg), #070708)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0 }}>Director Prototype — Demo</h2>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Open the modal to explore variant suggestions, preview and apply.</div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn" onClick={() => setOpen(true)}>Open Director</button>
            <button className="btn" onClick={() => setAppliedPatches([])}>Clear Applied</button>
          </div>
        </div>

        <TimelineDemo />

        <div style={{ marginTop: 24 }}>
          <h3>Applied patches (mock)</h3>
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            {appliedPatches.length === 0 && <div style={{ color: "var(--muted)" }}>No applied patches yet</div>}
            {appliedPatches.map((p) => (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", padding: 8, borderRadius: 8 }}>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Applied at: {p.appliedAt}</div>
                <pre style={{ marginTop: 8 }}>{JSON.stringify(p.proposal, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>

      </div>

      <DirectorModal open={open} onClose={() => setOpen(false)} context={{ location: "director-demo" }} onApplyPatch={handleApplyPatch} />
    </div>
  );
}
