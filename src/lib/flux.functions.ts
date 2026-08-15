import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FAL_QUEUE = "https://queue.fal.run";
// FLUX.1 [dev] is the strong general-purpose default; fall back to schnell if dev isn't enabled.
const FLUX_MODELS = ["fal-ai/flux/dev", "fal-ai/flux/schnell"];

export const IMAGE_MODEL_LABEL = "FLUX.1 (fal.ai)";

export type ImageSize = "landscape_16_9" | "portrait_16_9" | "square_hd";

function safeName(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function falBase(model: string) {
  return model.split("/").slice(0, 2).join("/");
}

/** Handles are "<falModelPath>:<requestId>". */
function decodeHandle(handle: string) {
  const i = handle.lastIndexOf(":");
  return { falModel: handle.slice(0, i), id: handle.slice(i + 1) };
}

export const startImageJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { prompt: string; size?: ImageSize }) => {
    const prompt = (input?.prompt ?? "").trim();
    if (prompt.length < 3) throw new Error("Write a longer prompt.");
    const allowed: ImageSize[] = ["landscape_16_9", "portrait_16_9", "square_hd"];
    return {
      prompt: prompt.slice(0, 1500),
      size: allowed.includes(input?.size as ImageSize) ? (input.size as ImageSize) : ("landscape_16_9" as ImageSize),
    };
  })
  .handler(async ({ data }) => {
    const key = process.env["FAL_KEY"];
    if (!key) throw new Error("Image generation is not configured — add a fal.ai key to use it.");
    let lastMessage = "FLUX could not start this generation.";
    for (const model of FLUX_MODELS) {
      const res = await fetch(`${FAL_QUEUE}/${model}`, {
        method: "POST",
        headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: data.prompt,
          image_size: data.size,
          num_images: 1,
          enable_safety_checker: true,
        }),
      });
      if (res.ok) {
        const job = (await res.json()) as { request_id?: string };
        if (!job.request_id) throw new Error("fal.ai did not return a job id.");
        return { id: `${model}:${job.request_id}`, status: "in_progress" as const };
      }
      const body = (await res.json().catch(() => null)) as { detail?: unknown; error?: string } | null;
      const detail = typeof body?.detail === "string" ? body.detail : body?.error;
      if (res.status === 404) {
        lastMessage = detail ?? "That FLUX endpoint is not available on this fal.ai account.";
        continue;
      }
      if (res.status === 401 || res.status === 403) throw new Error("The fal.ai key was rejected. Check the FAL_KEY secret.");
      if (res.status === 429) throw new Error("fal.ai is rate limited right now — try again in a moment.");
      if (res.status === 402) throw new Error("Your fal.ai balance is out of credits.");
      throw new Error(detail ?? "FLUX could not start this generation.");
    }
    throw new Error(lastMessage);
  });

type PollResult = {
  status: "in_progress" | "completed" | "failed";
  message: string | null;
  url: string | null;
  path: string | null;
  progress: number;
};

export const pollImageJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; projectId?: string; prompt?: string }) => {
    if (!input?.id) throw new Error("Missing job id.");
    return input;
  })
  .handler(async ({ data, context }): Promise<PollResult> => {
    const key = process.env["FAL_KEY"];
    if (!key) throw new Error("Image generation is not configured — add a fal.ai key to use it.");
    const { falModel, id } = decodeHandle(data.id);
    const auth = { Authorization: `Key ${key}` };
    const base = falBase(falModel);

    const statusRes = await fetch(`${FAL_QUEUE}/${base}/requests/${id}/status`, { headers: auth });
    if (!statusRes.ok) {
      return { status: "failed", message: "fal.ai lost track of this render. Try generating again.", url: null, path: null, progress: 100 };
    }
    const st = (await statusRes.json()) as { status?: string };
    if (st.status !== "COMPLETED") {
      return { status: "in_progress", message: null, url: null, path: null, progress: st.status === "IN_PROGRESS" ? 65 : 20 };
    }

    const resultRes = await fetch(`${FAL_QUEUE}/${base}/requests/${id}`, { headers: auth });
    const result = (await resultRes.json().catch(() => null)) as
      | { images?: { url?: string; content_type?: string }[]; error?: string }
      | null;
    const image = result?.images?.[0];
    if (!resultRes.ok || !image?.url) {
      return { status: "failed", message: result?.error ?? "FLUX finished without returning an image.", url: null, path: null, progress: 100 };
    }

    const contentType = image.content_type ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const { supabase, userId } = context;
    const path = `${userId}/ai-image/flux-${safeName(id)}.${ext}`;

    const existing = await supabase.storage.from("media").createSignedUrl(path, 3600);
    if (!existing.data?.signedUrl) {
      const contentRes = await fetch(image.url);
      if (!contentRes.ok) throw new Error("Could not download the generated image.");
      const bytes = await contentRes.arrayBuffer();
      const up = await supabase.storage.from("media").upload(path, bytes, { contentType, upsert: true });
      if (up.error) throw new Error("Could not store the generated image.");
      if (data.projectId) {
        await supabase.from("media").insert({
          project_id: data.projectId,
          user_id: userId,
          name: (data.prompt ?? "AI image").slice(0, 60),
          type: "image",
          url: path,
        });
      }
    }

    const signed = await supabase.storage.from("media").createSignedUrl(path, 3600);
    return { status: "completed", message: null, url: signed.data?.signedUrl ?? null, path, progress: 100 };
  });
