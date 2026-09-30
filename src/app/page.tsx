import Link from "next/link";
import { fetchClimateSnapshot, type Panel } from "@/lib/climate";
import { loadVerifiedActions, rankTodayActions, reasonText } from "@/lib/actions";
import { ActionCard } from "@/components/ActionCard";
import { ActionsExplorer } from "@/components/ActionsExplorer";
import { HeroGraphic, WaveDivider } from "@/components/HeroGraphic";
import { SunIcon, WindIcon, WaveIcon } from "@/components/icons";
import { LEVEL_STYLES } from "@/lib/levelStyles";
import { LevelsKeyModal } from "@/components/LevelsKeyModal";

const TODAY_ACTIONS_LIMIT = 8;

const PANEL_ICONS = {
  Heat: SunIcon,
  "Air quality": WindIcon,
  "Rain & flood": WaveIcon,
} as const;

function ClimateCard({ title, panel }: { title: keyof typeof PANEL_ICONS; panel: Panel }) {
  const styles = LEVEL_STYLES[panel.level];
  const Icon = PANEL_ICONS[title];
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-l-4 border-black/[.06] bg-surface p-6 dark:border-white/[.08] ${styles.border} ${styles.shadow}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <Icon className="h-4 w-4" />
          {title}
        </h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${styles.badgeBg} ${styles.badgeText}`}>
          {styles.badge}
        </span>
      </div>
      <p className="font-display text-2xl text-black dark:text-zinc-50">{panel.value}</p>
      <p className="text-base text-zinc-700 dark:text-zinc-300">{panel.label}</p>
      <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="motion-safe:animate-pulse h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
        {panel.readingTime}
      </p>
    </div>
  );
}

export default async function Home() {
  const [snapshot, verifiedActions] = await Promise.all([
    fetchClimateSnapshot(),
    loadVerifiedActions(),
  ]);

  const todayActions = rankTodayActions(
    verifiedActions,
    snapshot.activeConditions,
    TODAY_ACTIONS_LIMIT,
  );

  const today = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col flex-1 items-center font-sans">
      <main className="flex w-full max-w-5xl flex-col gap-8 px-6 py-16 sm:px-16">
        <div className="flex flex-col gap-4">
          <div className="h-32 w-full overflow-hidden rounded-2xl sm:h-44">
            <HeroGraphic />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display whitespace-nowrap text-[clamp(1.9rem,6vw,4.25rem)] leading-none tracking-tight text-black dark:text-zinc-50">
              Mumbai Climate Tracker
            </h1>
            <p className="flex items-center gap-2 text-sm font-medium text-teal-700 dark:text-teal-400">
              <span className="motion-safe:animate-pulse h-2 w-2 rounded-full bg-teal-500" aria-hidden="true" />
              Live data · {today}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ClimateCard title="Heat" panel={snapshot.heat} />
          <ClimateCard title="Air quality" panel={snapshot.air} />
          <ClimateCard title="Rain & flood" panel={snapshot.rainFlood} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Heat and air readings come from Open-Meteo&apos;s weather and air quality feeds.
            River flow comes from Open-Meteo&apos;s flood feed, a large-scale model — not an
            official Mumbai flood warning.
          </p>
          <LevelsKeyModal />
        </div>

        <WaveDivider />

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl tracking-tight text-black dark:text-zinc-50">
              Climate Actions for today
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The {TODAY_ACTIONS_LIMIT} actions you can take based on Mumbai&apos;s climate today.
            </p>
          </div>
          {todayActions.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No verified actions yet. Check back once the action list is added.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {todayActions.map(({ action, matched }) => (
                <ActionCard key={action.id} action={action} reason={reasonText(matched)} />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl tracking-tight text-black dark:text-zinc-50">
              All actions
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Search or filter by category to find an action — each card shows whether it
              applies to today&apos;s conditions.
            </p>
          </div>
          <ActionsExplorer actions={verifiedActions} activeConditions={snapshot.activeConditions} />
        </section>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Curious how these actions get checked?{" "}
          <Link href="/how-its-checked" className="font-medium text-teal-700 underline underline-offset-2 dark:text-teal-400">
            See how it&apos;s checked
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
