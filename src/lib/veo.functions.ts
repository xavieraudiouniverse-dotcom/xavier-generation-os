import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/videos";

type Job = {
  id: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  progress?: number;
  error?: { code?: string; message?: string };
};

export const startVeoJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { prompt: string; orientation?: "landscape" | "portrait"; seconds?: "4" | "6" | "8" }) => {
    const prompt = (input?.prompt ?? "").trim();
    if (prompt.length < 3) throw new Error("Write a longer prompt.");
    return {
      prompt: prompt.slice(0, 1500),
      orientation: input.orientation === "portrait" ? ("portrait" as const) : ("landscape" as const),
      seconds: input.seconds ?? ("8" as const),
    };
  })
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured.");
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/veo-3.1-lite",
        prompt: data.prompt,
        seconds: data.seconds,
        size: data.orientation === "portrait" ? "720x1280" : "1280x720",
      }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { message?: string } | null;
      if (res.status === 429) throw new Error("Too many generations right now — wait for the current one to finish.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits to keep generating.");
      throw new Error(err?.message ?? "Video generation could not start.");
    }
    const job = (await res.json()) as Job;
    return { id: job.id, status: job.status, progress: job.progress ?? 0 };
  });

export const pollVeoJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; projectId?: string; prompt?: string }) => {
    if (!input?.id) throw new Error("Missing job id.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured.");
    const auth = { Authorization: `Bearer ${key}` };

    const jobRes = await fetch(`${GATEWAY}/${data.id}`, { headers: auth });
    const job = (await jobRes.json()) as Job;

    if (job.status === "failed") {
      return { status: "failed" as const, message: job.error?.message ?? "Generation failed.", url: null, path: null, progress: 100 };
    }
    if (job.status !== "completed") {
      return { status: "in_progress" as const, message: null, url: null, path: null, progress: job.progress ?? 0 };
    }

    const { supabase, userId } = context;
    const path = `${userId}/ai-video/${data.id}.mp4`;

    const existing = await supabase.storage.from("media").createSignedUrl(path, 3600);
    if (!existing.data?.signedUrl) {
      const contentRes = await fetch(`${GATEWAY}/${data.id}/content`, { headers: auth });
      if (!contentRes.ok) throw new Error("Could not download the generated video.");
      const bytes = await contentRes.arrayBuffer();
      const up = await supabase.storage.from("media").upload(path, bytes, { contentType: "video/mp4", upsert: true });
      if (up.error) throw new Error("Could not store the generated video.");
      if (data.projectId) {
        await supabase.from("media").insert({
          project_id: data.projectId,
          user_id: userId,
          name: (data.prompt ?? "AI video").slice(0, 60),
          type: "video",
          url: path,
        });
      }
    }

    const signed = await supabase.storage.from("media").createSignedUrl(path, 3600);
    return {
      status: "completed" as const,
      message: null,
      url: signed.data?.signedUrl ?? null,
      path,
      progress: 100,
    };
  });
