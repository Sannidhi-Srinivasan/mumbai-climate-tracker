"use client";

import { useMemo, useState } from "react";
import { ActionCard } from "@/components/ActionCard";
import type { VerifiedAction } from "@/lib/actions";
import type { Condition } from "@/lib/climate";

// "use client" means this component runs in the visitor's browser, not on the
// server — it needs that because typing into a search box and clicking filter
// buttons has to react instantly, without reloading the page.

export function ActionsExplorer({
  actions,
  activeConditions,
}: {
  actions: VerifiedAction[];
  activeConditions: Condition[];
}) {
  const categories = useMemo(
    () => Array.from(new Set(actions.map((a) => a.category))).sort(),
    [actions],
  );

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = actions.filter((action) => {
    if (selectedCategory && action.category !== selectedCategory) return false;
    if (query.trim() === "") return true;
    const haystack = `${action.title} ${action.summary}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="action-search" className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Search
        </label>
        <input
          id="action-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions..."
          className="w-full rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 dark:border-white/[.12] dark:bg-zinc-900 dark:text-zinc-50 sm:max-w-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Filter by category
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              selectedCategory === null
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedCategory === category
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No actions match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((action) => {
            const relevantToday = action.when.some(
              (w) => w === "any" || activeConditions.includes(w),
            );
            return (
              <ActionCard
                key={action.id}
                action={action}
                todayStatus={relevantToday ? "relevant" : "not-relevant"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
