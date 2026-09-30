import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo_Black } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

// Runs before the page paints, so the site never flashes the wrong theme for
// a split second. It reads the visitor's saved choice (if any), falls back to
// their system setting, and writes it onto <html> as a data-theme attribute —
// which the CSS in globals.css and every "dark:" class then reacts to.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// A bold, poster-style font for headlines only — the kind of type you'd see
// on a movie hoarding or a station departure board. Body text stays plain.
const archivoBlack = Archivo_Black({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Mumbai Climate Tracker",
  description:
    "Live heat, air quality, and rain/flood readings for Mumbai, India, plus local climate actions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The theme-init script (below) sets data-theme on this tag before
      // React hydrates, on purpose — this tells React that mismatch is
      // expected, instead of warning about it.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
