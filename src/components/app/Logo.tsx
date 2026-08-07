import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-md border border-border bg-stage">
        <span className="absolute inset-x-0 h-px bg-neon/70 animate-scan" />
        <span className="font-display text-sm font-bold text-gradient-neon">X</span>
      </span>
      <span className="font-display text-sm font-bold tracking-[0.22em] text-foreground">
        XAVIER<span className="text-neon"> CUT</span>
        <span className="text-muted-foreground"> PRO</span>
      </span>
    </Link>
  );
}
