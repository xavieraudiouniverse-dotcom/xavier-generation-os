export type TierId = "starter" | "creator" | "pro" | "studio" | "founder" | "none";

export type Plan = {
  id: Exclude<TierId, "none" | "founder">;
  name: string;
  price: number;
  tagline: string;
  templates: string;
  resolution: string;
  ai: string;
  watermark: boolean;
  accent: "neon" | "magenta" | "gold";
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 4.99,
    tagline: "Get on the timeline",
    templates: "50K templates",
    resolution: "1080p export",
    ai: "10 AI actions / day",
    watermark: true,
    accent: "neon",
    features: [
      "50,000 templates",
      "1080p MP4 / MOV export",
      "10 AI actions per day",
      "Multi-track timeline",
      "Xavier watermark",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: 9.99,
    tagline: "Post daily, look pro",
    templates: "250K templates",
    resolution: "4K export",
    ai: "50 AI actions / day",
    watermark: false,
    accent: "magenta",
    highlight: true,
    features: [
      "250,000 templates",
      "4K export",
      "50 AI actions per day",
      "No watermark",
      "Auto captions + beat sync",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    tagline: "The full toolkit",
    templates: "750K templates",
    resolution: "8K export",
    ai: "200 AI actions / day",
    watermark: false,
    accent: "gold",
    features: [
      "750,000 templates",
      "8K export",
      "200 AI actions per day",
      "Every AI tool unlocked",
      "Priority render queue",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    price: 49.99,
    tagline: "Hollywood, in a tab",
    templates: "1M+ templates",
    resolution: "12K export",
    ai: "Unlimited AI",
    watermark: false,
    accent: "neon",
    features: [
      "1,000,000+ templates",
      "12K mastering export",
      "Unlimited AI actions",
      "White-label delivery",
      "Team seats + shared bins",
    ],
  },
];

export const TIER_RANK: Record<TierId, number> = {
  none: 0,
  starter: 1,
  creator: 2,
  pro: 3,
  studio: 4,
  founder: 5,
};

export const TIER_LABEL: Record<TierId, string> = {
  none: "No plan",
  starter: "Starter",
  creator: "Creator",
  pro: "Pro",
  studio: "Studio",
  founder: "Founder",
};

export function hasAccess(tier: TierId | null | undefined, status: string | null | undefined) {
  if (!tier) return false;
  if (tier === "founder") return true;
  return TIER_RANK[tier] > 0 && status === "active";
}

export type TierLimits = {
  maxResolution: "720p" | "1080p" | "4K";
  watermark: boolean;
  aiActionsPerDay: number;
  storageGb: number;
};

export const TIER_LIMITS: Record<TierId, TierLimits> = {
  none: { maxResolution: "720p", watermark: true, aiActionsPerDay: 0, storageGb: 0 },
  starter: { maxResolution: "1080p", watermark: true, aiActionsPerDay: 10, storageGb: 10 },
  creator: { maxResolution: "1080p", watermark: false, aiActionsPerDay: 100, storageGb: 100 },
  pro: { maxResolution: "4K", watermark: false, aiActionsPerDay: 1000, storageGb: 500 },
  studio: { maxResolution: "4K", watermark: false, aiActionsPerDay: 100000, storageGb: 2000 },
  founder: { maxResolution: "4K", watermark: false, aiActionsPerDay: 100000, storageGb: 5000 },
};
