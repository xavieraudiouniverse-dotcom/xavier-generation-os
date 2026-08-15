/**
 * Client-side render pipeline: DOM rasterisation -> WebCodecs VideoEncoder -> MP4 muxing.
 * Everything runs in the user's browser, so no Remotion server rendering (and no
 * Remotion Company License) is involved.
 */
import { ArrayBufferTarget, Muxer } from "mp4-muxer";

export const webCodecsSupported = () =>
  typeof window !== "undefined" && typeof window.VideoEncoder === "function";

const SKIP = new Set(["cursor", "pointer-events", "transition", "animation", "will-change"]);

function inlineStyles(source: Element, clone: Element) {
  const computed = window.getComputedStyle(source);
  let css = "";
  for (let i = 0; i < computed.length; i++) {
    const prop = computed[i];
    if (!prop || SKIP.has(prop)) continue;
    css += `${prop}:${computed.getPropertyValue(prop)};`;
  }
  (clone as HTMLElement).setAttribute("style", css);
  const srcKids = Array.from(source.children);
  const cloneKids = Array.from(clone.children);
  srcKids.forEach((child, i) => {
    const target = cloneKids[i];
    if (target) inlineStyles(child, target);
  });
}

async function rasterize(el: HTMLElement, width: number, height: number, canvas: HTMLCanvasElement) {
  const clone = el.cloneNode(true) as HTMLElement;
  inlineStyles(el, clone);
  // Media elements can't be serialised into an SVG and make the canvas non-origin-clean.
  clone.querySelectorAll("audio, video, iframe, canvas, script, link").forEach((n) => n.remove());
  clone.style.width = `${el.clientWidth}px`;
  clone.style.height = `${el.clientHeight}px`;
  clone.style.transform = "none";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${el.clientWidth}" height="${el.clientHeight}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">${new XMLSerializer().serializeToString(clone)}</div>
    </foreignObject>
  </svg>`;

  // A data: URL keeps the canvas origin-clean; blob: SVGs are treated as tainted.
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Frame rasterisation failed"));
      img.src = url;
    });
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
  }
}

export type ExportArgs = {
  element: HTMLElement;
  seek: (frame: number) => void;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  onProgress?: (ratio: number) => void;
  signal?: AbortSignal;
};

export async function renderCompositionInBrowser({
  element,
  seek,
  width,
  height,
  fps,
  durationInFrames,
  onProgress,
  signal,
}: ExportArgs): Promise<Blob> {
  if (!webCodecsSupported()) {
    throw new Error("This browser has no WebCodecs support. Try Chrome or Edge.");
  }

  // Even dimensions are required by H.264.
  const w = width % 2 ? width - 1 : width;
  const h = height % 2 ? height - 1 : height;

  const candidates = [
    { codec: "avc1.640028", muxer: "avc" as const },
    { codec: "vp09.00.10.08", muxer: "vp9" as const },
  ];
  let chosen: { codec: string; muxer: "avc" | "vp9" } | null = null;
  for (const c of candidates) {
    const support = await window.VideoEncoder.isConfigSupported({
      codec: c.codec,
      width: w,
      height: h,
    });
    if (support.supported) {
      chosen = c;
      break;
    }
  }
  if (!chosen) throw new Error("No supported video codec in this browser.");

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: chosen.muxer, width: w, height: h },
    fastStart: "in-memory",
  });

  const encoder = new window.VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      throw e;
    },
  });
  encoder.configure({
    codec: chosen.codec,
    width: w,
    height: h,
    bitrate: 8_000_000,
    framerate: fps,
  });

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  for (let frame = 0; frame < durationInFrames; frame++) {
    if (signal?.aborted) {
      encoder.close();
      throw new Error("Render cancelled");
    }
    seek(frame);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await rasterize(element, w, h, canvas);

    const videoFrame = new window.VideoFrame(canvas, {
      timestamp: Math.round((frame / fps) * 1_000_000),
      duration: Math.round(1_000_000 / fps),
    });
    encoder.encode(videoFrame, { keyFrame: frame % (fps * 2) === 0 });
    videoFrame.close();
    if (encoder.encodeQueueSize > 8) {
      await encoder.flush();
    }
    onProgress?.((frame + 1) / durationInFrames);
  }

  await encoder.flush();
  encoder.close();
  muxer.finalize();
  const { buffer } = muxer.target as ArrayBufferTarget;
  return new Blob([buffer], { type: chosen.muxer === "avc" ? "video/mp4" : "video/webm" });
}
