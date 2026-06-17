import { useCallback, useState } from "react";

const SETTINGS_KEY = "ctm-settings-v1";

/** Fixed think time for the follow-up eval after the player's off-book move (not configurable). */
export const ENGINE_FOLLOWUP_TIME_MS = 500;

export const MOVE_TIME_PRESETS = [
  { label: "Club (~1350)", elo: 1350, ms: 500 },
  { label: "Candidate (~1600)", elo: 1600, ms: 1000 },
  { label: "Master (~2200)", elo: 2200, ms: 2000 },
  { label: "GM (full)", elo: null, ms: 5000 },
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
  /** Whether the blitz countdown timer is active. */
  blitzEnabled: boolean;
  /** Seconds allowed per position in blitz mode. */
  blitzSeconds: number;
}

/** Returns the movetime to pass to the engine for the current ELO preset. */
export function getEffectiveMoveTimeMs(settings: Pick<Settings, 'engineElo'>): number {
  return MOVE_TIME_PRESETS.find(p => p.elo === settings.engineElo)?.ms ?? 5000;
}

const DEFAULT_SETTINGS: Settings = {
  engineElo: 2200,
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
