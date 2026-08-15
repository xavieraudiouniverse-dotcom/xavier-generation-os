import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, LibraryBig, Settings, LogOut, Sparkles, Wand2, Image } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { TIER_LABEL } from "@/lib/pricing";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Projects", icon: LayoutGrid },
  { to: "/ai-video", label: "AI Video", icon: Wand2 },
  { to: "/ai-image", label: "AI Image", icon: Image },
  { to: "/templates", label: "Templates", icon: LibraryBig },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-stage/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-6 px-4 sm:px-6">
          <Logo to="/dashboard" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                activeProps={{ className: "bg-surface-2 text-foreground" }}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="size-4" />
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold sm:flex">
              <Sparkles className="size-3" />
              {TIER_LABEL[profile?.tier ?? "none"]}
            </span>
            <button
              onClick={async () => {
                await signOut();
                void navigate({ to: "/", replace: true });
              }}
              className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-magenta/60 hover:text-magenta"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <nav className="sticky bottom-0 z-40 flex border-t border-border bg-stage/95 backdrop-blur md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground"
            activeProps={{ className: "text-neon" }}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
