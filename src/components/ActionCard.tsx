import type { ActionEntry } from "@/lib/actions";
import { CATEGORY_ICONS } from "@/components/icons";

export function ActionCard({
  action,
  reason,
  todayStatus,
}: {
  action: ActionEntry;
  /** Shown in "What to do today": why this action matched, e.g. "Because it's hot right now". */
  reason?: string | null;
  /** Shown in "All actions": whether this action applies to today's conditions. */
  todayStatus?: "relevant" | "not-relevant";
}) {
  const CategoryIcon = CATEGORY_ICONS[action.category];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/[.06] bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10 dark:border-white/[.08] dark:hover:shadow-teal-400/10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5" />}
          {action.category}
        </span>
        {reason && (
          <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs font-semibold text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200">
            {reason}
          </span>
        )}
        {todayStatus === "relevant" && (
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
            Relevant today
          </span>
        )}
        {todayStatus === "not-relevant" && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Not tied to today
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-black dark:text-zinc-50">{action.title}</h3>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{action.summary}</p>
      <details className="group text-sm">
        <summary className="cursor-pointer list-none font-medium text-teal-700 underline underline-offset-2 dark:text-teal-400">
          Show details
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            {action.details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {action.sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-700 underline underline-offset-2 dark:text-teal-400"
              >
                {source.title}
              </a>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
