import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Clock, Film, Loader2, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { starterTimeline } from "@/store/editor";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Projects — Xavier Generation OS" },
      { name: "description", content: "Your Xavier Generation OS edit bay: recent projects, new sequences and render history." },
      { property: "og:title", content: "Projects — Xavier Generation OS" },
      { property: "og:description", content: "Your Xavier Generation OS edit bay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const ACCENTS = ["neon", "magenta", "gold"] as const;

function Dashboard() {
  const { user, profile, entitled } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const projects = useQuery({
    queryKey: ["projects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,title,updated_at,duration_seconds,aspect_ratio")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user!.id,
          title: "Untitled Sequence",
          timeline_json: starterTimeline() as never,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      void qc.invalidateQueries({ queryKey: ["projects"] });
      void navigate({ to: "/editor/$projectId", params: { projectId: id } });
    },
    onError: () => toast.error("Couldn't create the project."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project deleted.");
      void qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="eyebrow">Edit bay</p>
          <h1 className="mt-2 text-4xl font-bold">
            Welcome back, <span className="text-gradient-neon">{profile?.display_name ?? "director"}</span>
          </h1>
        </div>
        <button
          onClick={() => (entitled ? create.mutate() : navigate({ to: "/settings" }))}
          disabled={create.isPending}
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-neon px-5 py-2.5 font-semibold text-neon-foreground glow-neon transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          New project
        </button>
      </div>

      {!entitled && (
        <div className="panel mt-8 flex flex-wrap items-center gap-4 border-gold/40 p-6">
          <Lock className="size-5 text-gold" />
          <p className="flex-1 text-sm text-muted-foreground">
            Your editor is locked. Activate a plan or redeem your Founder code to open the timeline.
          </p>
          <Link
            to="/settings"
            className="rounded-md border border-gold/60 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
          >
            Unlock editor
          </Link>
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-border bg-surface" />
          ))}

        {projects.data?.map((p, i) => {
          const accent = ACCENTS[i % 3];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-neon/60"
            >
              <Link to="/editor/$projectId" params={{ projectId: p.id }} className="block">
                <div
                  className={`relative grid h-36 place-items-center bg-stage ${
                    accent === "neon" ? "bg-neon/5" : accent === "magenta" ? "bg-magenta/5" : "bg-gold/5"
                  }`}
                >
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <Film
                    className={`size-8 ${accent === "neon" ? "text-neon" : accent === "magenta" ? "text-magenta" : "text-gold"}`}
                  />
                </div>
                <div className="p-4">
                  <h3 className="truncate font-semibold">{p.title}</h3>
                  <p className="mt-1.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {new Date(p.updated_at).toLocaleDateString()} · {p.aspect_ratio}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => remove.mutate(p.id)}
                aria-label="Delete project"
                className="absolute top-3 right-3 grid size-8 place-items-center rounded-md border border-border bg-stage/80 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-magenta"
              >
                <Trash2 className="size-4" />
              </button>
            </motion.div>
          );
        })}

        {projects.data?.length === 0 && (
          <button
            onClick={() => (entitled ? create.mutate() : navigate({ to: "/settings" }))}
            className="grid h-56 place-items-center rounded-xl border border-dashed border-border bg-surface/40 text-muted-foreground transition-colors hover:border-neon/60 hover:text-neon"
          >
            <span className="flex flex-col items-center gap-2">
              <Plus className="size-6" />
              Start your first sequence
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
