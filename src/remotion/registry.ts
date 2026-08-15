import type { TemplateComponent, TemplateProps } from "./props";
import { BounceStack, KaraokePop, TypewriterTerminal, WordHighlight } from "./compositions/captions";
import {
  GlitchSlice,
  GridZoomIntro,
  KineticSplit,
  LightSweepLowerThird,
  NeonTitleReveal,
} from "./compositions/effects";
import { BarSpectrum, RadialPulse, WaveformRibbon } from "./compositions/audio";
import { ProductTurntableCard, WebglProductScene } from "./compositions/product";
import { ReelCountdown, StatBurst, StoryQuote, TikTokHookCard } from "./compositions/social";

export type FieldKind = "text" | "textarea" | "number" | "color" | "select";

export type Field = {
  key: string;
  label: string;
  kind: FieldKind;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  /** Auto-filled from the user's project when the studio opens. */
  prefill?: "projectTitle" | "userName";
};

export type Source = {
  repo: string;
  url: string;
  license: "MIT" | "Unverified";
  note?: string;
};

export type RemotionTemplate = {
  id: string;
  name: string;
  category: "Captions" | "Effects" | "Audio" | "Product" | "Social";
  description: string;
  accent: "neon" | "magenta" | "gold";
  format: "16:9" | "9:16" | "1:1";
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  component: TemplateComponent;
  fields: Field[];
  defaults: TemplateProps;
  /** false = cannot be rendered/exported in-browser; needs a Remotion Company License. */
  clientRenderable: boolean;
  serverRenderReason?: string;
  source: Source;
};

const SRC = {
  captions: {
    repo: "ahgsql/remotion-subtitles",
    url: "https://github.com/ahgsql/remotion-subtitles",
    license: "MIT",
  },
  effects: {
    repo: "reactvideoeditor/remotion-templates",
    url: "https://github.com/reactvideoeditor/remotion-templates",
    license: "MIT",
  },
  audio: {
    repo: "marcusstenbeck/remotion-audio-visualizers",
    url: "https://github.com/marcusstenbeck/remotion-audio-visualizers",
    license: "MIT",
  },
  three: {
    repo: "remotion-dev/template-three",
    url: "https://github.com/remotion-dev/template-three",
    license: "MIT",
    note: "Remotion core is source-available; company licence applies to server rendering, not to these MIT template scenes.",
  },
  tiktok: {
    repo: "heyirfanaziz/remotion-tiktok",
    url: "https://github.com/heyirfanaziz/remotion-tiktok",
    license: "Unverified",
    note: "No LICENSE file published at time of integration — this template is an original re-implementation of the layout idea, not copied code.",
  },
} satisfies Record<string, Source>;

const COLOR = { key: "accent", label: "Accent", kind: "color" } as const;
const BG = { key: "background", label: "Background", kind: "color" } as const;
const SIZE = { key: "fontSize", label: "Font size", kind: "number", min: 20, max: 220, step: 2 } as const;

export const REMOTION_TEMPLATES: RemotionTemplate[] = [
  // ---------- Captions ----------
  {
    id: "cap-karaoke-pop",
    name: "Karaoke Pop",
    category: "Captions",
    description: "Word-by-word karaoke fill with a spring pop on each hit.",
    accent: "neon",
    format: "9:16",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 120,
    component: KaraokePop,
    fields: [
      { key: "text", label: "Caption", kind: "textarea", prefill: "projectTitle" },
      { key: "wordsPerSecond", label: "Words / sec", kind: "number", min: 0.5, max: 6, step: 0.1 },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { text: "Every frame is a decision", wordsPerSecond: 2.4, fontSize: 82, accent: "#00D4FF", background: "#080808" },
    clientRenderable: true,
    source: SRC.captions,
  },
  {
    id: "cap-word-highlight",
    name: "Word Highlight",
    category: "Captions",
    description: "One punchy word at a time inside a solid highlight box.",
    accent: "magenta",
    format: "9:16",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 120,
    component: WordHighlight,
    fields: [
      { key: "text", label: "Caption", kind: "textarea", prefill: "projectTitle" },
      { key: "wordsPerSecond", label: "Words / sec", kind: "number", min: 0.5, max: 6, step: 0.1 },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { text: "Cut faster. Ship sharper. Stay premium.", wordsPerSecond: 2.2, fontSize: 96, accent: "#FF006E", background: "#080808" },
    clientRenderable: true,
    source: SRC.captions,
  },
  {
    id: "cap-typewriter",
    name: "Typewriter Terminal",
    category: "Captions",
    description: "Monospace terminal line typed out with a blinking caret.",
    accent: "neon",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
    component: TypewriterTerminal,
    fields: [
      { key: "text", label: "Line", kind: "textarea", prefill: "projectTitle" },
      { key: "prefix", label: "Prompt symbol", kind: "text" },
      { key: "charsPerSecond", label: "Chars / sec", kind: "number", min: 4, max: 60, step: 1 },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { text: "rendering timeline // 4K // no watermark", prefix: "$", charsPerSecond: 22, fontSize: 46, accent: "#00D4FF", background: "#050507" },
    clientRenderable: true,
    source: SRC.captions,
  },
  {
    id: "cap-bounce-stack",
    name: "Bounce Stack",
    category: "Captions",
    description: "Stacked lines that bounce in with alternating accent colour.",
    accent: "gold",
    format: "9:16",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 110,
    component: BounceStack,
    fields: [
      { key: "text", label: "Lines (one per row)", kind: "textarea", prefill: "projectTitle" },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { text: "Premium\nAI editing\nfor creators", fontSize: 78, accent: "#FFD700", background: "#080808" },
    clientRenderable: true,
    source: SRC.captions,
  },

  // ---------- Effects ----------
  {
    id: "fx-neon-title",
    name: "Neon Title Reveal",
    category: "Effects",
    description: "Glowing hero title with eyebrow and underline wipe.",
    accent: "neon",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 120,
    component: NeonTitleReveal,
    fields: [
      { key: "title", label: "Title", kind: "text", prefill: "projectTitle" },
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { title: "Cut Like Cinema", eyebrow: "Xavier Generation OS", fontSize: 108, accent: "#00D4FF", background: "#080808" },
    clientRenderable: true,
    source: SRC.effects,
  },
  {
    id: "fx-glitch-slice",
    name: "Glitch Slice",
    category: "Effects",
    description: "RGB-split horizontal slices with per-frame jitter.",
    accent: "magenta",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 90,
    component: GlitchSlice,
    fields: [
      { key: "title", label: "Title", kind: "text", prefill: "projectTitle" },
      { key: "intensity", label: "Glitch intensity", kind: "number", min: 0, max: 60, step: 1 },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { title: "GLITCH", intensity: 18, fontSize: 130, accent: "#FF006E", background: "#050505" },
    clientRenderable: true,
    source: SRC.effects,
  },
  {
    id: "fx-kinetic-split",
    name: "Kinetic Split",
    category: "Effects",
    description: "Two words springing together from opposite edges.",
    accent: "gold",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 90,
    component: KineticSplit,
    fields: [
      { key: "left", label: "Left word", kind: "text" },
      { key: "right", label: "Right word", kind: "text", prefill: "projectTitle" },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { left: "MAKE", right: "MOTION", fontSize: 104, accent: "#FFD700", background: "#080808" },
    clientRenderable: true,
    source: SRC.effects,
  },
  {
    id: "fx-lower-third",
    name: "Light Sweep Lower Third",
    category: "Effects",
    description: "Glass lower third with a looping specular sweep.",
    accent: "neon",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
    component: LightSweepLowerThird,
    fields: [
      { key: "name", label: "Name", kind: "text", prefill: "userName" },
      { key: "role", label: "Role", kind: "text" },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { name: "Xavier Reyes", role: "Director of Photography", fontSize: 54, accent: "#00D4FF", background: "#080808" },
    clientRenderable: true,
    source: SRC.effects,
  },
  {
    id: "fx-grid-zoom",
    name: "Grid Zoom Intro",
    category: "Effects",
    description: "Perspective grid settling behind a hard-cut title.",
    accent: "neon",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 120,
    component: GridZoomIntro,
    fields: [
      { key: "title", label: "Title", kind: "text", prefill: "projectTitle" },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { title: "PROJECT ONE", fontSize: 96, accent: "#00D4FF", background: "#040406" },
    clientRenderable: true,
    source: SRC.effects,
  },

  // ---------- Audio ----------
  {
    id: "aud-bar-spectrum",
    name: "Bar Spectrum",
    category: "Audio",
    description: "Classic bottom-anchored spectrum bars with neon falloff.",
    accent: "neon",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
    component: BarSpectrum,
    fields: [
      { key: "title", label: "Title", kind: "text", prefill: "projectTitle" },
      { key: "bars", label: "Bars", kind: "number", min: 12, max: 96, step: 2 },
      { key: "energy", label: "Energy", kind: "number", min: 0.2, max: 2, step: 0.1 },
      { key: "speed", label: "Speed", kind: "number", min: 0.2, max: 3, step: 0.1 },
      COLOR,
      BG,
    ],
    defaults: { title: "Now Playing", bars: 48, energy: 1, speed: 1, accent: "#00D4FF", background: "#080808" },
    clientRenderable: true,
    source: SRC.audio,
  },
  {
    id: "aud-radial-pulse",
    name: "Radial Pulse",
    category: "Audio",
    description: "Circular spoke visualiser around a centred track label.",
    accent: "magenta",
    format: "1:1",
    width: 1080,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
    component: RadialPulse,
    fields: [
      { key: "title", label: "Label", kind: "text", prefill: "projectTitle" },
      { key: "bars", label: "Spokes", kind: "number", min: 16, max: 120, step: 4 },
      { key: "radius", label: "Radius", kind: "number", min: 120, max: 300, step: 10 },
      { key: "energy", label: "Energy", kind: "number", min: 0.2, max: 2, step: 0.1 },
      COLOR,
      BG,
    ],
    defaults: { title: "TRACK 01", bars: 64, radius: 190, energy: 1, speed: 1, accent: "#FF006E", background: "#050507" },
    clientRenderable: true,
    source: SRC.audio,
  },
  {
    id: "aud-waveform-ribbon",
    name: "Waveform Ribbon",
    category: "Audio",
    description: "Flowing SVG waveform ribbon with mono caption.",
    accent: "gold",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
    component: WaveformRibbon,
    fields: [
      { key: "title", label: "Title", kind: "text", prefill: "projectTitle" },
      { key: "subtitle", label: "Subtitle", kind: "text" },
      { key: "energy", label: "Amplitude", kind: "number", min: 0.2, max: 2, step: 0.1 },
      { key: "speed", label: "Speed", kind: "number", min: 0.2, max: 3, step: 0.1 },
      COLOR,
      BG,
    ],
    defaults: { title: "Master mix", subtitle: "Xavier Generation OS", energy: 1, speed: 1, accent: "#FFD700", background: "#080808" },
    clientRenderable: true,
    source: SRC.audio,
  },

  // ---------- Product ----------
  {
    id: "prod-turntable-card",
    name: "Product Turntable Card",
    category: "Product",
    description: "Spinning glass product card with optional image and price.",
    accent: "neon",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 180,
    component: ProductTurntableCard,
    fields: [
      { key: "title", label: "Product name", kind: "text", prefill: "projectTitle" },
      { key: "price", label: "Price", kind: "text" },
      { key: "imageUrl", label: "Image URL", kind: "text" },
      { key: "spinSpeed", label: "Spin speed", kind: "number", min: 0, max: 6, step: 0.2 },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { title: "Signature Series", price: "$249", imageUrl: "", spinSpeed: 1.6, fontSize: 62, accent: "#00D4FF", background: "#080808" },
    clientRenderable: true,
    source: SRC.three,
  },
  {
    id: "prod-webgl-scene",
    name: "3D Product Scene (WebGL)",
    category: "Product",
    description: "Lit glTF turntable with real reflections and shadows.",
    accent: "gold",
    format: "16:9",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 180,
    component: WebglProductScene,
    fields: [
      { key: "title", label: "Product name", kind: "text", prefill: "projectTitle" },
      COLOR,
      BG,
    ],
    defaults: { title: "3D Product Scene", accent: "#FFD700", background: "#050506" },
    clientRenderable: false,
    serverRenderReason:
      "Uses @remotion/three (WebGL canvas + glTF assets). The browser DOM exporter cannot capture WebGL frames deterministically, so a finished file needs server-side rendering — which requires a Remotion Company License ($100/mo minimum).",
    source: SRC.three,
  },

  // ---------- Social ----------
  {
    id: "soc-hook-card",
    name: "TikTok Hook Card",
    category: "Social",
    description: "Vertical hook card with eyebrow, headline and subtitle.",
    accent: "magenta",
    format: "9:16",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 110,
    component: TikTokHookCard,
    fields: [
      { key: "hook", label: "Hook", kind: "textarea", prefill: "projectTitle" },
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "subtitle", label: "Subtitle", kind: "text" },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { hook: "You edited this in 4 minutes", eyebrow: "POV", subtitle: "Swipe for the timeline", fontSize: 74, accent: "#FF006E", background: "#080808" },
    clientRenderable: true,
    source: SRC.tiktok,
  },
  {
    id: "soc-countdown",
    name: "Reel Countdown",
    category: "Social",
    description: "Big neon countdown for reel and short intros.",
    accent: "neon",
    format: "9:16",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 90,
    component: ReelCountdown,
    fields: [
      { key: "from", label: "Count from", kind: "number", min: 2, max: 9, step: 1 },
      { key: "label", label: "Label", kind: "text", prefill: "projectTitle" },
      COLOR,
      BG,
    ],
    defaults: { from: 3, label: "Drop incoming", accent: "#00D4FF", background: "#050505" },
    clientRenderable: true,
    source: SRC.tiktok,
  },
  {
    id: "soc-story-quote",
    name: "Story Quote",
    category: "Social",
    description: "Word-cascading quote card with attribution.",
    accent: "gold",
    format: "9:16",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 120,
    component: StoryQuote,
    fields: [
      { key: "quote", label: "Quote", kind: "textarea", prefill: "projectTitle" },
      { key: "author", label: "Author", kind: "text", prefill: "userName" },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { quote: "Taste is the last unfair advantage", author: "Xavier", fontSize: 68, accent: "#FFD700", background: "#080808" },
    clientRenderable: true,
    source: SRC.tiktok,
  },
  {
    id: "soc-stat-burst",
    name: "Stat Burst",
    category: "Social",
    description: "Counting stat with glow and mono caption.",
    accent: "neon",
    format: "1:1",
    width: 1080,
    height: 1080,
    fps: 30,
    durationInFrames: 110,
    component: StatBurst,
    fields: [
      { key: "value", label: "Value", kind: "number", min: 1, max: 10000000, step: 1 },
      { key: "prefix", label: "Prefix", kind: "text" },
      { key: "suffix", label: "Suffix", kind: "text" },
      { key: "label", label: "Caption", kind: "text", prefill: "projectTitle" },
      SIZE,
      COLOR,
      BG,
    ],
    defaults: { value: 1000000, prefix: "", suffix: "+", label: "TEMPLATES IN THE LIBRARY", fontSize: 130, accent: "#00D4FF", background: "#080808" },
    clientRenderable: true,
    source: SRC.tiktok,
  },
];

export const REMOTION_CATEGORIES = ["All", "Captions", "Effects", "Audio", "Product", "Social"] as const;
