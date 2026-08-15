import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { KeyRound, Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/app/Logo";
import { useAuth } from "@/hooks/useAuth";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).optional(),
  plan: z.enum(["starter", "creator", "pro", "studio"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — XAVIER CUT PRO" },
      { name: "description", content: "Sign in or create your Xavier Cut Pro account. Founder access codes accepted." },
      { property: "og:title", content: "Sign in — XAVIER CUT PRO" },
      { property: "og:description", content: "Members-only AI video editing studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, entitled, refreshProfile } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(search.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: entitled ? "/dashboard" : "/settings", replace: true });
  }, [user, entitled, navigate]);

  const redeem = async () => {
    if (!code.trim()) return false;
    try {
      await redeemAdminCode({ data: { code: code.trim() } });
    } catch {
      toast.error("That access code isn't valid.");
      return false;
    }
    await refreshProfile();
    toast.success("Founder tier unlocked. Welcome aboard.");
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() || parsed.data.email.split("@")[0] },
          },
        });
        if (error) throw error;
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          toast.success("Account created — check your email to confirm.");
          return;
        }
        const unlocked = code.trim() ? await redeem() : false;
        void navigate({ to: unlocked ? "/dashboard" : "/settings", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        if (code.trim()) await redeem();
        toast.success("Welcome back.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-hero-glow px-4 py-12">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="panel relative w-full max-w-md p-8"
      >
        <Logo />
        <h1 className="mt-8 text-3xl font-bold">
          {mode === "login" ? "Back to the bay" : "Get your seat"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to open your projects."
            : "Create an account, then pick a plan or redeem a Founder code."}
        </p>

        <div className="mt-6 flex rounded-md border border-border bg-stage p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
                mode === m ? "bg-neon text-neon-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && (
            <Field icon={UserIcon} label="Display name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Xavier"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </Field>
          )}
          <Field icon={Mail} label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              placeholder="you@studio.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </Field>
          <Field icon={Lock} label="Password">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={72}
              placeholder="At least 8 characters"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </Field>
          <Field icon={KeyRound} label="Access code (optional)" accent="gold">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={24}
              inputMode="numeric"
              placeholder="Founder code"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-neon px-4 py-3 font-semibold text-neon-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Xavier Cut Pro is members-only. <Link to="/" className="text-neon hover:underline">See plans</Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  accent = "neon",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent?: "neon" | "gold";
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <span
        className={`mt-1.5 flex items-center gap-3 rounded-md border border-border bg-stage px-3 py-2.5 transition-colors focus-within:border-${accent === "gold" ? "gold" : "neon"}/70`}
      >
        <Icon className={`size-4 ${accent === "gold" ? "text-gold" : "text-muted-foreground"}`} />
        {children}
      </span>
    </label>
  );
}
