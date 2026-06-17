import { useCallback, useState } from "react";

const SETTINGS_KEY = "ctm-settings-v1";

export const MOVE_TIME_PRESETS = [
  { label: "Club (0.5s)", ms: 500 },
  { label: "Candidate (1s)", ms: 1000 },
  { label: "Master (1.5s)", ms: 1500 },
  { label: "GM (3s)", ms: 3000 },
] as const;

export const BLITZ_TIME_PRESETS = [
  { label: "Bullet", s: 5 },
  { label: "Blitz", s: 15 },
  { label: "Rapid", s: 30 },
  { label: "Classic", s: 60 },
] as const;

export interface Settings {
  /** Engine analysis time per position in milliseconds. */
  moveTimeMs: number;
  /** Whether the blitz countdown timer is active. */
  blitzEnabled: boolean;
  /** Seconds allowed per position in blitz mode. */
  blitzSeconds: number;
}

const DEFAULT_SETTINGS: Settings = {
  moveTimeMs: 1500,
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
