import { useEffect, useState } from "react";
import { Loader2, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AI_TOOLS, STYLE_PRESETS } from "@/lib/ai-tools";
import { startStyleTransferJob, pollStyleTransferJob, STYLE_MODEL_LABEL } from "@/lib/style-transfer.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEditor } from "@/store/editor";

const accentText: Record<string, string> = {
  neon: "text-neon", magenta: "text-magenta", gold: "text-gold",
};

type MediaItem = { id: string; name: string; type: string; url: string };

const STYLED_SECONDS = 5;

/** Grabs a still from a video URL at `time` seconds and returns it as a PNG blob. */
function grabFrame(url: string, time: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "auto";
    video.src = url;
    const fail = () => reject(new Error("Could not read a frame from that clip."));
    video.onerror = fail;
    video.onloadeddata = () => {
      video.currentTime = Math.min(time, Math.max(0, (video.duration || 1) - 0.1));
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return fail();
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => (b ? resolve(b) : fail()), "image/png");
    };
  });
}

export function AiPanel() {
  const [running, setRunning] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const { detectBeats, splitAtPlayhead, addClip, projectId, playhead } = useEditor();
  const { profile } = useAuth();

  const startStyle = useServerFn(startStyleTransferJob);
  const pollStyle = useServerFn(pollStyleTransferJob);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [style, setStyle] = useState(STYLE_PRESETS[0]!);
  const [styleStatus, setStyleStatus] = useState("");
  const [styleUrl, setStyleUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    void (async () => {
      const { data } = await supabase
        .from("media")
        .select("id,name,type,url")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (!active || !data) return;
      const items = data
        .filter((m) => m.url && (m.type === "video" || m.type === "image"))
        .map((m) => ({ id: m.id, name: m.name ?? "Untitled", type: m.type ?? "video", url: m.url as string }));
      setMedia(items);
      if (items[0]) setSourceId((s) => s || items[0]!.id);
    })();
    return () => {
      active = false;
    };
  }, [projectId]);

  const runQuickCut = () => {
    splitAtPlayhead();
    detectBeats();
    setDone((d) => [...new Set([...d, "auto-edit"])]);
    toast.success("Clip split at the playhead and beat markers added.");
  };

  const runStyle = async () => {
    const source = media.find((m) => m.id === sourceId);
    if (!source || !profile) {
      toast.error("Add a video or image to this project's media bin first.");
      return;
    }
    setRunning("style");
    setStyleUrl(null);
    try {
      let sourcePath = source.url;

      if (source.type === "video") {
        setStyleStatus("Extracting frame…");
        const signed = await supabase.storage.from("media").createSignedUrl(source.url, 3600);
        if (!signed.data?.signedUrl) throw new Error("Could not open that clip.");
        const blob = await grabFrame(signed.data.signedUrl, playhead);
        sourcePath = `${profile.id}/style-transfer/frame-${Date.now()}.png`;
        setStyleStatus("Uploading frame…");
        const up = await supabase.storage.from("media").upload(sourcePath, blob, { contentType: "image/png", upsert: true });
        if (up.error) throw new Error("Could not upload the extracted frame.");
      }

      setStyleStatus("Starting restyle…");
      const job = await startStyleTransferJob === null ? null : await startStyle({ data: { sourcePath, style } });
      if (!job) throw new Error("Could not start the restyle.");

      const deadline = Date.now() + 4 * 60 * 1000;
      for (;;) {
        await new Promise((r) => setTimeout(r, 4000));
        const res = await pollStyle({ data: projectId ? { id: job.id, projectId, style } : { id: job.id, style } });
        if (res.status === "failed") throw new Error(res.message ?? "The restyle failed.");
        if (res.status === "completed") {
          setStyleUrl(res.url);
          addClip("t-video", `Styled · ${style}`, STYLED_SECONDS);
          setDone((d) => [...new Set([...d, "style"])]);
          toast.success(`Styled frame added to the timeline — ${style}.`);
          break;
        }
        setStyleStatus(`Rendering… ${res.progress}%`);
        if (Date.now() > deadline) throw new Error("The restyle is taking too long — try again.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Style Transfer failed.");
    } finally {
      setRunning(null);
      setStyleStatus("");
    }
  };

  return (
    <div className="space-y-3">
      {AI_TOOLS.map((t) => {
        const soon = t.status === "coming-soon";
        const busy = running === t.id;
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

            {t.id === "style" && (
              <>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  disabled={running !== null || media.length === 0}
                  aria-label="Source media"
                  className="mt-2 w-full rounded border border-border bg-stage px-2 py-1.5 text-xs outline-none"
                >
                  {media.length === 0 ? (
                    <option value="">No media in this project yet</option>
                  ) : (
                    media.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.type === "video" ? "Frame @ playhead · " : "Image · "}
                        {m.name}
                      </option>
                    ))
                  )}
                </select>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled={running !== null}
                  aria-label="Style preset"
                  className="mt-2 w-full rounded border border-border bg-stage px-2 py-1.5 text-xs outline-none"
                >
                  {STYLE_PRESETS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </>
            )}

            <button
              onClick={() => {
                if (t.id === "auto-edit") runQuickCut();
                if (t.id === "style") void runStyle();
              }}
              disabled={soon || running !== null || (t.id === "style" && media.length === 0)}
              title={soon ? "This feature isn't live yet" : t.runLabel}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-border bg-stage px-3 py-1.5 text-xs font-semibold transition-colors hover:border-neon/60 hover:text-neon disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-foreground"
            >
              {soon ? (
                <>
                  <Lock className="size-3" /> Not available yet
                </>
              ) : busy ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> {styleStatus || `${t.runLabel}…`}
                </>
              ) : (
                "Run"
              )}
            </button>

            {t.id === "style" && (
              <>
                {styleUrl && (
                  <img
                    src={styleUrl}
                    alt={`Frame restyled as ${style}`}
                    className="mt-2 w-full rounded border border-border object-cover"
                  />
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">Rendered with {STYLE_MODEL_LABEL}.</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
