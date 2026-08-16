import React, { useEffect, useState } from "react";
import "../styles/orb.css";

type OrbState = "idle" | "listening" | "thinking" | "generating";

export default function XavierOrb({ onOpen }: { onOpen?: () => void }) {
  const [state, setState] = useState<OrbState>("idle");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleOpen();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let t: number | undefined;
    if (open) {
      setState("listening");
      t = window.setTimeout(() => setState("thinking"), 800);
    } else {
      setState("idle");
    }
    return () => t && window.clearTimeout(t);
  }, [open]);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next && onOpen) onOpen();
      return next;
    });
  }

  return (
    <div className="xavier-orb-root">
      <button
        aria-pressed={open}
        aria-label="Xavier Orb — open AI composer"
        className={`xavier-orb ${state} ${open ? "open" : ""}`}
        onClick={toggleOpen}
      >
        <span className="orb-core" />
      </button>

      {open && (
        <div className="orb-panel" role="dialog" aria-label="Xavier AI Composer">
          <div className="orb-panel-header">
            <div style={{ fontWeight: 700 }}>Xavier Assistant</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Listening — press Esc to close</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Try commands like:</p>
            <ul style={{ marginTop: 8 }}>
              <li>"Make the first 30 seconds more emotional"</li>
              <li>"Generate a 15s TikTok promo from this clip"</li>
              <li>"Remove background and add cinematic grade"</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="panel-btn" onClick={() => alert("Director's Cut applied (mock)")}>Director's Cut</button>
            <button className="panel-btn" onClick={() => alert("Open Studio (mock)")}>Open Studio</button>
            <button className="panel-btn" onClick={() => alert("Generate Preview (mock)")}>Generate Preview</button>
          </div>
        </div>
      )}
    </div>
  );
}
