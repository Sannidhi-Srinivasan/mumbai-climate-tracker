"use client";

import { useRef } from "react";
import { HEAT_LEVELS, AIR_LEVELS, RAIN_LEVELS, FLOOD_LEVELS, type Level } from "@/lib/climate";
import { LEVEL_STYLES } from "@/lib/levelStyles";
import { InfoIcon, CloseIcon } from "@/components/icons";

// <dialog> is a built-in HTML element for popups — it handles the darkened
// background, closing on Escape, and keeping keyboard focus inside itself,
// all without any extra code. "use client" is needed because opening and
// closing it happens in the visitor's browser, in response to a click.

type Row = { level: Level; range: string };

function Table({ title, unit, rows }: { title: string; unit: string; rows: Row[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-black dark:text-zinc-50">
        {title} <span className="font-normal text-zinc-500 dark:text-zinc-400">({unit})</span>
      </h3>
      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li key={row.level} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${LEVEL_STYLES[row.level].dot}`} aria-hidden="true" />
            <span className="w-20 shrink-0 font-medium text-zinc-700 dark:text-zinc-300">
              {LEVEL_STYLES[row.level].badge}
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">{row.range}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LevelsKeyModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="flex items-center gap-1.5 text-sm font-medium text-teal-700 underline underline-offset-2 dark:text-teal-400"
      >
        <InfoIcon className="h-4 w-4" />
        How levels are set
      </button>

      <dialog
        ref={dialogRef}
        // Tailwind's base reset zeroes out <dialog>'s default margin, which is
        // what the browser normally uses to center it — so centering has to be
        // set explicitly here instead of relying on the browser's default.
        className="fixed inset-0 m-auto max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-black/[.06] bg-surface p-0 text-black shadow-xl backdrop:bg-black/50 dark:border-white/[.08] dark:text-zinc-50"
      >
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-xl">How levels are set</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                The exact reading at which each badge switches, calibrated to Mumbai&apos;s own
                climate (IMD&apos;s heatwave and rainfall criteria) rather than generic cutoffs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="shrink-0 rounded-full p-1 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <Table
            title="Heat, feels-like"
            unit="°C"
            rows={[
              { level: "good", range: `Below ${HEAT_LEVELS.moderateAt}°C` },
              { level: "moderate", range: `${HEAT_LEVELS.moderateAt}–${HEAT_LEVELS.poorAt - 1}°C` },
              { level: "poor", range: `${HEAT_LEVELS.poorAt}–${HEAT_LEVELS.severeAt - 1}°C` },
              { level: "severe", range: `${HEAT_LEVELS.severeAt}°C or higher` },
            ]}
          />

          <Table
            title="Air quality"
            unit="US AQI"
            rows={[
              { level: "good", range: `Below ${AIR_LEVELS.moderateAt}` },
              { level: "moderate", range: `${AIR_LEVELS.moderateAt}–${AIR_LEVELS.poorAt - 1}` },
              { level: "poor", range: `${AIR_LEVELS.poorAt}–${AIR_LEVELS.severeAt - 1}` },
              { level: "severe", range: `${AIR_LEVELS.severeAt} or higher` },
            ]}
          />

          <Table
            title="Rain, today's total"
            unit="mm"
            rows={[
              { level: "good", range: "0mm" },
              { level: "moderate", range: `${RAIN_LEVELS.moderateAt}–${RAIN_LEVELS.poorAt - 0.1}mm` },
              { level: "poor", range: `${RAIN_LEVELS.poorAt}–${RAIN_LEVELS.severeAt - 0.1}mm` },
              { level: "severe", range: `${RAIN_LEVELS.severeAt}mm or more` },
            ]}
          />

          <Table
            title="River flow"
            unit="% of normal"
            rows={[
              { level: "good", range: `Below ${FLOOD_LEVELS.moderateAt}%` },
              { level: "moderate", range: `${FLOOD_LEVELS.moderateAt}–${FLOOD_LEVELS.poorAt - 1}%` },
              { level: "poor", range: `${FLOOD_LEVELS.poorAt}–${FLOOD_LEVELS.severeAt - 1}%` },
              { level: "severe", range: `${FLOOD_LEVELS.severeAt}% or higher` },
            ]}
          />

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            The Rain &amp; flood panel shows whichever of rain or river flow is more severe on
            a given day.
          </p>
        </div>
      </dialog>
    </>
  );
}
