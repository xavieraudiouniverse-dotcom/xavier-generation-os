import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/videos";
const FAL_QUEUE = "https://queue.fal.run";
// Seedance 2.0 on fal.ai; falls back to the 1.0 Pro endpoint if 2.0 isn't enabled on the account.
const SEEDANCE_MODELS = [
  "fal-ai/bytedance/seedance/v2/pro/text-to-video",
  "fal-ai/bytedance/seedance/v1/pro/text-to-video",
];

export type VideoModel = "veo" | "seedance";
export const MODEL_LABEL: Record<VideoModel, string> = {
  veo: "Veo 3 (Google)",
  seedance: "Seedance 2.0 (ByteDance)",
};

type Job = {
  id: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  progress?: number;
  error?: { code?: string; message?: string };
};

/** Job handles are "veo:<id>" or "seedance:<falModelPath>:<requestId>" so polling stays model-aware. */
function decodeHandle(handle: string): { model: VideoModel; falModel?: string; id: string } {
  if (handle.startsWith("seedance:")) {
    const rest = handle.slice("seedance:".length);
    const i = rest.lastIndexOf(":");
    return { model: "seedance", falModel: rest.slice(0, i), id: rest.slice(i + 1) };
  }
  return { model: "veo", id: handle.replace(/^veo:/, "") };
}

function falBase(falModel: string) {
  return falModel.split("/").slice(0, 2).join("/");
}

function safeName(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function startVeo(prompt: string, orientation: "landscape" | "portrait", seconds: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Veo is not configured on this project.");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/veo-3.1-lite",
      prompt,
      seconds,
      size: orientation === "portrait" ? "720x1280" : "1280x720",
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { message?: string } | null;
    if (res.status === 429) throw new Error("Veo is rate limited right now — wait for the current render to finish.");
    if (res.status === 402) throw new Error("Veo credits are exhausted. Add credits to keep generating.");
    throw new Error(err?.message ?? "Veo could not start this generation.");
  }
  const job = (await res.json()) as Job;
  return { id: `veo:${job.id}`, progress: job.progress ?? 0 };
}

async function startSeedance(prompt: string, orientation: "landscape" | "portrait", seconds: string) {
  const key = process.env["FAL_KEY"];
  if (!key) throw new Error("Seedance is not configured — add a fal.ai key to use it.");
  let lastMessage = "Seedance could not start this generation.";
  for (const model of SEEDANCE_MODELS) {
    const res = await fetch(`${FAL_QUEUE}/${model}`, {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        aspect_ratio: orientation === "portrait" ? "9:16" : "16:9",
        duration: seconds,
        resolution: "720p",
      }),
    });
    if (res.ok) {
      const job = (await res.json()) as { request_id?: string };
      if (!job.request_id) throw new Error("Seedance did not return a job id.");
      return { id: `seedance:${model}:${job.request_id}`, progress: 0 };
    }
    const body = (await res.json().catch(() => null)) as { detail?: unknown; error?: string } | null;
    const detail = typeof body?.detail === "string" ? body.detail : body?.error;
    if (res.status === 404) {
      lastMessage = detail ?? "Seedance 2.0 is not available on this fal.ai account.";
      continue; // try the next Seedance endpoint
    }
    if (res.status === 401 || res.status === 403) throw new Error("The fal.ai key was rejected. Check the FAL_KEY secret.");
    if (res.status === 429) throw new Error("Seedance is rate limited right now — try again in a moment.");
    if (res.status === 402) throw new Error("Your fal.ai balance is out of credits.");
    throw new Error(detail ?? "Seedance could not start this generation.");
  }
  throw new Error(lastMessage);
}

export const startVideoJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    prompt: string;
    model?: VideoModel;
    orientation?: "landscape" | "portrait";
    seconds?: "4" | "6" | "8";
  }) => {
    const prompt = (input?.prompt ?? "").trim();
    if (prompt.length < 3) throw new Error("Write a longer prompt.");
    return {
      prompt: prompt.slice(0, 1500),
      model: input.model === "seedance" ? ("seedance" as const) : ("veo" as const),
      orientation: input.orientation === "portrait" ? ("portrait" as const) : ("landscape" as const),
      seconds: input.seconds ?? ("8" as const),
    };
  })
  .handler(async ({ data }) => {
    // Only the selected provider is ever called, so a failure never consumes the other model's credits.
    const started =
      data.model === "seedance"
        ? await startSeedance(data.prompt, data.orientation, data.seconds)
        : await startVeo(data.prompt, data.orientation, data.seconds);
    return { id: started.id, model: data.model, status: "in_progress" as const, progress: started.progress };
  });

type PollResult = {
  status: "in_progress" | "completed" | "failed";
  model: VideoModel;
  message: string | null;
  url: string | null;
  path: string | null;
  progress: number;
};

export const pollVideoJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; projectId?: string; prompt?: string }) => {
    if (!input?.id) throw new Error("Missing job id.");
    return input;
  })
  .handler(async ({ data, context }): Promise<PollResult> => {
    const { model, falModel, id } = decodeHandle(data.id);
    let progress = 0;
    let download: { url: string; headers: Record<string, string> } | null = null;

    if (model === "veo") {
      const key = process.env["LOVABLE_API_KEY"];
      if (!key) throw new Error("Veo is not configured on this project.");
      const auth = { Authorization: `Bearer ${key}` };
      const jobRes = await fetch(`${GATEWAY}/${id}`, { headers: auth });
      if (!jobRes.ok) {
        return { status: "failed", model, message: "Veo lost track of this render. Try generating again.", url: null, path: null, progress: 100 };
      }
      const job = (await jobRes.json()) as Job;
      if (job.status === "failed") {
        return { status: "failed", model, message: job.error?.message ?? "Veo failed to render this shot.", url: null, path: null, progress: 100 };
      }
      if (job.status !== "completed") {
        return { status: "in_progress", model, message: null, url: null, path: null, progress: job.progress ?? 0 };
      }
      download = { url: `${GATEWAY}/${id}/content`, headers: auth };
      progress = 100;
    } else {
      const key = process.env["FAL_KEY"];
      if (!key) throw new Error("Seedance is not configured — add a fal.ai key to use it.");
      const auth = { Authorization: `Key ${key}` };
      const base = falBase(falModel ?? SEEDANCE_MODELS[0]!);
      const statusRes = await fetch(`${FAL_QUEUE}/${base}/requests/${id}/status`, { headers: auth });
      if (!statusRes.ok) {
        return { status: "failed", model, message: "fal.ai lost track of this render. Try generating again.", url: null, path: null, progress: 100 };
      }
      const st = (await statusRes.json()) as { status?: string; queue_position?: number };
      if (st.status !== "COMPLETED") {
        return {
          status: "in_progress",
          model,
          message: null,
          url: null,
          path: null,
          progress: st.status === "IN_PROGRESS" ? 60 : 15,
        };
      }
      const resultRes = await fetch(`${FAL_QUEUE}/${base}/requests/${id}`, { headers: auth });
      const result = (await resultRes.json().catch(() => null)) as { video?: { url?: string }; error?: string } | null;
      const videoUrl = result?.video?.url;
      if (!resultRes.ok || !videoUrl) {
        return { status: "failed", model, message: result?.error ?? "Seedance finished without returning a video.", url: null, path: null, progress: 100 };
      }
      download = { url: videoUrl, headers: {} };
      progress = 100;
    }

    const { supabase, userId } = context;
    const path = `${userId}/ai-video/${model}-${safeName(id)}.mp4`;

    const existing = await supabase.storage.from("media").createSignedUrl(path, 3600);
    if (!existing.data?.signedUrl) {
      const contentRes = await fetch(download.url, { headers: download.headers });
      if (!contentRes.ok) throw new Error("Could not download the generated video.");
      const bytes = await contentRes.arrayBuffer();
      const up = await supabase.storage.from("media").upload(path, bytes, { contentType: "video/mp4", upsert: true });
      if (up.error) throw new Error("Could not store the generated video.");
      if (data.projectId) {
        await supabase.from("media").insert({
          project_id: data.projectId,
          user_id: userId,
          name: (data.prompt ?? `AI video · ${MODEL_LABEL[model]}`).slice(0, 60),
          type: "video",
          url: path,
        });
      }
    }

    const signed = await supabase.storage.from("media").createSignedUrl(path, 3600);
    return { status: "completed", model, message: null, url: signed.data?.signedUrl ?? null, path, progress };
  });
