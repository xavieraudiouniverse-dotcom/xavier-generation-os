import { useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { motion } from "framer-motion";
import { AlertTriangle, Download, Loader2, Scale, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEditor, timelineEnd, starterTimeline, type TimelineState } from "@/store/editor";
import {
  REMOTION_CATEGORIES,
  REMOTION_TEMPLATES,
  type RemotionTemplate,
} from "@/remotion/registry";
import type { TemplateProps } from "@/remotion/props";
import { renderCompositionInBrowser, webCodecsSupported } from "@/lib/remotion-export";

type ProjectOption = { id: string; title: string };

function prefill(t: RemotionTemplate, projectTitle: string, userName: string): TemplateProps {
  const next: TemplateProps = { ...t.defaults };
  for (const f of t.fields) {
    if (f.prefill === "projectTitle" && projectTitle) next[f.key] = projectTitle;
    if (f.prefill === "userName" && userName) next[f.key] = userName;
  }
  return next;
}

function PreviewPlayer({
  template,
  props,
  playerRef,
  containerRef,
  controls,
}: {
  template: RemotionTemplate;
  props: TemplateProps;
  playerRef?: React.RefObject<PlayerRef | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  controls?: boolean;
}) {
  const showControls = controls ?? false;
  return (
    <div ref={containerRef} className="h-full w-full">
      <Player
        ref={playerRef ?? undefined}
        acknowledgeRemotionLicense
        component={template.component}
        inputProps={props}
        durationInFrames={template.durationInFrames}
        fps={template.fps}
        compositionWidth={template.width}
        compositionHeight={template.height}
        style={{ width: "100%", height: "100%" }}
        controls={showControls}
        loop
        autoPlay={!showControls}
        {...(showControls ? {} : { initiallyMuted: true })}
      />
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: RemotionTemplate["fields"][number];
  value: unknown;
  onChange: (v: string | number) => void;
}) {
  const common =
    "w-full rounded-md border border-border bg-stage px-3 py-2 text-sm outline-none focus:border-neon/60";
  return (
    <label className="block">
      <span className="eyebrow">{field.label}</span>
      <div className="mt-1.5">
        {field.kind === "textarea" ? (
          <textarea
            className={`${common} min-h-[76px] resize-y`}
            value={String(value ?? "")}
            maxLength={240}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : field.kind === "color" ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="size-9 cursor-pointer rounded border border-border bg-stage"
              value={String(value ?? "#00D4FF")}
              onChange={(e) => onChange(e.target.value)}
            />
            <input
              className={common}
              value={String(value ?? "")}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        ) : field.kind === "number" ? (
          <input
            type="number"
            className={common}
            value={Number(value ?? 0)}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        ) : (
          <input
            className={common}
            value={String(value ?? "")}
            maxLength={120}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </label>
  );
}

function Studio({
  template,
  projects,
  projectTitle,
  userName,
  onClose,
}: {
  template: RemotionTemplate;
  projects: ProjectOption[];
  projectTitle: string;
  userName: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [props, setProps] = useState<TemplateProps>(() => prefill(template, projectTitle, userName));
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [adding, setAdding] = useState(false);
  const playerRef = useRef<PlayerRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const seconds = template.durationInFrames / template.fps;

  const renderInBrowser = async () => {
    if (!template.clientRenderable) return;
    const host = containerRef.current?.querySelector("div");
    if (!host) return;
    setRendering(true);
    setProgress(0);
    try {
      playerRef.current?.pause();
      const blob = await renderCompositionInBrowser({
        element: host as HTMLElement,
        seek: (f) => playerRef.current?.seekTo(f),
        width: template.width,
        height: template.height,
        fps: template.fps,
        durationInFrames: template.durationInFrames,
        onProgress: setProgress,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.id}-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Rendered in your browser — no server needed.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Browser render failed.");
    } finally {
      setRendering(false);
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
    const track = template.category === "Captions" ? "t-text" : template.category === "Audio" ? "t-fx" : "t-video";
    store.addClip(track, `${template.name} · Remotion`, Number(seconds.toFixed(2)));
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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-3 backdrop-blur-sm">
      <div className="panel flex max-h-[92vh] w-full max-w-[1200px] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <Sparkles className="size-4 text-neon" />
          <h2 className="text-sm font-semibold">{template.name}</h2>
          <span className="font-mono text-[11px] text-muted-foreground">
            {template.format} · {seconds.toFixed(1)}s · {template.fps}fps
          </span>
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div
              className="overflow-hidden rounded-xl border border-border bg-black"
              style={{ aspectRatio: `${template.width} / ${template.height}`, maxHeight: "56vh", margin: "0 auto" }}
            >
              <PreviewPlayer
                template={template}
                props={props}
                playerRef={playerRef}
                containerRef={containerRef}
                controls
              />
            </div>

            {!template.clientRenderable && (
              <div className="mt-4 flex gap-3 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-gold">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <strong>Server rendering required.</strong> {template.serverRenderReason} Preview and
                  prop editing still work; export is disabled until a company licence is in place.
                </div>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground">
              <Scale className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Based on {template.source.repo} · licence: {template.source.license}
                {template.source.note ? ` — ${template.source.note}` : ""}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              {template.fields.map((f) => (
                <Field
                  key={f.key}
                  field={f}
                  value={props[f.key]}
                  onChange={(v) => setProps((p) => ({ ...p, [f.key]: v }))}
                />
              ))}
            </div>

            {projects.length > 0 && (
              <label className="block">
                <span className="eyebrow">Project</span>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-stage px-3 py-2 text-sm outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {rendering && (
              <div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-neon transition-all" style={{ width: `${progress * 100}%` }} />
                </div>
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                  Encoding in your browser · {Math.round(progress * 100)}%
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => void addToTimeline()}
                disabled={adding}
                className="flex items-center justify-center gap-2 rounded-md bg-neon px-4 py-2.5 text-sm font-semibold text-neon-foreground disabled:opacity-60"
              >
                {adding ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Add to timeline
              </button>
              <button
                onClick={() => void renderInBrowser()}
                disabled={rendering || !template.clientRenderable || !webCodecsSupported()}
                className="flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground disabled:opacity-40"
              >
                <Download className="size-4" />
                {webCodecsSupported() ? "Render in browser (WebCodecs)" : "WebCodecs unsupported"}
              </button>
              <button
                onClick={() => setProps(prefill(template, projectTitle, userName))}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset to project content
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RemotionGallery({
  projects,
  userName,
}: {
  projects: ProjectOption[];
  userName: string;
}) {
  const [cat, setCat] = useState<string>("All");
  const [open, setOpen] = useState<RemotionTemplate | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const projectTitle = projects[0]?.title ?? "";
  const list = useMemo(
    () => REMOTION_TEMPLATES.filter((t) => cat === "All" || t.category === cat),
    [cat],
  );

  return (
    <div>
      <div className="panel flex flex-wrap items-center gap-2 p-4">
        {REMOTION_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              cat === c ? "border-neon bg-neon/15 text-neon" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          {list.length} Remotion compositions · rendered in your browser
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.03 }}
            onClick={() => setOpen(t)}
            className="group overflow-hidden rounded-xl border border-border bg-surface text-left transition-colors hover:border-neon/60"
          >
            <div className="relative bg-black" style={{ aspectRatio: "16 / 9" }}>
              {mounted ? (
                <div className="absolute inset-0 grid place-items-center">
                  <div style={{ aspectRatio: `${t.width} / ${t.height}`, height: "100%" }}>
                    <PreviewPlayer template={t} props={t.defaults} />
                  </div>
                </div>
              ) : null}
              {!t.clientRenderable && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
                  <AlertTriangle className="size-3" /> Server render
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold">{t.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground/80">
                {t.category} · {t.format} · {t.source.license}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {open && (
        <Studio
          template={open}
          projects={projects}
          projectTitle={projectTitle}
          userName={userName}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
