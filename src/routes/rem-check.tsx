import { createFileRoute } from "@tanstack/react-router";
import { RemotionGallery } from "@/components/templates/RemotionStudio";
export const Route = createFileRoute("/rem-check")({ component: () => <RemotionGallery projects={[]} userName="Tester" /> });
