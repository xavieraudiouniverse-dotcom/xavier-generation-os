import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { AI_TOOLS, STYLE_PRESETS, AI_MUSIC_MOODS, TREND_FEED, runMockAi } from "@/lib/ai-tools";
import { useEditor } from "@/store/editor";

const accentText: Record<string, string> = {
  neon: "text-neon", magenta: "text-magenta", gold: "text-gold",
};

export function AiPanel() {
  const [running, setRunning] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [style, setStyle] = useState(STYLE_PRESETS[0]!);
  const [mood, setMood] = useState(AI_MUSIC_MOODS[0]!);
  const [showTrends, setShowTrends] = useState(false);
  const { addClip, detectBeats, splitAtPlayhead } = useEditor();

  const run = async (id: string) => {
    const tool = AI_TOOLS.find((t) => t.id === id)!;
    setRunning(id);
    await runMockAi(null, tool.duration);
    setRunning(null);
    setDone((d) => [...new Set([...d, id])]);

    switch (id) {
      case "auto-edit":
        splitAtPlayhead();
        detectBeats();
        toast.success("AI Auto-Edit: 7 cuts suggested, beats mapped.");
        break;
      case "style":
        addClip("t-fx", `Style · ${style}`, 6);
        toast.success(`Style transfer applied — ${style}.`);
        break;
      case "captions":
        addClip("t-text", "Auto captions", 8);
        toast.success("Captions generated and animated.");
        break;
      case "bg-remove":
        addClip("t-fx", "Matte · subject key", 5);
        toast.success("Background removed on the selected clip.");
        break;
      case "ai-music":
        addClip("t-audio", `AI Score · ${mood}`, 12);
        detectBeats();
        toast.success(`Track composed — ${mood}.`);
        break;
      case "trends":
        setShowTrends(true);
        toast.success("Trend forecast updated.");
        break;
    }
  };

  return (
    <div className="space-y-3">
      {AI_TOOLS.map((t) => (
        <div key={t.id} className="rounded-lg border border-border bg-surface p-3">
          <div className="flex items-center gap-2.5">
            <t.icon className={`size-4 ${accentText[t.accent]}`} />
            <span className="flex-1 text-sm font-medium">{t.name}</span>
            {done.includes(t.id) && <Check className="size-3.5 text-neon" />}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{t.description}</p>

          {t.id === "style" && (
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="mt-2 w-full rounded border border-border bg-stage px-2 py-1.5 text-xs outline-none"
            >
              {STYLE_PRESETS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          {t.id === "ai-music" && (
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="mt-2 w-full rounded border border-border bg-stage px-2 py-1.5 text-xs outline-none"
            >
              {AI_MUSIC_MOODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => void run(t.id)}
            disabled={running !== null}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-border bg-stage px-3 py-1.5 text-xs font-semibold transition-colors hover:border-neon/60 hover:text-neon disabled:opacity-50"
          >
            {running === t.id ? (
              <>
                <Loader2 className="size-3 animate-spin" /> {t.runLabel}…
              </>
            ) : (
              "Run"
            )}
          </button>

          {t.id === "trends" && showTrends && (
            <ul className="mt-3 space-y-1.5">
              {TREND_FEED.map((f) => (
                <li key={f.format} className="rounded border border-border bg-stage p-2">
                  <p className="text-xs font-medium">{f.format}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {f.platform} · <span className="text-gold">+{f.growth}%</span> · {f.heat}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
