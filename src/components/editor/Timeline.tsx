import { useRef } from "react";
import { Volume2, VolumeX, Lock, Unlock } from "lucide-react";
import { useEditor, timelineEnd } from "@/store/editor";

const accentClass: Record<string, string> = {
  neon: "border-neon/60 bg-neon/15 hover:bg-neon/25",
  magenta: "border-magenta/60 bg-magenta/15 hover:bg-magenta/25",
  gold: "border-gold/60 bg-gold/15 hover:bg-gold/25",
};

export function Timeline() {
  const {
    present, playhead, zoom, snap, selectedClipId, beatMarkers,
    setPlayhead, select, moveClip, toggleMute, toggleLock,
  } = useEditor();
  const laneRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; offset: number } | null>(null);

  const end = Math.max(timelineEnd(present), 20);
  const width = end * zoom;

  const xToTime = (clientX: number) => {
    const rect = laneRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, (clientX - rect.left + (laneRef.current?.scrollLeft ?? 0)) / zoom);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-border bg-stage">
      <div className="flex">
        {/* Track headers */}
        <div className="w-40 shrink-0 border-r border-border">
          <div className="h-7 border-b border-border" />
          {present.tracks.map((t) => (
            <div key={t.id} className="flex h-16 items-center gap-2 border-b border-border px-3">
              <span className="flex-1 truncate font-mono text-[11px] text-muted-foreground">{t.name}</span>
              <button onClick={() => toggleMute(t.id)} aria-label="Mute track" className="text-muted-foreground hover:text-neon">
                {t.muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </button>
              <button onClick={() => toggleLock(t.id)} aria-label="Lock track" className="text-muted-foreground hover:text-gold">
                {t.locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
              </button>
            </div>
          ))}
        </div>

        {/* Lanes */}
        <div
          ref={laneRef}
          className="relative min-w-0 flex-1 overflow-x-auto"
          onMouseMove={(e) => {
            if (!drag.current) return;
            moveClip(drag.current.id, xToTime(e.clientX) - drag.current.offset);
          }}
          onMouseUp={() => (drag.current = null)}
          onMouseLeave={() => (drag.current = null)}
        >
          <div style={{ width }} className="relative">
            {/* Ruler */}
            <div
              className="sticky top-0 z-10 h-7 border-b border-border bg-stage"
              onClick={(e) => setPlayhead(xToTime(e.clientX))}
            >
              {Array.from({ length: Math.ceil(end) + 1 }).map((_, s) => (
                <span
                  key={s}
                  style={{ left: s * zoom }}
                  className="absolute top-0 h-full border-l border-border/60 pl-1 font-mono text-[10px] text-muted-foreground"
                >
                  {s % 5 === 0 ? `${s}s` : ""}
                </span>
              ))}
            </div>

            {/* Beat markers */}
            {beatMarkers.map((b, i) => (
              <div
                key={i}
                style={{ left: b * zoom }}
                className="pointer-events-none absolute top-7 bottom-0 w-px bg-gold/35"
              />
            ))}

            {/* Tracks */}
            {present.tracks.map((t) => (
              <div key={t.id} className="relative h-16 border-b border-border">
                {present.clips
                  .filter((c) => c.trackId === t.id)
                  .map((c) => (
                    <div
                      key={c.id}
                      onMouseDown={(e) => {
                        if (t.locked) return;
                        select(c.id);
                        drag.current = { id: c.id, offset: xToTime(e.clientX) - c.start };
                      }}
                      style={{ left: c.start * zoom, width: Math.max(c.duration * zoom, 18) }}
                      className={`absolute top-2 bottom-2 cursor-grab overflow-hidden rounded border px-2 py-1 transition-colors active:cursor-grabbing ${
                        accentClass[c.accent]
                      } ${selectedClipId === c.id ? "ring-2 ring-neon" : ""}`}
                    >
                      <span className="block truncate font-mono text-[10px] text-foreground">{c.name}</span>
                      {c.speed !== 1 && (
                        <span className="font-mono text-[9px] text-gold">{c.speed}×</span>
                      )}
                      {c.waveform && (
                        <span className="absolute inset-x-1 bottom-1 flex h-5 items-end gap-px">
                          {c.waveform.map((v, i) => (
                            <span key={i} style={{ height: `${v * 100}%` }} className="flex-1 bg-magenta/60" />
                          ))}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            ))}

            {/* Playhead */}
            <div
              style={{ left: playhead * zoom }}
              className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-neon"
            >
              <span className="absolute -top-0 -left-1.5 size-3 rotate-45 bg-neon" />
            </div>
          </div>
        </div>
      </div>
      <p className="border-t border-border px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
        magnetic snap {snap ? "ON" : "OFF"} · drag clips to reposition · click ruler to scrub
      </p>
    </div>
  );
}
