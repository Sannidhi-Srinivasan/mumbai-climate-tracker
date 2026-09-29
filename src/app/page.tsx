import { fetchClimateSnapshot, type Panel } from "@/lib/climate";

// Maps each plain-word level to colors AND a text badge, so the meaning never
// depends on color alone (important for colorblind visitors). The badge uses a
// solid, saturated background in BOTH themes so levels stay visually distinct
// even in dark mode, where pale tinted backgrounds all read as near-black.
const LEVEL_STYLES: Record<
  Panel["level"],
  { border: string; badgeBg: string; badgeText: string; badge: string }
> = {
  good: { border: "border-l-emerald-500", badgeBg: "bg-emerald-600", badgeText: "text-white", badge: "GOOD" },
  moderate: { border: "border-l-amber-500", badgeBg: "bg-amber-500", badgeText: "text-black", badge: "MODERATE" },
  poor: { border: "border-l-orange-500", badgeBg: "bg-orange-600", badgeText: "text-white", badge: "POOR" },
  severe: { border: "border-l-red-600", badgeBg: "bg-red-600", badgeText: "text-white", badge: "SEVERE" },
};

function ClimateCard({ title, panel }: { title: string; panel: Panel }) {
  const styles = LEVEL_STYLES[panel.level];
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-l-4 border-black/[.06] bg-white p-6 dark:border-white/[.08] dark:bg-zinc-900 ${styles.border}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {title}
        </h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${styles.badgeBg} ${styles.badgeText}`}>
          {styles.badge}
        </span>
      </div>
      <p className="text-2xl font-semibold text-black dark:text-zinc-50">{panel.value}</p>
      <p className="text-base text-zinc-700 dark:text-zinc-300">{panel.label}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{panel.readingTime}</p>
    </div>
  );
}

export default async function Home() {
  const snapshot = await fetchClimateSnapshot();

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-16 sm:px-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Mumbai Climate Tracker
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Live heat, air quality, and rain/flood readings for Mumbai, India — plus local
            climate actions you can take (coming soon).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ClimateCard title="Heat" panel={snapshot.heat} />
          <ClimateCard title="Air quality" panel={snapshot.air} />
          <ClimateCard title="Rain & flood" panel={snapshot.rainFlood} />
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Heat and air readings come from Open-Meteo&apos;s weather and air quality feeds.
          River flow comes from Open-Meteo&apos;s flood feed, a large-scale model — not an
          official Mumbai flood warning.
        </p>
      </main>
    </div>
  );
}
