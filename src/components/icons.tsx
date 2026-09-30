// Small line-art icons, used next to text labels (never instead of them) so
// meaning never depends on recognizing an icon alone. Each is a plain SVG —
// "SVG" means an image made of lines and shapes described in code, so it stays
// crisp at any size instead of getting blurry like a photo would.

import type { ReactElement } from "react";

type IconProps = { className?: string };

const base = "h-4 w-4";

export function SunIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function WindIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M3 8h11a3 3 0 1 0-3-3" />
      <path d="M3 16h13a3 3 0 1 1-3 3" />
      <path d="M3 12h7" />
    </svg>
  );
}

export function WaveIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M2 9c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
      <path d="M2 15c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
    </svg>
  );
}

export function BoltIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

// A fast local train — the daily pulse of the city.
export function TrainIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4" y="3" width="16" height="13" rx="2" />
      <path d="M4 11h16" />
      <path d="M8 16l-2 4M16 16l2 4" />
      <path d="M9 7h6" />
    </svg>
  );
}

export function RecycleIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 19H4.8a2 2 0 0 1-1.7-3l1.6-2.7" />
      <path d="M10.3 4.4 12 2l3 3.5-2.2 1.3" />
      <path d="M13.7 19.6 12 22l-3-3.5 2.2-1.3" />
      <path d="M9.8 5.7 6.5 11.3l2.8 1.6" />
      <path d="M14.2 18.3l3.3-5.6-2.8-1.6" />
      <path d="M17 13.9 20.5 14l-1 3.4" />
    </svg>
  );
}

export function SearchOffIcon({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="6" />
      <path d="m20 20-4.3-4.3" />
    </svg>
  );
}

export const CATEGORY_ICONS: Record<string, (props: IconProps) => ReactElement> = {
  Heat: SunIcon,
  "Air quality": WindIcon,
  "Energy at home": BoltIcon,
  "Water and flooding": WaveIcon,
  "Getting around": TrainIcon,
  "Waste and reuse": RecycleIcon,
};
