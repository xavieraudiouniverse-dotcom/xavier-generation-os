import {
  Wand2,
  Palette,
  Captions,
  Scissors,
  Music4,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type AiTool = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  accent: "neon" | "magenta" | "gold";
  runLabel: string;
  duration: number;
};

export const AI_TOOLS: AiTool[] = [
  {
    id: "auto-edit",
    name: "AI Auto-Edit",
    description: "One click. Xavier watches your footage and cuts the story.",
    icon: Wand2,
    accent: "neon",
    runLabel: "Analyzing footage",
    duration: 3200,
  },
  {
    id: "style",
    name: "Style Transfer",
    description: "50+ looks — Ghibli, Nolan, Cyberpunk, Van Gogh and more.",
    icon: Palette,
    accent: "magenta",
    runLabel: "Rendering style pass",
    duration: 3800,
  },
  {
    id: "captions",
    name: "Auto Captions",
    description: "Transcribe and drop animated, beat-timed subtitles.",
    icon: Captions,
    accent: "gold",
    runLabel: "Transcribing audio",
    duration: 2600,
  },
  {
    id: "bg-remove",
    name: "Background Remover",
    description: "Instant green screen without the green screen.",
    icon: Scissors,
    accent: "neon",
    runLabel: "Matting subject",
    duration: 3000,
  },
  {
    id: "ai-music",
    name: "AI Music",
    description: "Describe a mood, get a scored track that fits your cut.",
    icon: Music4,
    accent: "magenta",
    runLabel: "Composing track",
    duration: 3400,
  },
  {
    id: "trends",
    name: "Trend Predictor",
    description: "What's about to blow up, by platform and format.",
    icon: TrendingUp,
    accent: "gold",
    runLabel: "Scanning 4.2M posts",
    duration: 2200,
  },
];

export const STYLE_PRESETS = [
  "Ghibli", "Nolan", "Cyberpunk", "Van Gogh", "Wes Anderson", "Blade Runner",
  "Kodak 2383", "Noir", "Fincher", "Villeneuve", "Vaporwave", "Anime Cel",
  "Super 8", "VHS", "Technicolor", "Bleach Bypass", "Teal & Orange", "Moonlight",
  "Sin City", "Matrix", "Dune", "Pixar", "Comic Ink", "Oil Paint",
  "Watercolor", "Pencil", "Neon Tokyo", "Miami 84", "Desert Gold", "Arctic",
  "Infrared", "Thermal", "Glitch", "Datamosh", "Halation", "Bloom",
  "Cross Process", "Polaroid", "Cinestill 800T", "Portra 400", "Ektachrome",
  "Grainy 16mm", "IMAX", "Dolby Vision", "Silver Halide", "Duotone",
  "Chromatic", "Holographic", "Prism", "Analog Dream", "Studio Ghibli Night",
];

export const AI_MUSIC_MOODS = [
  "Cinematic tension", "Lo-fi study", "Trap banger", "Epic orchestral",
  "Dreamy synthwave", "Corporate uplift", "Dark ambient", "Feel-good pop",
];

export const TREND_FEED = [
  { format: "Vertical POV cold open", platform: "TikTok", growth: 214, heat: "Peaking in 6 days" },
  { format: "Silent-hook text intro", platform: "Instagram", growth: 168, heat: "Rising fast" },
  { format: "Split-screen reaction", platform: "YouTube", growth: 132, heat: "Stable" },
  { format: "AI style-morph transition", platform: "TikTok", growth: 296, heat: "Explosive" },
  { format: "Micro-doc 60s", platform: "YouTube", growth: 87, heat: "Rising" },
  { format: "Product ASMR loop", platform: "Instagram", growth: 121, heat: "Peaking now" },
];

/** Mock AI executor with realistic latency. */
export function runMockAi<T>(payload: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(payload), ms));
}
