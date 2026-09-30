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

// "Fetch" means: ask another service on the internet for data and wait for its answer.
// All three services below are Open-Meteo's free feeds — no sign-up or API key needed,
// which keeps this project simple while you're learning.

function formatMumbaiTime(isoString: string | undefined): string {
  if (!isoString) return "time unknown";
  const date = new Date(isoString);
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
    if (feelsLikeC < 30) {
      label = "Comfortable";
      level = "good";
    } else if (feelsLikeC < 35) {
      label = "Warm";
      level = "moderate";
    } else if (feelsLikeC < 40) {
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
    if (usAqi <= 50) {
      label = "Good";
      level = "good";
    } else if (usAqi <= 100) {
      label = "Moderate";
      level = "moderate";
    } else if (usAqi <= 150) {
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
  if ((rainMm !== null && rainMm >= 30) || (dischargeRatio !== null && dischargeRatio >= 150)) {
    level = "severe";
  } else if (
    (rainMm !== null && rainMm >= 10) ||
    (dischargeRatio !== null && dischargeRatio >= 120)
  ) {
    level = "poor";
  } else if (
    (rainMm !== null && rainMm > 0) ||
    (dischargeRatio !== null && dischargeRatio >= 100)
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

  if (feelsLikeC !== null) {
    if (feelsLikeC >= 30) conditions.push("heat-high");
    if (feelsLikeC >= 40) conditions.push("heat-extreme");
    if (feelsLikeC <= -15) conditions.push("cold-extreme");
  }
  if (usAqi !== null) {
    if (usAqi >= 51 && usAqi <= 100) conditions.push("air-moderate");
    if (usAqi > 100) conditions.push("air-high");
  }
  if (rainMm !== null && rainMm >= 25) conditions.push("rain-heavy");
  if (dischargeRatio !== null && dischargeRatio >= 150) conditions.push("flood-risk");

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
