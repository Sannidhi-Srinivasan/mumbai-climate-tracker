"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/icons";

// "use client" means this runs in the visitor's browser — it needs to read and
// change document.documentElement, which only exists there, not on the server.

export function ThemeToggle() {
  // Starts as null so the very first render matches what the server sent
  // (which can't know the visitor's saved preference). The real value is
  // read from the page right after mounting, in the effect below.
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Reading the DOM attribute the init script already set — not app state,
    // so there's nothing to move into a lazy useState initializer instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing or blocked storage — the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-black/[.08] bg-surface text-zinc-700 shadow-sm transition hover:text-teal-600 dark:border-white/[.12] dark:text-zinc-300 dark:hover:text-teal-400"
    >
      {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
