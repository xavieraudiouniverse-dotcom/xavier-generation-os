import { useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TIER_LIMITS, type TierId } from "@/lib/pricing";

const RESOLUTIONS = ["720p", "1080p", "4K"] as const;
const FORMATS = ["MP4", "MOV", "WEBM", "GIF"] as const;

export function ExportDialog({
  projectId, tier, onClose,
}: { projectId: string; tier: TierId; onClose: () => void }) {
  const limits = TIER_LIMITS[tier];
  const [resolution, setResolution] = useState<string>(limits.maxResolution);
  const [format, setFormat] = useState<string>("MP4");
  const [progress, setProgress] = useState<number | null>(null);

  const allowed = (r: string) =>
    RESOLUTIONS.indexOf(r as never) <= RESOLUTIONS.indexOf(limits.maxResolution as never);

  const start = async () => {
    if (!allowed(resolution)) {
      toast.error("Upgrade your plan for this resolution.");
      return;
    }
    setProgress(0);
    const { data } = await supabase
      .from("exports")
      .insert({ project_id: projectId, resolution, format, status: "processing" })
      .select("id")
      .single();

    for (let p = 0; p <= 100; p += 4) {
      setProgress(p);
      await new Promise((r) => setTimeout(r, 90));
    }
    if (data) {
      await supabase.from("exports").update({ status: "complete", progress: 100 }).eq("id", data.id);
    }
    toast.success(`Export complete — ${resolution} ${format}${limits.watermark ? " (watermarked)" : ""}`);
    setProgress(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-md p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Render</p>
            <h2 className="mt-1 text-xl font-bold">Export project</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="eyebrow">Resolution</p>
            <div className="mt-2 flex gap-2">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  disabled={!allowed(r)}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-35 ${
                    resolution === r ? "border-neon bg-neon/15 text-neon" : "border-border text-muted-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Format</p>
            <div className="mt-2 flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                    format === f ? "border-magenta bg-magenta/15 text-magenta" : "border-border text-muted-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            {limits.watermark ? "Watermark included on this plan." : "No watermark · priority render queue."}
          </p>

          {progress !== null && (
            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stage">
                <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-neon to-magenta transition-all" />
              </div>
              <p className="mt-1.5 font-mono text-[10px] text-neon">Rendering… {progress}%</p>
            </div>
          )}

          <button
            onClick={() => void start()}
            disabled={progress !== null}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-neon px-4 py-2.5 text-sm font-semibold text-neon-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {progress !== null ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {progress !== null ? "Rendering" : "Start export"}
          </button>
        </div>
      </div>
    </div>
  );
}
