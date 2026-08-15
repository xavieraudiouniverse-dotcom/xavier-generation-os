import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Play, Scissors, Layers, Gauge, KeyRound, Check, Film, Zap, Globe,
} from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { PLANS } from "@/lib/pricing";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Xavier Generation OS — Premium AI Video Editing Studio" },
      {
        name: "description",
        content:
          "Premium AI video editing studio with a multi-track timeline, 18 Remotion templates, AI video and image generation, and 4K export. Members-only plans from $4.99/mo.",
      },
      { property: "og:title", content: "Xavier Generation OS — Premium AI Video Editing Studio" },
      {
        property: "og:description",
        content:
          "Premium AI video editing studio with a multi-track timeline, 18 Remotion templates, AI video and image generation, and 4K export. Members-only plans from $4.99/mo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const accentRing: Record<string, string> = {
  neon: "border-neon/40 hover:border-neon/80 hover:glow-neon",
  magenta: "border-magenta/40 hover:border-magenta/80 hover:glow-magenta",
  gold: "border-gold/40 hover:border-gold/80",
};
const accentText: Record<string, string> = {
  neon: "text-neon",
  magenta: "text-magenta",
  gold: "text-gold",
};

const FEATURES = [
  { icon: Layers, title: "Multi-track timeline", body: "Video, audio, text and effects lanes with magnetic snap and ripple delete.", accent: "neon" },
  { icon: Scissors, title: "Razor-fast trimming", body: "Split at playhead, ripple edits, speed ramps and full keyframe control.", accent: "magenta" },
  { icon: Gauge, title: "Audio waveforms", body: "Waveform lanes with beat markers so every cut lands on the grid.", accent: "gold" },
  { icon: Film, title: "18 Remotion templates", body: "Captions, effects, audio visualisers, product and social — editable props, live preview.", accent: "neon" },
  { icon: Zap, title: "AI video + image", body: "Generate clips with Veo 3 or Seedance 2.0 and stills with FLUX, straight into your timeline.", accent: "magenta" },
  { icon: Globe, title: "Platform presets", body: "TikTok 9:16, YouTube 16:9, Instagram 1:1 — exported up to 4K.", accent: "gold" },
];

const AI_FEATURES = [
  {
    id: "ai-video",
    name: "AI Video",
    description: "Text-to-video with Veo 3 (Google) or Seedance 2.0 (ByteDance), saved to your media bin.",
    icon: Film,
    accent: "neon",
  },
  {
    id: "ai-image",
    name: "AI Image",
    description: "FLUX text-to-image in 16:9, 9:16 or 1:1 — download it or drop it on the timeline.",
    icon: Zap,
    accent: "magenta",
  },
  {
    id: "templates",
    name: "Template studio",
    description: "Remotion compositions rendered in your browser, with props prefilled from your project.",
    icon: Layers,
    accent: "gold",
  },
];

function Landing() {
  const { user, entitled } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-stage/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <Logo />
          <nav className="ml-auto hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#ai" className="transition-colors hover:text-foreground">AI Tools</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-7">
            <Link
              to={entitled ? "/dashboard" : "/auth"}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
            <Link
              to="/auth"
              search={{ mode: "register" as const }}
              className="rounded-md bg-neon px-4 py-2 text-sm font-semibold text-neon-foreground transition-transform hover:scale-[1.03]"
            >
              Get access
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-glow">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="eyebrow">Members only · No free tier</p>
            <h1 className="mt-5 text-5xl leading-[0.95] font-bold sm:text-7xl">
              Cut like a<br />
              <span className="text-gradient-neon">Hollywood director.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              XAVIER CUT PRO is an AI editing suite built for people who ship. Multi-track
              timeline, a million templates, and AI passes that finish the cut while you
              watch.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                search={{ mode: "register" as const }}
                className="group inline-flex items-center gap-2 rounded-md bg-neon px-6 py-3 font-semibold text-neon-foreground glow-neon transition-transform hover:scale-[1.03]"
              >
                Start editing
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 font-medium text-foreground transition-colors hover:border-magenta/70 hover:text-magenta"
              >
                <Play className="size-4" />
                See the plans
              </a>
              <span className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
                <KeyRound className="size-4" />
                Founder code unlocks everything
              </span>
            </div>

            <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["1M+", "Templates"],
                ["12K", "Max export"],
                ["6", "AI engines"],
                ["30s", "Auto-save"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-bold text-foreground">{v}</dt>
                  <dd className="eyebrow mt-1">{l}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Timeline mock */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="panel mt-20 overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="size-2.5 rounded-full bg-magenta" />
              <span className="size-2.5 rounded-full bg-gold" />
              <span className="size-2.5 rounded-full bg-neon" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                sequence_01 · 00:00:12:04 · 4K · 23.976
              </span>
            </div>
            <div className="space-y-2 p-4">
              {[
                { w: ["28%", "22%", "34%"], c: "neon" },
                { w: ["70%", "18%"], c: "magenta" },
                { w: ["14%", "30%", "20%"], c: "gold" },
                { w: ["88%"], c: "neon" },
              ].map((row, i) => (
                <div key={i} className="flex gap-2">
                  {row.w.map((w, j) => (
                    <motion.div
                      key={j}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.1 + j * 0.06 }}
                      style={{ width: w }}
                      className={`h-9 rounded border ${
                        row.c === "neon"
                          ? "border-neon/50 bg-neon/15"
                          : row.c === "magenta"
                            ? "border-magenta/50 bg-magenta/15"
                            : "border-gold/50 bg-gold/15"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">The suite</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">
            Everything a full edit bay does. None of the waiting.
          </h2>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`rounded-xl border bg-surface p-6 transition-all duration-300 ${accentRing[f.accent]}`}
              >
                <f.icon className={`size-6 ${accentText[f.accent]}`} />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="relative overflow-hidden border-t border-border py-24">
        <div className="absolute inset-0 bg-hero-glow opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Six AI engines</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">
            <span className="text-gradient-lux">Director-grade</span> automation.
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className={`group rounded-xl border bg-stage/70 p-6 backdrop-blur transition-all duration-300 ${accentRing[t.accent]}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`grid size-10 place-items-center rounded-lg border border-border bg-surface ${accentText[t.accent]}`}>
                    <t.icon className="size-5" />
                  </span>
                  <h3 className="font-semibold">{t.name}</h3>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{t.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">Pick your rig.</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            No free tier — every plan is a working studio. Cancel anytime from your
            billing settings.
          </p>

          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            {PLANS.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={`relative flex flex-col rounded-xl border bg-surface p-6 transition-all duration-300 ${
                  p.highlight ? "border-magenta/70 glow-magenta" : accentRing[p.accent]
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-magenta px-3 py-1 text-[11px] font-semibold text-magenta-foreground">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">${p.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check className={`mt-0.5 size-4 shrink-0 ${accentText[p.accent]}`} />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  search={{ mode: "register" as const, plan: p.id }}
                  className={`mt-7 rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-transform hover:scale-[1.03] ${
                    p.highlight
                      ? "bg-magenta text-magenta-foreground"
                      : "border border-border bg-surface-2 text-foreground"
                  }`}
                >
                  Choose {p.name}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="panel mt-8 flex flex-wrap items-center gap-4 p-6">
            <KeyRound className="size-6 text-gold" />
            <div className="flex-1">
              <h3 className="font-semibold text-gold">Have a Founder access code?</h3>
              <p className="text-sm text-muted-foreground">
                Enter it on the register screen to unlock the Founder tier — every tool,
                unlimited AI, no billing.
              </p>
            </div>
            <Link
              to="/auth"
              search={{ mode: "register" as const }}
              className="rounded-md border border-gold/60 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
            >
              Redeem code
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 sm:px-6">
          <Logo />
          <p className="ml-auto text-xs text-muted-foreground">
            © {new Date().getFullYear()} Xavier Cut Pro. Cut fast. Ship faster.
          </p>
        </div>
      </footer>
    </div>
  );
}
