import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Pause, Undo2, Redo2, Scissors, Trash2, ZoomIn, ZoomOut, Magnet,
  Upload, Download, Save, Sparkles, Film, Sliders, ArrowLeft, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEditor, timelineEnd } from "@/store/editor";
import { Timeline } from "@/components/editor/Timeline";
import { AiPanel } from "@/components/editor/AiPanel";
import { Inspector } from "@/components/editor/Inspector";
import { ExportDialog } from "@/components/editor/ExportDialog";

export const Route = createFileRoute("/_authenticated/editor/$projectId")({
  head: () => ({
    meta: [
      { title: "Editor — XAVIER CUT PRO" },
      { name: "description", content: "Multi-track AI timeline editor with keyframes, speed ramps, beat detection and 4K export." },
      { property: "og:title", content: "Editor — XAVIER CUT PRO" },
      { property: "og:description", content: "The cinematic AI timeline. Cut, style, score and export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Editor,
});

type Tab = "media" | "ai" | "inspect";

function Editor() {
  const { projectId } = Route.useParams();
  const { profile, entitled, loading } = useAuth();
  const navigate = useNavigate();
  const editor = useEditor();
  const {
    present, title, playhead, zoom, snap, dirty, setPlayhead, setZoom, toggleSnap,
    undo, redo, splitAtPlayhead, rippleDelete, load, markSaved, setTitle,
  } = editor;

  const [tab, setTab] = useState<Tab>("ai");
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<{ id: string; name: string; kind: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const duration = Math.max(timelineEnd(present), 1);

  // Load project
  useEffect(() => {
    let active = true;
    void (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,title,timeline_json")
        .eq("id", projectId)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        toast.error("Project not found.");
        void navigate({ to: "/dashboard" });
        return;
      }
      load(data.id, data.title, data.timeline_json as never);
      setReady(true);
      const { data: m } = await supabase
        .from("media")
        .select("id,name,kind")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (active && m) setMedia(m);
    })();
    return () => {
      active = false;
    };
  }, [projectId, load, navigate]);

  const save = useRef(async (silent = false) => {});
  save.current = async (silent = false) => {
    const s = useEditor.getState();
    const { error } = await supabase
      .from("projects")
      .update({ title: s.title, timeline_json: s.present as never, duration_seconds: Math.round(timelineEnd(s.present)) })
      .eq("id", projectId);
    if (error) {
      toast.error("Save failed.");
      return;
    }
    markSaved();
    if (!silent) toast.success("Project saved.");
  };

  // Auto-save every 30s
  useEffect(() => {
    const i = setInterval(() => {
      if (useEditor.getState().dirty) void save.current(true);
    }, 30000);
    return () => clearInterval(i);
  }, []);

  // Playback
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = useEditor.getState().playhead + dt;
      if (next >= duration) {
        setPlayhead(0);
        setPlaying(false);
        return;
      }
      setPlayhead(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration, setPlayhead]);

  // Shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName?.match(/INPUT|TEXTAREA|SELECT/)) return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save.current();
      } else if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key.toLowerCase() === "s") {
        splitAtPlayhead();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        rippleDelete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, splitAtPlayhead, rippleDelete]);

  const upload = async (file: File) => {
    if (!profile) return;
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Files must be under 500MB.");
      return;
    }
    setUploading(true);
    const path = `${profile.id}/${projectId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast.error("Upload failed.");
      setUploading(false);
      return;
    }
    const kind = file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "image";
    const { data } = await supabase
      .from("media")
      .insert({ project_id: projectId, user_id: profile.id, name: file.name, kind, storage_path: path, size_bytes: file.size })
      .select("id,name,kind")
      .single();
    if (data) setMedia((m) => [data, ...m]);
    setUploading(false);
    toast.success(`${file.name} added to bin.`);
  };

  if (loading || !ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-neon" />
      </div>
    );
  }

  if (!entitled) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="panel max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">The editor is locked</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            XAVIER CUT PRO has no free tier. Activate a plan to open the timeline.
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

  const Tool = ({ onClick, icon: Icon, label, active }: { onClick: () => void; icon: typeof Play; label: string; active?: boolean }) => (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid size-8 place-items-center rounded-md border transition-colors ${
        active ? "border-neon bg-neon/15 text-neon" : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <button onClick={() => void navigate({ to: "/dashboard" })} aria-label="Back" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 80))}
          className="w-56 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-semibold outline-none hover:border-border focus:border-neon"
        />
        <span className="font-mono text-[10px] text-muted-foreground">{dirty ? "unsaved" : "saved"}</span>

        <div className="mx-auto flex items-center gap-1.5">
          <Tool onClick={undo} icon={Undo2} label="Undo" />
          <Tool onClick={redo} icon={Redo2} label="Redo" />
          <Tool onClick={splitAtPlayhead} icon={Scissors} label="Split (S)" />
          <Tool onClick={rippleDelete} icon={Trash2} label="Ripple delete" />
          <span className="mx-1 h-5 w-px bg-border" />
          <Tool onClick={() => setPlaying((p) => !p)} icon={playing ? Pause : Play} label="Play (Space)" active={playing} />
          <span className="mx-1 h-5 w-px bg-border" />
          <Tool onClick={() => setZoom(Math.max(16, zoom - 16))} icon={ZoomOut} label="Zoom out" />
          <Tool onClick={() => setZoom(Math.min(240, zoom + 16))} icon={ZoomIn} label="Zoom in" />
          <Tool onClick={toggleSnap} icon={Magnet} label="Magnetic snap" active={snap} />
        </div>

        <button
          onClick={() => void save.current()}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <Save className="size-3.5" /> Save
        </button>
        <button
          onClick={() => setExporting(true)}
          className="flex items-center gap-1.5 rounded-md bg-neon px-3 py-1.5 text-xs font-semibold text-neon-foreground transition-transform hover:scale-[1.03]"
        >
          <Download className="size-3.5" /> Export
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left rail */}
        <aside className="flex w-80 shrink-0 flex-col border-r border-border">
          <div className="flex border-b border-border">
            {([
              ["ai", "AI", Sparkles],
              ["media", "Media", Film],
              ["inspect", "Inspect", Sliders],
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
                  tab === id ? "border-b-2 border-neon text-neon" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {tab === "ai" && <AiPanel />}
            {tab === "inspect" && <Inspector />}
            {tab === "media" && (
              <div className="space-y-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*,audio/*,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-xs text-muted-foreground transition-colors hover:border-neon/60 hover:text-neon disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
                  {uploading ? "Uploading…" : "Upload video, audio or image"}
                </button>
                {media.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 rounded-md border border-border bg-surface p-2.5">
                    <Film className="size-3.5 text-neon" />
                    <span className="flex-1 truncate text-xs">{m.name}</span>
                    <button
                      onClick={() => {
                        useEditor.getState().addClip(m.kind === "audio" ? "t-audio" : "t-video", m.name, 5);
                        toast.success("Added to timeline.");
                      }}
                      className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:text-neon"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Stage + timeline */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="grid flex-1 place-items-center bg-stage p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-black"
            >
              <div className="absolute inset-0 bg-hero-glow opacity-60" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="font-mono text-xs text-neon">PREVIEW</p>
                  <p className="mt-2 text-2xl font-bold text-gradient-lux">{title}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {playhead.toFixed(2)}s / {duration.toFixed(2)}s · {present.clips.length} clips
                  </p>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/60">
                <div style={{ width: `${(playhead / duration) * 100}%` }} className="h-full bg-neon" />
              </div>
            </motion.div>
          </div>
          <Timeline />
        </main>
      </div>

      {exporting && (
        <ExportDialog projectId={projectId} tier={profile?.tier ?? "none"} onClose={() => setExporting(false)} />
      )}
    </div>
  );
}
