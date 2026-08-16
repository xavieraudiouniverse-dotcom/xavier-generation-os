import React from "react";

export default function TrackGroup({ track, zoom, focused, onFocus, onUpdateClip, playhead, onSeek }: any) {
  return (
    <div className={`track-group ${focused ? "focused" : ""}`} role="group" aria-label={`Track ${track.name}`}>
      <div className="track-header">
        <div>
          <div className="track-name">{track.name}</div>
          <div className="track-type">{track.type}</div>
        </div>
        <div className="track-actions">
          <button className="mini-btn" onClick={onFocus} aria-pressed={focused}>Focus</button>
        </div>
      </div>

      <div className="track-body">
        {track.clips.map((clip: any) => (
          <div key={clip.id} className="clip-item" style={{ left: `${(clip.start / track.duration) * 100}%`, width: `${(clip.length / track.duration) * 100}%` }}>
            <div className="clip-thumb">{clip.title}</div>
            <div className="clip-handles">
              <div className="handle left" onMouseDown={() => console.log("trim start")}>◂</div>
              <div className="handle right" onMouseDown={() => console.log("trim end")}>▸</div>
            </div>
          </div>
        ))}

        {/* visual waveform placeholder for audio tracks */}
        {track.type === "audio" && <div className="waveform-placeholder">~~~~~</div>}
      </div>
    </div>
  );
}
