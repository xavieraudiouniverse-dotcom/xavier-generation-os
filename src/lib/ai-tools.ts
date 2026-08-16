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
  /** Only tools marked "live" perform real work. Everything else is not shipped yet. */
  status: "live" | "coming-soon";
};

export const AI_TOOLS: AiTool[] = [
  {
    id: "auto-edit",
    name: "Quick Cut Helper",
    description:
      "Splits the clip under the playhead and marks tempo beats on the timeline. Rule-based — no footage analysis.",
    icon: Wand2,
    accent: "neon",
    runLabel: "Cutting timeline",
    status: "live",
  },
  {
    id: "style",
    name: "Style Transfer",
    description: "Cinematic look transfer across your footage. Not live yet.",
    icon: Palette,
    accent: "magenta",
    runLabel: "Rendering style pass",
    status: "coming-soon",
  },
  {
    id: "captions",
    name: "Auto Captions",
    description: "Transcribe audio and drop animated subtitles. Not live yet.",
    icon: Captions,
    accent: "gold",
    runLabel: "Transcribing audio",
    status: "coming-soon",
  },
  {
    id: "bg-remove",
    name: "Background Remover",
    description: "Subject matting without a green screen. Not live yet.",
    icon: Scissors,
    accent: "neon",
    runLabel: "Matting subject",
    status: "coming-soon",
  },
  {
    id: "ai-music",
    name: "AI Music",
    description: "Generate a scored track from a mood prompt. Not live yet.",
    icon: Music4,
    accent: "magenta",
    runLabel: "Composing track",
    status: "coming-soon",
  },
  {
    id: "trends",
    name: "Trend Predictor",
    description:
      "Platform-by-platform format forecasting. Not live yet — no trend data source is connected.",
    icon: TrendingUp,
    accent: "gold",
    runLabel: "Scanning posts",
    status: "coming-soon",
  },
];
