import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Film, ArrowRight, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startVideoJob, pollVideoJob, MODEL_LABEL, type VideoModel } from "@/lib/veo.functions";
import { useEditor, timelineEnd, starterTimeline, type TimelineState } from "@/store/editor";

export const Route = createFileRoute("/_authenticated/ai-video")({
  head: () => ({
    meta: [
      { title: "AI Video Generator — XAVIER CUT PRO" },
      { name: "description", content: "Turn a text prompt into a cinematic AI-generated clip with sound, then drop it straight onto your timeline." },
      { property: "og:title", content: "AI Video Generator — XAVIER CUT PRO" },
      { property: "og:description", content: "Text to video in one prompt. Generate, preview, and add to your project timeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiVideo,
});

const PRESETS = [
  "Neon-lit Tokyo alley at night, slow dolly forward, rain reflections, cinematic anamorphic",
  "Aerial sunrise over misty mountains, golden light, slow push in, epic score",
  "Close-up of a barista pouring latte art, shallow depth of field, warm morning light",
];

function AiVideo() {
  const navigate = useNavigate();
  const { profile, entitled } = useAuth();
  const start = useServerFn(startVideoJob);
  const poll = useServerFn(pollVideoJob);

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<VideoModel>("veo");
  const [doneModel, setDoneModel] = useState<VideoModel>("veo");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [seconds, setSeconds] = useState<"4" | "6" | "8">("8");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [donePrompt, setDonePrompt] = useState("");
  const [adding, setAdding] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: projects } = useQuery({
    queryKey: ["projects", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("id,title")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!projectId && projects?.length) setProjectId(projects[0]!.id);
  }, [projects, projectId]);

  const generating = !!jobId;

  // Poll the job until it finishes.
  useEffect(() => {
    if (!jobId) return;
    let active = true;
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    const run = async () => {
      try {
        const res = await poll({
          data: projectId ? { id: jobId, projectId, prompt } : { id: jobId, prompt },
        });
        if (!active) return;
        setProgress(res.progress ?? 0);
        if (res.status === "failed") {
          toast.error(res.message ?? "Generation failed.");
          setJobId(null);
          return;
        }
        if (res.status === "completed") {
          setVideoUrl(res.url);
          setDonePrompt(prompt);
          setDoneModel(res.model);
          setJobId(null);
          toast.success("Your clip is ready.");
        }
      } catch (e) {
        if (!active) return;
        toast.error(e instanceof Error ? e.message : "Generation failed.");
        setJobId(null);
      }
    };
    const interval = setInterval(() => void run(), 7000);
    timer.current = interval;
    void run();
    return () => {
      active = false;
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [jobId, poll, projectId, prompt]);

  const generate = async () => {
    if (prompt.trim().length < 3) {
      toast.error("Describe the shot you want.");
      return;
    }
    setVideoUrl(null);
    setProgress(0);
    setElapsed(0);
    try {
      const job = await start({ data: { prompt, model, orientation, seconds } });
      setJobId(job.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start generation.");
    }
  };

  const addToTimeline = async () => {
    if (!projectId) {
      toast.error("Create a project first.");
      return;
    }
    setAdding(true);
    const { data, error } = await supabase
      .from("projects")
      .select("id,title,timeline_json")
      .eq("id", projectId)
      .maybeSingle();
    if (error || !data) {
      toast.error("Could not open that project.");
      setAdding(false);
      return;
    }
    const store = useEditor.getState();
    store.load(data.id, data.title, data.timeline_json as never);
    store.addClip("t-video", `AI · ${donePrompt.slice(0, 28) || "Generated clip"}`, Number(seconds));
    const present: TimelineState = useEditor.getState().present ?? starterTimeline();
    const { error: saveError } = await supabase
      .from("projects")
      .update({ timeline_json: present as never, duration_seconds: Math.round(timelineEnd(present)) })
      .eq("id", projectId);
    setAdding(false);
    if (saveError) {
      toast.error("Could not save to the timeline.");
      return;
    }
    toast.success("Added to the timeline.");
    void navigate({ to: "/editor/$projectId", params: { projectId } });
  };

  if (!entitled) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4">
        <div className="panel max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">AI Video is locked</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Generation is part of every paid plan. Activate a plan to start creating shots from text.
          </p>
          <button
            onClick={() => void navigate({ to: "/settings" })}
            className="mt-6 rounded-md bg-neon px-5 py-2.5 text-sm font-semibold text-neon-foreground"
          >
            View plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-md border border-neon/40 bg-neon/10 text-neon">
          <Wand2 className="size-4" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">AI Video</h1>
          <p className="text-sm text-muted-foreground">Describe a shot. Get a cinematic clip with sound.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* Prompt */}
        <div className="panel p-5">
          <label htmlFor="prompt" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
            rows={5}
            placeholder="A lone astronaut walking across a violet salt flat at dusk, slow tracking shot, volumetric light…"
            className="mt-2 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-neon/60"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                disabled={generating}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-neon/50 hover:text-foreground"
              >
                {p.slice(0, 28)}…
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">Format</span>
              <div className="mt-1.5 flex rounded-md border border-border p-0.5">
                {(["landscape", "portrait"] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    disabled={generating}
                    className={`flex-1 rounded px-2 py-1.5 text-xs capitalize transition-colors ${
                      orientation === o ? "bg-neon/15 text-neon" : "text-muted-foreground"
                    }`}
                  >
                    {o === "landscape" ? "16:9" : "9:16"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Length</span>
              <div className="mt-1.5 flex rounded-md border border-border p-0.5">
                {(["4", "6", "8"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeconds(s)}
                    disabled={generating}
                    className={`flex-1 rounded px-2 py-1.5 text-xs transition-colors ${
                      seconds === s ? "bg-neon/15 text-neon" : "text-muted-foreground"
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => void generate()}
            disabled={generating}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-neon px-5 py-3 text-sm font-semibold text-neon-foreground transition-opacity disabled:opacity-60"
          >
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {generating ? "Generating…" : "Generate video"}
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Generation usually takes 30–90 seconds.
          </p>
        </div>

        {/* Result */}
        <div className="panel flex min-h-[340px] flex-col p-5">
          {generating ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <div className="relative grid size-16 place-items-center rounded-full border border-neon/40 bg-neon/10">
                <Loader2 className="size-6 animate-spin text-neon" />
              </div>
              <div className="w-full max-w-sm">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className="h-full rounded-full bg-neon"
                    animate={{ width: `${Math.max(8, Math.min(progress || elapsed * 1.2, 96))}%` }}
                    transition={{ ease: "easeOut", duration: 0.6 }}
                  />
                </div>
                <p className="mt-3 text-sm text-foreground">Rendering your shot…</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {elapsed}s elapsed · keep this tab open
                </p>
              </div>
            </div>
          ) : videoUrl ? (
            <div className="flex flex-1 flex-col">
              <video
                src={videoUrl}
                controls
                playsInline
                className={`w-full rounded-lg border border-border bg-black ${
                  orientation === "portrait" ? "mx-auto max-h-[520px] w-auto" : ""
                }`}
              />
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{donePrompt}</p>
              <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-neon/60"
                  aria-label="Target project"
                >
                  {(projects ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => void addToTimeline()}
                  disabled={adding || !projectId}
                  className="flex items-center justify-center gap-2 rounded-md bg-magenta px-4 py-2.5 text-sm font-semibold text-magenta-foreground disabled:opacity-60"
                >
                  {adding ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                  Add to timeline
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Film className="size-8 opacity-50" />
              <p className="text-sm">Your generated clip will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
