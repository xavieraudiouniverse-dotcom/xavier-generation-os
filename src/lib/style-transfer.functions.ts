import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FAL_QUEUE = "https://queue.fal.run";
/** FLUX img2img endpoints, strongest first. */
const IMG2IMG_MODELS = ["fal-ai/flux/dev/image-to-image", "fal-ai/flux/schnell/image-to-image"];

export const STYLE_MODEL_LABEL = "FLUX img2img (fal.ai)";

function safeName(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function falBase(model: string) {
  return model.split("/").slice(0, 2).join("/");
}

function decodeHandle(handle: string) {
  const i = handle.lastIndexOf(":");
  return { falModel: handle.slice(0, i), id: handle.slice(i + 1) };
}

export const startStyleTransferJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sourcePath: string; style: string; strength?: number }) => {
    const sourcePath = (input?.sourcePath ?? "").trim();
    const style = (input?.style ?? "").trim();
    if (!sourcePath) throw new Error("Pick a source frame first.");
    if (!style) throw new Error("Pick a style.");
    return { sourcePath, style: style.slice(0, 120), strength: Math.min(0.95, Math.max(0.3, input?.strength ?? 0.72)) };
  })
  .handler(async ({ data, context }) => {
    const key = process.env["FAL_KEY"];
    if (!key) throw new Error("Style Transfer is not configured — add a fal.ai key to use it.");
    const { supabase } = context;

    const signed = await supabase.storage.from("media").createSignedUrl(data.sourcePath, 3600);
    if (!signed.data?.signedUrl) throw new Error("Could not read that source frame.");

    const prompt = `in the style of ${data.style}, cinematic, high detail`;
    let lastMessage = "FLUX could not start this restyle.";
    for (const model of IMG2IMG_MODELS) {
      const res = await fetch(`${FAL_QUEUE}/${model}`, {
        method: "POST",
        headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          image_url: signed.data.signedUrl,
          strength: data.strength,
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
        lastMessage = detail ?? "That FLUX img2img endpoint is not available on this fal.ai account.";
        continue;
      }
      if (res.status === 401 || res.status === 403) throw new Error("The fal.ai key was rejected. Check the FAL_KEY secret.");
      if (res.status === 429) throw new Error("fal.ai is rate limited right now — try again in a moment.");
      if (res.status === 402) throw new Error("Your fal.ai balance is out of credits.");
      throw new Error(detail ?? "FLUX could not start this restyle.");
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

export const pollStyleTransferJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; projectId?: string; style?: string }) => {
    if (!input?.id) throw new Error("Missing job id.");
    return input;
  })
  .handler(async ({ data, context }): Promise<PollResult> => {
    const key = process.env["FAL_KEY"];
    if (!key) throw new Error("Style Transfer is not configured — add a fal.ai key to use it.");
    const { falModel, id } = decodeHandle(data.id);
    const auth = { Authorization: `Key ${key}` };
    const base = falBase(falModel);

    const statusRes = await fetch(`${FAL_QUEUE}/${base}/requests/${id}/status`, { headers: auth });
    if (!statusRes.ok) {
      return { status: "failed", message: "fal.ai lost track of this restyle. Try running it again.", url: null, path: null, progress: 100 };
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
    const path = `${userId}/style-transfer/styled-${safeName(id)}.${ext}`;

    const existing = await supabase.storage.from("media").createSignedUrl(path, 3600);
    if (!existing.data?.signedUrl) {
      const contentRes = await fetch(image.url);
      if (!contentRes.ok) throw new Error("Could not download the styled frame.");
      const bytes = await contentRes.arrayBuffer();
      const up = await supabase.storage.from("media").upload(path, bytes, { contentType, upsert: true });
      if (up.error) throw new Error("Could not store the styled frame.");
      if (data.projectId) {
        await supabase.from("media").insert({
          project_id: data.projectId,
          user_id: userId,
          name: `Styled · ${(data.style ?? "frame").slice(0, 40)}`,
          type: "image",
          url: path,
        });
      }
    }

    const signedOut = await supabase.storage.from("media").createSignedUrl(path, 3600);
    return { status: "completed", message: null, url: signedOut.data?.signedUrl ?? null, path, progress: 100 };
  });
