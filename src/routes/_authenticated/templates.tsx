import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Lock, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TIER_RANK, TIER_LABEL, type TierId } from "@/lib/pricing";
import { starterTimeline } from "@/store/editor";
import { RemotionGallery } from "@/components/templates/RemotionStudio";

export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({
    meta: [
      { title: "Template Library — Xavier Generation OS" },
      { name: "description", content: "Browse 1,000,000+ video templates across Social, Cinematic, Business, Gaming, Music and Fashion." },
      { property: "og:title", content: "Template Library — Xavier Generation OS" },
      { property: "og:description", content: "1M+ templates, filtered by platform, duration, style and mood." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Templates,
});

const CATEGORIES = ["All", "Social", "Cinematic", "Business", "Gaming", "Music", "Fashion"];
const PLATFORMS = ["All", "TikTok", "YouTube", "Instagram"];
const MOODS = ["All", "Energetic", "Moody", "Dreamy", "Aggressive", "Elegant", "Playful"];
const STYLES = ["All", "Modern", "Retro", "Neon", "Minimal", "Grunge", "Luxury"];
const DURATIONS = ["All", "Under 15s", "15–30s", "30s+"];

type Template = {
  id: string;
  name: string;
  category: string;
  platform: string;
  mood: string;
  style: string;
  duration_seconds: number;
  accent: string;
  tier_required: TierId;
};

function Chips({
  options, value, onChange, label,
}: { options: string[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              value === o
                ? "border-neon bg-neon/15 text-neon"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Templates() {
  const { profile, entitled } = useAuth();
  const navigate = useNavigate();
  const [engine, setEngine] = useState<"remotion" | "library">("remotion");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [mood, setMood] = useState("All");
  const [style, setStyle] = useState("All");
  const [duration, setDuration] = useState("All");

  const templates = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("id,name,category,platform,mood,style,duration_seconds,accent,tier_required")
        .order("name");
      if (error) throw error;
      return data as Template[];
    },
  });

  const projects = useQuery({
    queryKey: ["projects", "for-remotion"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,title")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as { id: string; title: string }[];
    },
  });

  const filtered = useMemo(() => {
    return (templates.data ?? []).filter((t) => {
      if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "All" && t.category !== cat) return false;
      if (platform !== "All" && t.platform !== platform && t.platform !== "All") return false;
      if (mood !== "All" && t.mood !== mood) return false;
      if (style !== "All" && t.style !== style) return false;
      if (duration === "Under 15s" && t.duration_seconds >= 15) return false;
      if (duration === "15–30s" && (t.duration_seconds < 15 || t.duration_seconds > 30)) return false;
      if (duration === "30s+" && t.duration_seconds <= 30) return false;
      return true;
    });
  }, [templates.data, q, cat, platform, mood, style, duration]);

  const useTemplate = async (t: Template) => {
    if (!entitled) {
      toast.error("Activate a plan to use templates.");
      void navigate({ to: "/settings" });
      return;
    }
    if (TIER_RANK[profile?.tier ?? "none"] < TIER_RANK[t.tier_required]) {
      toast.error(`${TIER_LABEL[t.tier_required]} plan required for this template.`);
      return;
    }
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: profile!.id,
        title: t.name,
        aspect_ratio: t.platform === "TikTok" ? "9:16" : t.platform === "Instagram" ? "4:5" : "16:9",
        timeline_json: starterTimeline() as never,
      })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Couldn't start from that template.");
      return;
    }
    toast.success("Template loaded.");
    void navigate({ to: "/editor/$projectId", params: { projectId: data.id } });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <p className="eyebrow">Library</p>
      <h1 className="mt-2 text-4xl font-bold">
        <span className="text-gradient-lux">1,000,000+</span> templates
      </h1>

      <div className="mt-6 flex w-fit gap-1 rounded-full border border-border bg-surface p-1">
        {(
          [
            ["remotion", "Remotion engine"],
            ["library", "Classic library"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setEngine(id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              engine === id ? "bg-neon text-neon-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {engine === "remotion" ? (
        <div className="mt-6">
          <RemotionGallery
            projects={projects.data ?? []}
            userName={profile?.display_name ?? ""}
          />
        </div>
      ) : (
      <>
      <div className="panel mt-8 space-y-5 p-5">
        <div className="flex items-center gap-3 rounded-md border border-border bg-stage px-3 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={80}
            placeholder="Search templates…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Chips label="Category" options={CATEGORIES} value={cat} onChange={setCat} />
          <Chips label="Platform" options={PLATFORMS} value={platform} onChange={setPlatform} />
          <Chips label="Duration" options={DURATIONS} value={duration} onChange={setDuration} />
          <Chips label="Mood" options={MOODS} value={mood} onChange={setMood} />
          <Chips label="Style" options={STYLES} value={style} onChange={setStyle} />
        </div>
      </div>

      <p className="mt-6 font-mono text-xs text-muted-foreground">
        {filtered.length} matching templates
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t, i) => {
          const locked = TIER_RANK[profile?.tier ?? "none"] < TIER_RANK[t.tier_required];
          const tone =
            t.accent === "magenta" ? "text-magenta bg-magenta/8" : t.accent === "gold" ? "text-gold bg-gold/8" : "text-neon bg-neon/8";
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 12) * 0.02 }}
              className="group overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-neon/60"
            >
              <div className={`relative grid h-32 place-items-center ${tone}`}>
                <div className="absolute inset-0 bg-grid opacity-30" />
                <Play className="size-7" />
                <span className="absolute bottom-2 right-2 rounded bg-stage/80 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {t.duration_seconds}s · {t.platform}
                </span>
              </div>
              <div className="p-4">
                <h3 className="truncate text-sm font-semibold">{t.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.style} · {t.mood}
                </p>
                <button
                  onClick={() => void useTemplate(t)}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    locked
                      ? "border border-border text-muted-foreground"
                      : "bg-neon text-neon-foreground hover:scale-[1.02]"
                  }`}
                >
                  {locked ? (
                    <>
                      <Lock className="size-3" /> {TIER_LABEL[t.tier_required]} required
                    </>
                  ) : (
                    "Use template"
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}
