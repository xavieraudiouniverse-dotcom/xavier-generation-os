import React from "react";
import "../styles/preview.css";

type HUDAction = { id: string; label: string; onClick?: () => void };

export function FloatingHUD({ actions = [] }: { actions?: HUDAction[] }) {
  return (
    <div className="floating-hud" role="toolbar" aria-label="Preview actions">
      <div className="hud-left">
        <button className="mini-btn">Reframe</button>
        <button className="mini-btn">Color</button>
        <button className="mini-btn">Audio</button>
      </div>

      <div className="hud-center"> 
        <div className="transport">
          <button className="transport-btn">◄◄</button>
          <button className="transport-btn">◄</button>
          <button className="transport-btn primary">Play</button>
          <button className="transport-btn">►</button>
          <button className="transport-btn">►►</button>
        </div>
      </div>

      <div className="hud-right">
        {actions.map((a) => (
          <button key={a.id} className="mini-btn" onClick={a.onClick}>{a.label}</button>
        ))}
      </div>
    </div>
  );
}

export default FloatingHUD;
