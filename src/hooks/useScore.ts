import { useCallback, useRef, useState } from "react";
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
 *
 * `scoreState` is real React state so the UI re-renders whenever the score
 * changes. A ref mirror keeps the latest value readable synchronously inside
 * `record()` so consecutive calls compute the correct streak/delta.
 */
export function useScore() {
  const [scoreState, setScoreState] = useState<ScoreState>(loadState);
  const stateRef = useRef<ScoreState>(scoreState);

  const record = useCallback((points: number): number => {
    const prev = stateRef.current;
    const isScoring = points > 0;
    const streak = isScoring ? prev.streak + 1 : 0;

    // Streak bonus: +1 at streak 3–5, +2 at streak 6+
    const streakBonus = streak >= 6 ? 2 : streak >= 3 ? 1 : 0;
    // Off-book penalty is already encoded as −1 in scoreMove

    const delta = points + streakBonus;
    const next: ScoreState = {
      totalPoints: Math.max(0, prev.totalPoints + delta),
      movesPlayed: prev.movesPlayed + 1,
      streak,
      bestStreak: Math.max(prev.bestStreak, streak),
    };
    stateRef.current = next;
    setScoreState(next);
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
    setScoreState(fresh);
    saveState(fresh);
  }, []);

  /** Deduct `cost` from totalPoints (min 0) without affecting streak or movesPlayed. */
  const deductPoints = useCallback((cost: number) => {
    const prev = stateRef.current;
    const next: ScoreState = {
      ...prev,
      totalPoints: Math.max(0, prev.totalPoints - cost),
    };
    stateRef.current = next;
    setScoreState(next);
    saveState(next);
  }, []);

  return { scoreState, record, reset, deductPoints };
}
