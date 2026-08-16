import React from "react";

export default function SceneIntelOverlay({ markers = [], onMarkerClick }: any) {
  return (
    <div className="scene-intel-overlay" aria-hidden>
      {markers.map((m: any) => (
        <button key={m.id} className="scene-marker" style={{ left: `${(m.time / m.contextDuration) * 100}%` }} onClick={() => onMarkerClick && onMarkerClick(m)} title={m.label}>
          <div className="marker-dot" />
          <div className="marker-label">{m.label}</div>
        </button>
      ))}
    </div>
  );
}
