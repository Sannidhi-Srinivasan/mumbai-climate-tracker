import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Condition } from "@/lib/climate";

export type ActionSource = { title: string; url: string };

export type ActionEntry = {
  id: string;
  city: string;
  category: string;
  title: string;
  summary: string;
  details: string[];
  when: Condition[];
  sources: ActionSource[];
};

export type VerifiedAction = ActionEntry & {
  verification: { status: "verified"; lastChecked: string; method: string };
};

export type FlaggedAction = ActionEntry & {
  verification: {
    status: "flagged";
    lastChecked: string;
    method: string;
    flag_reason: string;
  };
};

// The "data" segment is a literal here (not a variable) so the build tool can
// see this only ever reads from the data/ folder, instead of conservatively
// bundling the whole project "just in case" a different folder was meant.
async function readDataFile<T>(filename: string): Promise<T> {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function loadVerifiedActions(): Promise<VerifiedAction[]> {
  return readDataFile<VerifiedAction[]>("verified.json");
}

export async function loadFlaggedActions(): Promise<FlaggedAction[]> {
  return readDataFile<FlaggedAction[]>("flagged.json");
}

// "any" always applies. Anything else only applies when that condition is live today.
export function isRelevantToday(action: ActionEntry, activeConditions: Condition[]): boolean {
  return action.when.some((w) => w === "any" || activeConditions.includes(w));
}

// The specific (non-"any") conditions that made this action relevant right now,
// used to show a "Because it's hot right now" style reason.
export function matchedConditions(action: ActionEntry, activeConditions: Condition[]): Condition[] {
  return action.when.filter((w) => w !== "any" && activeConditions.includes(w));
}

export const CONDITION_REASONS: Record<Exclude<Condition, "any">, string> = {
  "heat-high": "it's warm to hot right now",
  "heat-extreme": "it's extremely hot right now",
  "cold-extreme": "it's extremely cold right now",
  "air-moderate": "air quality is moderate right now",
  "air-high": "air quality is unhealthy right now",
  "rain-heavy": "heavy rain is expected today",
  "flood-risk": "river flow is well above normal today",
};

export function reasonText(conditions: Condition[]): string | null {
  const nonAny = conditions.filter((c): c is Exclude<Condition, "any"> => c !== "any");
  if (nonAny.length === 0) return null;
  return `Because ${nonAny.map((c) => CONDITION_REASONS[c]).join(" and ")}`;
}

// How urgent each condition is, used to rank "What to do today". Higher = more
// pressing. "any" isn't in here — actions that only match "any" score 0.
const CONDITION_WEIGHT: Record<Exclude<Condition, "any">, number> = {
  "heat-extreme": 3,
  "air-high": 3,
  "flood-risk": 3,
  "cold-extreme": 3,
  "rain-heavy": 2,
  "heat-high": 2,
  "air-moderate": 1,
};

function relevanceScore(conditions: Condition[]): number {
  return conditions.reduce(
    (sum, c) => sum + (c === "any" ? 0 : CONDITION_WEIGHT[c]),
    0,
  );
}

// Ranks today's actions by how urgently they apply right now, and returns only
// the top `limit`. Ties break by category then title, so the order stays stable
// rather than shuffling on every reload.
export function rankTodayActions(
  actions: VerifiedAction[],
  activeConditions: Condition[],
  limit: number,
): { action: VerifiedAction; matched: Condition[] }[] {
  return actions
    .filter((action) => isRelevantToday(action, activeConditions))
    .map((action) => ({ action, matched: matchedConditions(action, activeConditions) }))
    .sort((a, b) => {
      const scoreDiff = relevanceScore(b.matched) - relevanceScore(a.matched);
      if (scoreDiff !== 0) return scoreDiff;
      const categoryDiff = a.action.category.localeCompare(b.action.category);
      if (categoryDiff !== 0) return categoryDiff;
      return a.action.title.localeCompare(b.action.title);
    })
    .slice(0, limit);
}
