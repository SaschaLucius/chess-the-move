import { useCallback, useRef } from "react";
import type { ScoreState } from "../types";

const STORAGE_KEY = "ctm-score-v1";

function loadState(): ScoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ScoreState;
  } catch {
    // corrupted storage — start fresh
  }
  return { totalPoints: 0, movesPlayed: 0, streak: 0, bestStreak: 0 };
}

function saveState(state: ScoreState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or private-browsing — silently ignore.
  }
}

/**
 * Manages the running score in localStorage.
 * Uses a ref so increments never trigger re-renders in App.
 * A forced re-render happens only when `record()` is called (once per move).
 */
export function useScore() {
  const stateRef = useRef<ScoreState>(loadState());

  const record = useCallback((points: number): number => {
    const prev = stateRef.current;
    const isScoring = points > 0;
    const streak = isScoring ? prev.streak + 1 : 0;

    // Streak bonus: +1 at streak 3–5, +2 at streak 6+
    const streakBonus = streak >= 6 ? 2 : streak >= 3 ? 1 : 0;
    // Penalty for off-book moves: –1 pt (totalPoints is floored at 0)
    const penalty = isScoring ? 0 : 1;

    const delta = points + streakBonus - penalty;
    const next: ScoreState = {
      totalPoints: Math.max(0, prev.totalPoints + delta),
      movesPlayed: prev.movesPlayed + 1,
      streak,
      bestStreak: Math.max(prev.bestStreak, streak),
    };
    stateRef.current = next;
    saveState(next);
    return delta;
  }, []);

  const reset = useCallback(() => {
    const fresh: ScoreState = {
      totalPoints: 0,
      movesPlayed: 0,
      streak: 0,
      bestStreak: 0,
    };
    stateRef.current = fresh;
    saveState(fresh);
  }, []);

  return { scoreState: stateRef.current, record, reset };
}
