import { useCallback, useState } from "react";

const SETTINGS_KEY = "ctm-settings-v1";

/** Fixed think time for the follow-up eval after the player's off-book move (not configurable). */
export const ENGINE_FOLLOWUP_TIME_MS = 500;

export const ENGINE_DEPTH_PRESETS = [
  { label: "Quick (1s)", ms: 1000 },
  { label: "Normal (3s)", ms: 3000 },
  { label: "Deep (5s)", ms: 5000 },
] as const;

export const MOVE_TIME_PRESETS = [
  { label: "Club (~1350)", elo: 1350 },
  { label: "Candidate (~1600)", elo: 1600 },
  { label: "Master (~2200)", elo: 2200 },
  { label: "GM (full)", elo: null },
] as const;

export const BLITZ_TIME_PRESETS = [
  { label: "Bullet", s: 5 },
  { label: "Blitz", s: 15 },
  { label: "Rapid", s: 30 },
  { label: "Classic", s: 60 },
] as const;

export interface Settings {
  /** Engine ELO cap (null = full strength). */
  engineElo: number | null;
  /** Max think time per position in milliseconds. */
  engineMoveTimeMs: number;
  /** Whether the blitz countdown timer is active. */
  blitzEnabled: boolean;
  /** Seconds allowed per position in blitz mode. */
  blitzSeconds: number;
}

const DEFAULT_SETTINGS: Settings = {
  engineElo: 2200,
  engineMoveTimeMs: 5000,
  blitzEnabled: false,
  blitzSeconds: 15,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    // corrupted — fall through to defaults
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // Quota / private-browsing — ignore.
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
