export const NEON = "#00D4FF";
export const MAGENTA = "#FF006E";
export const GOLD = "#FFD700";
export const INK = "#080808";
export const SURFACE = "#101014";

export const FONT_DISPLAY =
  '"Space Grotesk", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif';
export const FONT_MONO = 'ui-monospace, "JetBrains Mono", "SFMono-Regular", monospace';

export const accentOf = (accent: string) =>
  accent === "magenta" ? MAGENTA : accent === "gold" ? GOLD : NEON;

export const glow = (color: string, size = 40) =>
  `0 0 ${size / 2}px ${color}66, 0 0 ${size}px ${color}33`;

/** Deterministic pseudo-random in [0,1) — keeps every frame reproducible. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};
