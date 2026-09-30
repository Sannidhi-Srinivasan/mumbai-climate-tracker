import Link from "next/link";
import { loadVerifiedActions, loadFlaggedActions } from "@/lib/actions";
import { CATEGORY_ICONS } from "@/components/icons";

export default async function HowItsChecked() {
  const [verified, flagged] = await Promise.all([loadVerifiedActions(), loadFlaggedActions()]);

  return (
    <div className="flex flex-col flex-1 items-center font-sans">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-16 sm:px-16">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-sm font-medium text-teal-700 underline underline-offset-2 dark:text-teal-400">
            ← Back to tracker
          </Link>
          <h1 className="font-display text-3xl tracking-tight text-black dark:text-zinc-50">
            How it&apos;s checked
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Every local action on this site is checked before it&apos;s shown. Here&apos;s exactly
            what that means, and every entry that didn&apos;t pass.
          </p>
        </div>

        <section className="flex flex-col gap-4 rounded-2xl border border-black/[.06] bg-surface p-6 dark:border-white/[.08]">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">The three checks</h2>
          <div className="flex flex-col gap-3 text-sm text-zinc-700 dark:text-zinc-300">
            <p>
              <span className="font-semibold text-black dark:text-zinc-50">Schema check.</span>{" "}
              Does the entry have every required field, in the right format — a title, a
              summary, source links, and so on?
            </p>
            <p>
              <span className="font-semibold text-black dark:text-zinc-50">Spot check.</span>{" "}
              Does the official source page actually say what the entry claims? Someone opened
              the link and compared it.
            </p>
            <p>
              <span className="font-semibold text-black dark:text-zinc-50">Freshness check.</span>{" "}
              Is the program still running today, or has it closed, ended, or expired?
            </p>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-black dark:text-zinc-50">{verified.length}</span>{" "}
            actions passed all three checks and are shown on the tracker.{" "}
            <span className="font-semibold text-black dark:text-zinc-50">{flagged.length}</span>{" "}
            failed at least one check and are kept below for the record — never shown as advice.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Flagged entries ({flagged.length})
          </h2>
          {flagged.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nothing is currently flagged.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {flagged.map((action) => {
                const CategoryIcon = CATEGORY_ICONS[action.category];
                return (
                  <div
                    key={action.id}
                    className="flex flex-col gap-2 rounded-2xl border border-l-4 border-l-red-500 border-black/[.06] bg-surface p-5 dark:border-white/[.08]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5" />}
                        {action.category}
                      </span>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-200">
                        FLAGGED
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-black dark:text-zinc-50">
                      {action.title}
                    </h3>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{action.summary}</p>
                    <p className="text-sm text-red-800 dark:text-red-300">
                      <span className="font-semibold">Why it&apos;s flagged: </span>
                      {action.verification.flag_reason}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Last checked {action.verification.lastChecked}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs">
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
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
