import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ImageIcon, ArrowRight, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startImageJob, pollImageJob, IMAGE_MODEL_LABEL, type ImageSize } from "@/lib/flux.functions";
import { useEditor, timelineEnd, starterTimeline, type TimelineState } from "@/store/editor";

export const Route = createFileRoute("/_authenticated/ai-image")({
  head: () => ({
    meta: [
      { title: "AI Image Generator — Xavier Generation OS" },
      { name: "description", content: "Generate cinematic stills from a text prompt with FLUX, download them, or drop them onto your timeline as a static clip." },
      { property: "og:title", content: "AI Image Generator — Xavier Generation OS" },
      { property: "og:description", content: "Text to image in one prompt. Generate, download, and add to your project timeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiImage,
});

const PRESETS = [
  "Cinematic still of a rain-slicked neon street, anamorphic bokeh, teal and magenta grade",
  "Editorial portrait lit by a single gold rim light, deep black background, 85mm",
  "Vast desert dunes at blue hour, drone perspective, ultra wide, film grain",
];

const SIZES: { id: ImageSize; label: string }[] = [
  { id: "landscape_16_9", label: "16:9" },
  { id: "portrait_16_9", label: "9:16" },
  { id: "square_hd", label: "1:1" },
];

const STILL_SECONDS = 5;

function AiImage() {
  const navigate = useNavigate();
  const { profile, entitled } = useAuth();
  const start = useServerFn(startImageJob);
  const poll = useServerFn(pollImageJob);

  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<ImageSize>("landscape_16_9");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [donePrompt, setDonePrompt] = useState("");
  const [adding, setAdding] = useState(false);
  const [projectId, setProjectId] = useState<string>("");

  const { data: projects } = useQuery({
    queryKey: ["projects", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id,title").order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!projectId && projects?.length) setProjectId(projects[0]!.id);
  }, [projects, projectId]);

  const generating = !!jobId;

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    const run = async () => {
      try {
        const res = await poll({ data: projectId ? { id: jobId, projectId, prompt } : { id: jobId, prompt } });
        if (!active) return;
        setProgress(res.progress ?? 0);
        if (res.status === "failed") {
          toast.error(res.message ?? "Generation failed.");
          setJobId(null);
          return;
        }
        if (res.status === "completed") {
          setImageUrl(res.url);
          setDonePrompt(prompt);
          setJobId(null);
          toast.success("Your image is ready.");
        }
      } catch (e) {
        if (!active) return;
        toast.error(e instanceof Error ? e.message : "Generation failed.");
        setJobId(null);
      }
    };
    const interval = setInterval(() => void run(), 4000);
    void run();
    return () => {
      active = false;
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [jobId, poll, projectId, prompt]);

  const generate = async () => {
    if (prompt.trim().length < 3) {
      toast.error("Describe the image you want.");
      return;
    }
    setImageUrl(null);
    setProgress(0);
    setElapsed(0);
    try {
      const job = await start({ data: { prompt, size } });
      setJobId(job.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start generation.");
    }
  };

  const download = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `xavier-ai-image-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      toast.error("Could not download that image.");
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
    store.addClip("t-video", `Still · ${donePrompt.slice(0, 26) || "AI image"}`, STILL_SECONDS);
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
          <h1 className="text-2xl font-bold">AI Image is locked</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Generation is part of every paid plan. Activate a plan to start creating stills from text.
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
        <span className="grid size-9 place-items-center rounded-md border border-gold/40 bg-gold/10 text-gold">
          <ImageIcon className="size-4" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">AI Image</h1>
          <p className="text-sm text-muted-foreground">Describe a frame. Get a finished still.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="panel p-5">
          <label htmlFor="image-prompt" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Prompt
          </label>
          <textarea
            id="image-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
            rows={5}
            placeholder="A brutalist concrete tower at dusk, low fog, single sodium light, cinematic still…"
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

          <div className="mt-4">
            <span className="text-xs text-muted-foreground">Format</span>
            <div className="mt-1.5 flex rounded-md border border-border p-0.5">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  disabled={generating}
                  className={`flex-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    size === s.id ? "bg-neon/15 text-neon" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => void generate()}
            disabled={generating}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-neon px-5 py-3 text-sm font-semibold text-neon-foreground transition-opacity disabled:opacity-60"
          >
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {generating ? "Generating…" : "Generate image"}
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Rendered with {IMAGE_MODEL_LABEL}.</p>
        </div>

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
                    animate={{ width: `${Math.max(8, Math.min(progress || elapsed * 6, 96))}%` }}
                    transition={{ ease: "easeOut", duration: 0.6 }}
                  />
                </div>
                <p className="mt-3 text-sm text-foreground">Rendering with {IMAGE_MODEL_LABEL}…</p>
                <p className="mt-1 text-xs text-muted-foreground">{elapsed}s elapsed · keep this tab open</p>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="flex flex-1 flex-col">
              <img
                src={imageUrl}
                alt={donePrompt || "AI generated still"}
                className={`w-full rounded-lg border border-border bg-black object-contain ${
                  size === "portrait_16_9" ? "mx-auto max-h-[520px] w-auto" : ""
                }`}
              />
              <div className="mt-3 flex items-start gap-2">
                <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-gold">
                  {IMAGE_MODEL_LABEL}
                </span>
                <p className="line-clamp-2 text-xs text-muted-foreground">{donePrompt}</p>
              </div>
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
                  onClick={() => void download()}
                  className="flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-neon/50 hover:text-foreground"
                >
                  <Download className="size-4" />
                  Save
                </button>
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
              <ImageIcon className="size-8 opacity-50" />
              <p className="text-sm">Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
