import { create } from "zustand";

export type TrackKind = "video" | "audio" | "text" | "effects";

export type Keyframe = {
  t: number;
  position: number;
  scale: number;
  rotation: number;
  opacity: number;
};

export type Clip = {
  id: string;
  trackId: string;
  name: string;
  start: number;
  duration: number;
  speed: number;
  accent: "neon" | "magenta" | "gold";
  waveform?: number[] | undefined;
  keyframes: Keyframe[];
};

export type Track = {
  id: string;
  kind: TrackKind;
  name: string;
  muted: boolean;
  locked: boolean;
};

export type TimelineState = {
  tracks: Track[];
  clips: Clip[];
};

type EditorState = {
  projectId: string | null;
  title: string;
  present: TimelineState;
  past: TimelineState[];
  future: TimelineState[];
  playhead: number;
  zoom: number;
  snap: boolean;
  selectedClipId: string | null;
  dirty: boolean;
  lastSavedAt: number | null;
  beatMarkers: number[];

  load: (projectId: string, title: string, timeline?: Partial<TimelineState> | null) => void;
  setTitle: (title: string) => void;
  setPlayhead: (t: number) => void;
  setZoom: (z: number) => void;
  toggleSnap: () => void;
  select: (id: string | null) => void;
  addClip: (trackId: string, name: string, duration?: number) => void;
  moveClip: (id: string, start: number) => void;
  splitAtPlayhead: () => void;
  rippleDelete: () => void;
  setSpeed: (id: string, speed: number) => void;
  addKeyframe: (id: string, kf: Partial<Keyframe>) => void;
  updateKeyframe: (id: string, index: number, kf: Partial<Keyframe>) => void;
  toggleMute: (trackId: string) => void;
  toggleLock: (trackId: string) => void;
  detectBeats: () => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const DEFAULT_TRACKS: Track[] = [
  { id: "t-video", kind: "video", name: "V1 · Video", muted: false, locked: false },
  { id: "t-audio", kind: "audio", name: "A1 · Audio", muted: false, locked: false },
  { id: "t-text", kind: "text", name: "T1 · Text", muted: false, locked: false },
  { id: "t-fx", kind: "effects", name: "FX · Effects", muted: false, locked: false },
];

function waveform(seed: number, len = 48) {
  return Array.from({ length: len }, (_, i) => 0.25 + Math.abs(Math.sin((i + seed) * 0.7)) * 0.7);
}

const baseKeyframe: Keyframe = { t: 0, position: 0, scale: 100, rotation: 0, opacity: 100 };

export function starterTimeline(): TimelineState {
  return {
    tracks: DEFAULT_TRACKS,
    clips: [
      { id: uid(), trackId: "t-video", name: "Cold open.mp4", start: 0, duration: 6, speed: 1, accent: "neon", keyframes: [{ ...baseKeyframe }] },
      { id: uid(), trackId: "t-video", name: "B-roll city.mov", start: 6.5, duration: 5, speed: 1, accent: "neon", keyframes: [{ ...baseKeyframe }] },
      { id: uid(), trackId: "t-audio", name: "Score_theme.wav", start: 0, duration: 12, speed: 1, accent: "magenta", waveform: waveform(3), keyframes: [{ ...baseKeyframe }] },
      { id: uid(), trackId: "t-text", name: "Title card", start: 1, duration: 3, speed: 1, accent: "gold", keyframes: [{ ...baseKeyframe }] },
      { id: uid(), trackId: "t-fx", name: "Film grain", start: 0, duration: 12, speed: 1, accent: "gold", keyframes: [{ ...baseKeyframe }] },
    ],
  };
}

function snapshot(state: EditorState): Partial<EditorState> {
  return {
    past: [...state.past, state.present].slice(-60),
    future: [],
    dirty: true,
  };
}

export const useEditor = create<EditorState>((set, get) => ({
  projectId: null,
  title: "Untitled Project",
  present: starterTimeline(),
  past: [],
  future: [],
  playhead: 2,
  zoom: 64,
  snap: true,
  selectedClipId: null,
  dirty: false,
  lastSavedAt: null,
  beatMarkers: [],

  load: (projectId, title, timeline) =>
    set({
      projectId,
      title,
      present:
        timeline && Array.isArray(timeline.clips) && timeline.clips.length
          ? { tracks: timeline.tracks?.length ? timeline.tracks : DEFAULT_TRACKS, clips: timeline.clips }
          : starterTimeline(),
      past: [],
      future: [],
      dirty: false,
      selectedClipId: null,
    }),

  setTitle: (title) => set({ title, dirty: true }),
  setPlayhead: (t) => set({ playhead: Math.max(0, Math.round(t * 100) / 100) }),
  setZoom: (zoom) => set({ zoom }),
  toggleSnap: () => set((s) => ({ snap: !s.snap })),
  select: (selectedClipId) => set({ selectedClipId }),

  addClip: (trackId, name, duration = 4) =>
    set((s) => {
      const onTrack = s.present.clips.filter((c) => c.trackId === trackId);
      const start = onTrack.reduce((m, c) => Math.max(m, c.start + c.duration), 0);
      const accent = trackId === "t-audio" ? "magenta" : trackId === "t-video" ? "neon" : "gold";
      const clip: Clip = {
        id: uid(), trackId, name, start, duration, speed: 1, accent,
        waveform: trackId === "t-audio" ? waveform(name.length) : undefined,
        keyframes: [{ ...baseKeyframe }],
      };
      return { ...snapshot(s), present: { ...s.present, clips: [...s.present.clips, clip] }, selectedClipId: clip.id };
    }),

  moveClip: (id, start) =>
    set((s) => {
      const snapTo = (v: number) => (s.snap ? Math.round(v * 2) / 2 : Math.round(v * 100) / 100);
      return {
        ...snapshot(s),
        present: {
          ...s.present,
          clips: s.present.clips.map((c) => (c.id === id ? { ...c, start: Math.max(0, snapTo(start)) } : c)),
        },
      };
    }),

  splitAtPlayhead: () =>
    set((s) => {
      const p = s.playhead;
      const target = s.present.clips.find(
        (c) => c.id === s.selectedClipId && p > c.start + 0.1 && p < c.start + c.duration - 0.1,
      );
      if (!target) return {};
      const left: Clip = { ...target, duration: p - target.start };
      const right: Clip = { ...target, id: uid(), start: p, duration: target.start + target.duration - p };
      return {
        ...snapshot(s),
        present: {
          ...s.present,
          clips: s.present.clips.flatMap((c) => (c.id === target.id ? [left, right] : [c])),
        },
        selectedClipId: right.id,
      };
    }),

  rippleDelete: () =>
    set((s) => {
      const target = s.present.clips.find((c) => c.id === s.selectedClipId);
      if (!target) return {};
      const gap = target.duration;
      return {
        ...snapshot(s),
        present: {
          ...s.present,
          clips: s.present.clips
            .filter((c) => c.id !== target.id)
            .map((c) =>
              c.trackId === target.trackId && c.start > target.start ? { ...c, start: c.start - gap } : c,
            ),
        },
        selectedClipId: null,
      };
    }),

  setSpeed: (id, speed) =>
    set((s) => ({
      ...snapshot(s),
      present: {
        ...s.present,
        clips: s.present.clips.map((c) =>
          c.id === id ? { ...c, speed, duration: (c.duration * c.speed) / speed } : c,
        ),
      },
    })),

  addKeyframe: (id, kf) =>
    set((s) => ({
      ...snapshot(s),
      present: {
        ...s.present,
        clips: s.present.clips.map((c) =>
          c.id === id
            ? { ...c, keyframes: [...c.keyframes, { ...baseKeyframe, t: Math.max(0, s.playhead - c.start), ...kf }] }
            : c,
        ),
      },
    })),

  updateKeyframe: (id, index, kf) =>
    set((s) => ({
      ...snapshot(s),
      present: {
        ...s.present,
        clips: s.present.clips.map((c) =>
          c.id === id
            ? { ...c, keyframes: c.keyframes.map((k, i) => (i === index ? { ...k, ...kf } : k)) }
            : c,
        ),
      },
    })),

  toggleMute: (trackId) =>
    set((s) => ({
      present: { ...s.present, tracks: s.present.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)) },
      dirty: true,
    })),

  toggleLock: (trackId) =>
    set((s) => ({
      present: { ...s.present, tracks: s.present.tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)) },
      dirty: true,
    })),

  detectBeats: () => {
    const end = get().present.clips.reduce((m, c) => Math.max(m, c.start + c.duration), 12);
    const bpm = 124;
    const step = 60 / bpm;
    const markers: number[] = [];
    for (let t = 0; t < end; t += step) markers.push(Math.round(t * 100) / 100);
    set({ beatMarkers: markers });
  },

  undo: () =>
    set((s) => {
      const prev = s.past[s.past.length - 1];
      if (!prev) return {};
      return { past: s.past.slice(0, -1), present: prev, future: [s.present, ...s.future], dirty: true };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return {};
      return { past: [...s.past, s.present], present: next, future: s.future.slice(1), dirty: true };
    }),

  markSaved: () => set({ dirty: false, lastSavedAt: Date.now() }),
}));

export const timelineEnd = (t: TimelineState) =>
  t.clips.reduce((m, c) => Math.max(m, c.start + c.duration), 0);
