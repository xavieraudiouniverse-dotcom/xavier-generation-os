import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { redeemAdminCode } from "@/lib/admin-code.functions";
import { useAuth } from "@/hooks/useAuth";
import { PLANS, TIER_LABEL } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Billing — Xavier Generation OS" },
      { name: "description", content: "Manage your profile, subscription tier and Founder access code for Xavier Generation OS." },
      { property: "og:title", content: "Settings & Billing — Xavier Generation OS" },
      { property: "og:description", content: "Profile, plan and billing controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const saveProfile = async () => {
    if (!profile) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", profile.id);
    setBusy(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    await refreshProfile();
    toast.success("Profile updated.");
  };

  const redeem = async () => {
    setBusy(true);
    try {
      await redeemAdminCode({ data: { code: code.trim() } });
    } catch {
      setBusy(false);
      toast.error("That access code is not valid.");
      return;
    }
    setBusy(false);
    await refreshProfile();
    toast.success("Founder tier unlocked.");
    setCode("");
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground">Profile, plan and access.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-sm font-semibold">Profile</h2>
          <p className="mt-1 text-xs text-muted-foreground">{profile?.email}</p>
          <label htmlFor="dn" className="mt-4 block text-xs text-muted-foreground">Display name</label>
          <input
            id="dn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-neon/60"
          />
          <button
            onClick={() => void saveProfile()}
            disabled={busy}
            className="mt-4 rounded-md bg-neon px-4 py-2 text-sm font-semibold text-neon-foreground disabled:opacity-60"
          >
            Save
          </button>
        </div>

        <div className="panel p-5">
          <h2 className="text-sm font-semibold">Plan</h2>
          <p className="mt-2 flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-gold" />
            {TIER_LABEL[profile?.tier ?? "none"]}
            <span className="text-xs text-muted-foreground">· {profile?.subscription_status ?? "inactive"}</span>
          </p>
          <div className="mt-4 border-t border-border pt-4">
            <label htmlFor="code" className="text-xs text-muted-foreground">Founder access code</label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold/60"
              />
              <button
                onClick={() => void redeem()}
                disabled={busy || !code.trim()}
                className="flex items-center gap-2 rounded-md border border-gold/50 px-3 text-sm text-gold disabled:opacity-60"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                Redeem
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold">Plans</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`panel p-5 ${plan.highlight ? "border-neon/50" : ""}`}>
            <h3 className="text-sm font-semibold">{plan.name}</h3>
            <p className="mt-1 text-2xl font-bold">${plan.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              {plan.features.slice(0, 4).map((f) => (
                <li key={f} className="flex gap-2"><Check className="mt-0.5 size-3 text-neon" />{f}</li>
              ))}
            </ul>
            <button
              onClick={() => toast.info("Checkout is being connected — hang tight.")}
              className="mt-4 w-full rounded-md border border-border py-2 text-xs font-semibold transition-colors hover:border-neon/60 hover:text-neon"
            >
              {profile?.tier === plan.id ? "Current plan" : "Choose " + plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
