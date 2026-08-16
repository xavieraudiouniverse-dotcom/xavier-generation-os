import React, { useEffect, useRef, useState } from "react";
import "../styles/preview.css";

type Props = {
  src?: string;
  aspect?: "16:9" | "9:16" | "2.39:1";
  poster?: string;
};

export default function CinematicPreview({ src, aspect = "16:9", poster }: Props) {
  const [playing, setPlaying] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  function showControlsTemporarily() {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    // hide after 2200ms of inactivity
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), 2200);
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
      // auto-hide controls shortly after play
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setControlsVisible(false), 1200);
    }
  }

  return (
    <div
      className={`cinematic-preview aspect-${aspect}`}
      onMouseMove={() => showControlsTemporarily()}
      onClick={() => showControlsTemporarily()}
      role="region"
      aria-label="Cinematic preview"
    >
      <div className="frame-inner">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="preview-video"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="preview-fallback">Cinematic preview placeholder</div>
        )}

        <div className={`preview-overlay ${controlsVisible ? "visible" : "hidden"}`}>
          <div className="left-controls">
            <button
              className="control-btn"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-pressed={playing}
            >
              {playing ? "Pause" : "Play"}
            </button>
            <div className="time">00:14.82 / 01:03.40</div>
          </div>

          <div className="center-hud">
            <span className="badge">4K</span>
            <span className="badge">24 FPS</span>
          </div>

          <div className="right-controls">
            <button className="control-btn">Fullscreen</button>
          </div>
        </div>
      </div>
    </div>
  );
}
