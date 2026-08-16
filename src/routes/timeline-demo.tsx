import React, { useState, useRef, useEffect } from "react";
import "../styles/timeline.css";

import TrackGroup from "../components/TrackGroup";
import SceneIntelOverlay from "../components/SceneIntelOverlay";
import mockTimeline from "../data/mock-timeline";

export default function TimelineContainer() {
  const [project, setProject] = useState(mockTimeline);
  const [zoom, setZoom] = useState("medium"); // fine | medium | coarse
  const [focusedTrack, setFocusedTrack] = useState<string | null>(null);
  const [playhead, setPlayhead] = useState(6.2); // seconds

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // simple keyboard scrub for demo: left/right arrow
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setPlayhead((p) => Math.max(0, +(p - 0.5).toFixed(2)));
      if (e.key === "ArrowRight") setPlayhead((p) => +(p + 0.5).toFixed(2));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function updateClip(trackId: string, clipId: string, patch: any) {
    setProject((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const track = copy.tracks.find((t: any) => t.id === trackId);
      if (!track) return prev;
      const clip = track.clips.find((c: any) => c.id === clipId);
      if (!clip) return prev;
      Object.assign(clip, patch);
      return copy;
    });
  }

  function exportSnapshot() {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timeline-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="timeline-shell" ref={containerRef}>
      <div className="timeline-header">
        <div className="title">Timeline — {project.name}</div>
        <div className="controls">
          <select value={zoom} onChange={(e) => setZoom(e.target.value)} aria-label="Zoom level">
            <option value="fine">Fine (0.5s)</option>
            <option value="medium">Medium (1s)</option>
            <option value="coarse">Coarse (2s)</option>
          </select>
          <button className="btn" onClick={() => setFocusedTrack(null)}>Show All</button>
          <button className="btn" onClick={exportSnapshot}>Export selection</button>
        </div>
      </div>

      <div className="timeline-ruler"> 
        {/* Render a simple time ruler based on project duration and zoom */}
        {Array.from({ length: Math.ceil(project.duration / (zoom === "fine" ? 0.5 : zoom === "medium" ? 1 : 2)) }).map((_, i) => (
          <div key={i} className="ruler-mark">{(i * (zoom === "fine" ? 0.5 : zoom === "medium" ? 1 : 2)).toFixed(2)}</div>
        ))}
      </div>

      <div className="timeline-tracks">
        <SceneIntelOverlay markers={project.sceneIntel} onMarkerClick={(t) => setPlayhead(t.time)} />
        {project.tracks.map((track: any) => (
          <TrackGroup
            key={track.id}
            track={track}
            zoom={zoom}
            focused={focusedTrack === track.id}
            onFocus={() => setFocusedTrack((f) => (f === track.id ? null : track.id))}
            onUpdateClip={updateClip}
            playhead={playhead}
            onSeek={(t: number) => setPlayhead(t)}
          />
        ))}

        <div className="playhead" style={{ left: `${(playhead / project.duration) * 100}%` }} aria-hidden>
          <div className="playhead-line" />
          <div className="playhead-handle">▶</div>
        </div>
      </div>

    </div>
  );
}
