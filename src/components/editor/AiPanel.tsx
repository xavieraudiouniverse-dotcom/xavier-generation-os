import { useState } from "react";
import { Loader2, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { AI_TOOLS } from "@/lib/ai-tools";
import { useEditor } from "@/store/editor";

const accentText: Record<string, string> = {
  neon: "text-neon", magenta: "text-magenta", gold: "text-gold",
};

export function AiPanel() {
  const [running, setRunning] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const { detectBeats, splitAtPlayhead } = useEditor();

  const run = (id: string) => {
    if (id !== "auto-edit") return;
    setRunning(id);
    splitAtPlayhead();
    detectBeats();
    setRunning(null);
    setDone((d) => [...new Set([...d, id])]);
    toast.success("Clip split at the playhead and beat markers added.");
  };

  return (
    <div className="space-y-3">
      {AI_TOOLS.map((t) => {
        const soon = t.status === "coming-soon";
        return (
          <div
            key={t.id}
            className={`rounded-lg border border-border bg-surface p-3 ${soon ? "opacity-70" : ""}`}
          >
            <div className="flex items-center gap-2.5">
              <t.icon className={`size-4 ${accentText[t.accent]}`} />
              <span className="flex-1 text-sm font-medium">{t.name}</span>
              {soon && (
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Coming soon
                </span>
              )}
              {!soon && done.includes(t.id) && <Check className="size-3.5 text-neon" />}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{t.description}</p>

            <button
              onClick={() => run(t.id)}
              disabled={soon || running !== null}
              title={soon ? "This feature isn't live yet" : t.runLabel}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-border bg-stage px-3 py-1.5 text-xs font-semibold transition-colors hover:border-neon/60 hover:text-neon disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-foreground"
            >
              {soon ? (
                <>
                  <Lock className="size-3" /> Not available yet
                </>
              ) : running === t.id ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> {t.runLabel}…
                </>
              ) : (
                "Run"
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
