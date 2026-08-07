import { Plus } from "lucide-react";
import { useEditor } from "@/store/editor";

const FIELDS = [
  { key: "position", label: "Position", min: -500, max: 500 },
  { key: "scale", label: "Scale", min: 10, max: 300 },
  { key: "rotation", label: "Rotation", min: -180, max: 180 },
  { key: "opacity", label: "Opacity", min: 0, max: 100 },
] as const;

export function Inspector() {
  const { present, selectedClipId, setSpeed, addKeyframe, updateKeyframe } = useEditor();
  const clip = present.clips.find((c) => c.id === selectedClipId);

  if (!clip) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
        Select a clip on the timeline to inspect its speed and keyframes.
      </p>
    );
  }

  const kf = clip.keyframes[clip.keyframes.length - 1]!;
  const kfIndex = clip.keyframes.length - 1;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-surface p-3">
        <p className="truncate text-sm font-semibold">{clip.name}</p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          in {clip.start.toFixed(2)}s · dur {clip.duration.toFixed(2)}s
        </p>
      </div>

      <div>
        <p className="eyebrow">Speed ramp</p>
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.25}
          value={clip.speed}
          onChange={(e) => setSpeed(clip.id, Number(e.target.value))}
          className="mt-2 w-full accent-[var(--neon)]"
        />
        <p className="mt-1 font-mono text-[10px] text-gold">{clip.speed.toFixed(2)}×</p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="eyebrow">Keyframes ({clip.keyframes.length})</p>
          <button
            onClick={() => addKeyframe(clip.id, {})}
            className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] text-muted-foreground hover:border-neon/60 hover:text-neon"
          >
            <Plus className="size-3" /> Add at playhead
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="flex justify-between font-mono text-[10px] text-muted-foreground">
                {f.label}
                <span className="text-neon">{kf[f.key]}</span>
              </span>
              <input
                type="range"
                min={f.min}
                max={f.max}
                value={kf[f.key]}
                onChange={(e) => updateKeyframe(clip.id, kfIndex, { [f.key]: Number(e.target.value) })}
                className="mt-1 w-full accent-[var(--magenta)]"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
