import { useCallback, useEffect, useRef, useState } from "react";
import type { ScoreState } from "../types";

function scoreKey(moveTimeMs: number): string {
  return `ctm-score-v1-${moveTimeMs}`;
}

function loadState(key: string): ScoreState {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as ScoreState;
  } catch {
    // corrupted storage — start fresh
  }
  return { totalPoints: 0, movesPlayed: 0, streak: 0, bestStreak: 0 };
}

function saveState(key: string, state: ScoreState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Quota exceeded or private-browsing — silently ignore.
  }
}

/**
 * Manages the running score in localStorage, scoped per difficulty (moveTimeMs).
 *
 * `scoreState` is real React state so the UI re-renders whenever the score
 * changes. A ref mirror keeps the latest value readable synchronously inside
 * `record()` so consecutive calls compute the correct streak/delta.
 */
export function useScore(moveTimeMs: number) {
  // Store the last seen moveTimeMs to detect difficulty changes during render.
  const [lastMs, setLastMs] = useState(moveTimeMs);
  const [scoreState, setScoreState] = useState<ScoreState>(() =>
    loadState(scoreKey(moveTimeMs)),
  );
  const stateRef = useRef<ScoreState>(scoreState);
  const keyRef = useRef(scoreKey(moveTimeMs));

  // React "derived state from props" pattern: update state during render
  // (guarded condition; no effect needed, no ref access).
  if (lastMs !== moveTimeMs) {
    setLastMs(moveTimeMs);
    setScoreState(loadState(scoreKey(moveTimeMs)));
  }

  // Sync refs after every render (ref mutations only — no setState).
  useEffect(() => {
    stateRef.current = scoreState;
    keyRef.current = scoreKey(moveTimeMs);
  });


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
    saveState(keyRef.current, next);
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
    saveState(keyRef.current, fresh);
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
    saveState(keyRef.current, next);
  }, []);

  return { scoreState, record, reset, deductPoints };
}
