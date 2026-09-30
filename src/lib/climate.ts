// Mumbai's coordinates, used to ask each service for local data.
const MUMBAI_LAT = 19.076;
const MUMBAI_LON = 72.8777;

export type Level = "good" | "moderate" | "poor" | "severe";

export type Panel = {
  /** The main number to show, already formatted as text, e.g. "34°C" or "AQI 87". */
  value: string;
  /** A plain-word level, always shown as text (not just a color) for accessibility. */
  label: string;
  level: Level;
  /** When this specific reading is from, in Mumbai's local time. */
  readingTime: string;
};

// The condition tags actions in data/verified.json and data/flagged.json use in
// their "when" field, matched against today's live readings.
export type Condition =
  | "any"
  | "heat-high"
  | "heat-extreme"
  | "cold-extreme"
  | "air-moderate"
  | "air-high"
  | "rain-heavy"
  | "flood-risk";

export type ClimateSnapshot = {
  heat: Panel;
  air: Panel;
  rainFlood: Panel;
  /** Which condition tags apply right now, based on the raw readings above. */
  activeConditions: Condition[];
};

// The exact cutoffs that decide each panel's GOOD / MODERATE / POOR / SEVERE
// level. Each field is the value at which that level STARTS (so "good" runs
// from 0 up to, but not including, moderate's cutoff). These are the same
// numbers the levels-key popup on the page reads and displays, so the two
// can never drift apart.
//
// Heat and rain are calibrated to Mumbai specifically, using IMD's own
// criteria, rather than generic thresholds that would fit a drier or less
// humid city:
// - Heat: Mumbai's coastal humidity (75% average, up to 89% in monsoon) pushes
//   the feels-like temperature 5-8°C above the actual air temperature, so
//   "moderate" starts higher than it would for a drier inland city. "Poor"
//   approaches IMD's coastal heatwave criterion (37°C+ actual); "severe"
//   enters the internationally-used heat-index "danger" band.
// - Rain: IMD publishes an official daily-rainfall scale (light/moderate/
//   heavy/very heavy/extremely heavy). "Moderate" here covers IMD's light
//   and moderate rain (an ordinary monsoon day); "poor" covers IMD's heavy
//   and very heavy rain; "severe" is reserved for IMD's extremely heavy
//   band — disaster-scale rainfall, like the 944mm that fell on 26 July 2005.
export const HEAT_LEVELS = {
  moderateAt: 32, // °C feels-like
  poorAt: 38,
  severeAt: 42,
};

export const AIR_LEVELS = {
  moderateAt: 51, // US AQI
  poorAt: 101,
  severeAt: 151,
};

export const RAIN_LEVELS = {
  moderateAt: 0.1, // mm of rain today
  poorAt: 64.5,
  severeAt: 204.5,
};

export const FLOOD_LEVELS = {
  moderateAt: 100, // river flow, % of the long-term normal for the day
  poorAt: 120,
  severeAt: 150,
};

// "Fetch" means: ask another service on the internet for data and wait for its answer.
// All three services below are Open-Meteo's free feeds — no sign-up or API key needed,
// which keeps this project simple while you're learning.

function formatMumbaiTime(isoString: string | undefined): string {
  if (!isoString) return "time unknown";
  // Open-Meteo returns a bare "2026-09-30T22:30" with no timezone offset.
  // Without "+05:30" attached, JavaScript assumes the SERVER's own timezone
  // (Vercel's is UTC), silently shifting the time by 5.5 hours and sometimes
  // into the next calendar day — which is why this line exists.
  const date = new Date(`${isoString}+05:30`);
  if (Number.isNaN(date.getTime())) return "time unknown";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMumbaiDate(isoDateString: string | undefined): string {
  if (!isoDateString) return "date unknown";
  const date = new Date(`${isoDateString}T00:00:00+05:30`);
  if (Number.isNaN(date.getTime())) return "date unknown";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// --- Heat: feels-like temperature, from the weather feed ---

async function fetchHeat(): Promise<{ panel: Panel; feelsLikeC: number | null }> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${MUMBAI_LAT}&longitude=${MUMBAI_LON}` +
    `&current=apparent_temperature&timezone=Asia%2FKolkata`;

  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Weather feed returned ${res.status}`);
  const data = await res.json();
  const feelsLikeC: number | null = data.current?.apparent_temperature ?? null;

  let label = "Unknown";
  let level: Level = "moderate";
  if (feelsLikeC !== null) {
    if (feelsLikeC < HEAT_LEVELS.moderateAt) {
      label = "Comfortable";
      level = "good";
    } else if (feelsLikeC < HEAT_LEVELS.poorAt) {
      label = "Warm";
      level = "moderate";
    } else if (feelsLikeC < HEAT_LEVELS.severeAt) {
      label = "Hot";
      level = "poor";
    } else {
      label = "Extreme heat";
      level = "severe";
    }
  }

  return {
    panel: {
      value: feelsLikeC !== null ? `${Math.round(feelsLikeC)}°C feels-like` : "No reading",
      label,
      level,
      readingTime: formatMumbaiTime(data.current?.time),
    },
    feelsLikeC,
  };
}

// --- Air: US Air Quality Index, from the air quality feed ---

async function fetchAir(): Promise<{ panel: Panel; usAqi: number | null }> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${MUMBAI_LAT}&longitude=${MUMBAI_LON}` +
    `&current=us_aqi&timezone=Asia%2FKolkata`;

  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Air quality feed returned ${res.status}`);
  const data = await res.json();
  const usAqi: number | null = data.current?.us_aqi ?? null;

  let label = "Unknown";
  let level: Level = "moderate";
  if (usAqi !== null) {
    if (usAqi < AIR_LEVELS.moderateAt) {
      label = "Good";
      level = "good";
    } else if (usAqi < AIR_LEVELS.poorAt) {
      label = "Moderate";
      level = "moderate";
    } else if (usAqi < AIR_LEVELS.severeAt) {
      label = "Unhealthy for sensitive groups";
      level = "poor";
    } else {
      label = "Unhealthy";
      level = "severe";
    }
  }

  return {
    panel: {
      value: usAqi !== null ? `AQI ${Math.round(usAqi)}` : "No reading",
      label,
      level,
      readingTime: formatMumbaiTime(data.current?.time),
    },
    usAqi,
  };
}

// --- Rain & flood: today's rainfall from the weather feed, plus river flow vs.
// its long-term normal from the flood feed. The flood feed is a large-scale river
// model (GloFAS), not an official Mumbai flood alert, so we describe it plainly as
// "river flow vs. normal" rather than implying an official warning.

async function fetchRainFlood(): Promise<{
  panel: Panel;
  rainMm: number | null;
  dischargeRatio: number | null;
}> {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${MUMBAI_LAT}&longitude=${MUMBAI_LON}` +
    `&daily=precipitation_sum&timezone=Asia%2FKolkata`;
  const floodUrl =
    `https://flood-api.open-meteo.com/v1/flood?latitude=${MUMBAI_LAT}&longitude=${MUMBAI_LON}` +
    `&daily=river_discharge,river_discharge_mean&timezone=Asia%2FKolkata`;

  const [weatherResult, floodResult] = await Promise.allSettled([
    fetch(weatherUrl, { next: { revalidate: 600 } }).then((res) => {
      if (!res.ok) throw new Error(`Weather feed returned ${res.status}`);
      return res.json();
    }),
    fetch(floodUrl, { next: { revalidate: 600 } }).then((res) => {
      if (!res.ok) throw new Error(`Flood feed returned ${res.status}`);
      return res.json();
    }),
  ]);

  const rainMm: number | null =
    weatherResult.status === "fulfilled"
      ? weatherResult.value.daily?.precipitation_sum?.[0] ?? null
      : null;
  const rainDate: string | undefined =
    weatherResult.status === "fulfilled" ? weatherResult.value.daily?.time?.[0] : undefined;

  const discharge: number | null =
    floodResult.status === "fulfilled"
      ? floodResult.value.daily?.river_discharge?.[0] ?? null
      : null;
  const dischargeMean: number | null =
    floodResult.status === "fulfilled"
      ? floodResult.value.daily?.river_discharge_mean?.[0] ?? null
      : null;
  const floodDate: string | undefined =
    floodResult.status === "fulfilled" ? floodResult.value.daily?.time?.[0] : undefined;

  const dischargeRatio: number | null =
    discharge !== null && dischargeMean !== null && dischargeMean > 0
      ? (discharge / dischargeMean) * 100
      : null;

  let level: Level = "good";
  if (
    (rainMm !== null && rainMm >= RAIN_LEVELS.severeAt) ||
    (dischargeRatio !== null && dischargeRatio >= FLOOD_LEVELS.severeAt)
  ) {
    level = "severe";
  } else if (
    (rainMm !== null && rainMm >= RAIN_LEVELS.poorAt) ||
    (dischargeRatio !== null && dischargeRatio >= FLOOD_LEVELS.poorAt)
  ) {
    level = "poor";
  } else if (
    (rainMm !== null && rainMm >= RAIN_LEVELS.moderateAt) ||
    (dischargeRatio !== null && dischargeRatio >= FLOOD_LEVELS.moderateAt)
  ) {
    level = "moderate";
  }

  const label =
    level === "severe"
      ? "Elevated flood risk"
      : level === "poor"
        ? "Rising river flow"
        : level === "moderate"
          ? "Some rain, normal flow"
          : "Dry, normal flow";

  const rainText = rainMm !== null ? `${Math.round(rainMm)}mm rain today` : "rain: no reading";
  const flowText =
    dischargeRatio !== null ? `river flow ${Math.round(dischargeRatio)}% of normal` : "river flow: no reading";

  return {
    panel: {
      value: `${rainText}, ${flowText}`,
      label,
      level,
      readingTime: `as of ${formatMumbaiDate(rainDate ?? floodDate)}`,
    },
    rainMm,
    dischargeRatio,
  };
}

// Turns today's raw readings into the condition tags used in data/verified.json
// and data/flagged.json's "when" field. Thresholds match the skill's condition table.
function computeActiveConditions(
  feelsLikeC: number | null,
  usAqi: number | null,
  rainMm: number | null,
  dischargeRatio: number | null,
): Condition[] {
  const conditions: Condition[] = ["any"];

  // "heat-high" triggers a bit before the panel's own "poor" cutoff (35°C vs
  // 38°C) — high enough that it doesn't fire on nearly every Mumbai day, but
  // early enough to surface shade/water actions before things get properly hot.
  const HEAT_HIGH_AT = 35;
  if (feelsLikeC !== null) {
    if (feelsLikeC >= HEAT_HIGH_AT) conditions.push("heat-high");
    if (feelsLikeC >= HEAT_LEVELS.severeAt) conditions.push("heat-extreme");
    if (feelsLikeC <= -15) conditions.push("cold-extreme");
  }
  if (usAqi !== null) {
    if (usAqi >= AIR_LEVELS.moderateAt && usAqi < AIR_LEVELS.poorAt) conditions.push("air-moderate");
    if (usAqi >= AIR_LEVELS.poorAt) conditions.push("air-high");
  }
  if (rainMm !== null && rainMm >= RAIN_LEVELS.poorAt) conditions.push("rain-heavy");
  if (dischargeRatio !== null && dischargeRatio >= FLOOD_LEVELS.severeAt) conditions.push("flood-risk");

  return conditions;
}

const FALLBACK_PANEL: Panel = {
  value: "No reading",
  label: "Unknown",
  level: "moderate",
  readingTime: "time unknown",
};

export async function fetchClimateSnapshot(): Promise<ClimateSnapshot> {
  const [heatResult, airResult, rainFloodResult] = await Promise.all([
    fetchHeat().catch(() => ({ panel: FALLBACK_PANEL, feelsLikeC: null })),
    fetchAir().catch(() => ({ panel: FALLBACK_PANEL, usAqi: null })),
    fetchRainFlood().catch(() => ({ panel: FALLBACK_PANEL, rainMm: null, dischargeRatio: null })),
  ]);

  return {
    heat: heatResult.panel,
    air: airResult.panel,
    rainFlood: rainFloodResult.panel,
    activeConditions: computeActiveConditions(
      heatResult.feelsLikeC,
      airResult.usAqi,
      rainFloodResult.rainMm,
      rainFloodResult.dischargeRatio,
    ),
  };
}
