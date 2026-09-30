import type { Level } from "@/lib/climate";

// Maps each plain-word level to colors AND a text badge, so the meaning never
// depends on color alone (important for colorblind visitors). The badge uses a
// solid, saturated background in BOTH themes so levels stay visually distinct
// even in dark mode. These four colors are fixed and never reused for anything
// else on the site, so they always mean the same thing at a glance — including
// in the levels-key popup, which reads this same map.
export const LEVEL_STYLES: Record<
  Level,
  { border: string; shadow: string; badgeBg: string; badgeText: string; badge: string; dot: string }
> = {
  good: {
    border: "border-l-emerald-500",
    shadow: "shadow-[0_8px_24px_-12px] shadow-emerald-500/50",
    badgeBg: "bg-emerald-600",
    badgeText: "text-white",
    badge: "GOOD",
    dot: "bg-emerald-500",
  },
  moderate: {
    border: "border-l-amber-500",
    shadow: "shadow-[0_8px_24px_-12px] shadow-amber-500/50",
    badgeBg: "bg-amber-500",
    badgeText: "text-black",
    badge: "MODERATE",
    dot: "bg-amber-500",
  },
  poor: {
    border: "border-l-orange-500",
    shadow: "shadow-[0_8px_24px_-12px] shadow-orange-500/50",
    badgeBg: "bg-orange-600",
    badgeText: "text-white",
    badge: "POOR",
    dot: "bg-orange-500",
  },
  severe: {
    border: "border-l-red-600",
    shadow: "shadow-[0_8px_24px_-12px] shadow-red-600/50",
    badgeBg: "bg-red-600",
    badgeText: "text-white",
    badge: "SEVERE",
    dot: "bg-red-600",
  },
};
