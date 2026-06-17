import { useCallback, useEffect, useRef, useState } from "react";
import type { ScoreState } from "../types";

const DIFFICULTY_NAMES: Record<number, string> = {
  1350: "club",
  1600: "candidate",
  2200: "master",
};

const TIMER_NAMES: Record<number, string> = {
  5: "bullet",
  15: "blitz",
  30: "rapid",
  60: "classic",
};

function scoreKey(engineElo: number | null, blitzEnabled: boolean, blitzSeconds: number): string {
  const diff = engineElo === null ? "gm" : (DIFFICULTY_NAMES[engineElo] ?? `elo${engineElo}`);
  if (!blitzEnabled) return `ctm-score-v1-${diff}`;
  const timer = TIMER_NAMES[blitzSeconds] ?? `${blitzSeconds}s`;
  return `ctm-score-v1-${diff}-${timer}`;
}

export function buildScoreLabel(engineElo: number | null, blitzEnabled: boolean, blitzSeconds: number): string {
  const diff = engineElo === null ? "gm" : (DIFFICULTY_NAMES[engineElo] ?? `elo${engineElo}`);
  const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);
  if (!blitzEnabled) return `Score (${diffLabel})`;
  const timer = TIMER_NAMES[blitzSeconds] ?? `${blitzSeconds}s`;
  const timerLabel = timer.charAt(0).toUpperCase() + timer.slice(1);
  return `Score (${diffLabel} + ${timerLabel})`;
}

function loadState(key: string): ScoreState {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as ScoreState;
  } catch {
    // corrupted storage — start fresh
  }
  return { totalPoints: 0, maxPoints: 0, movesPlayed: 0, streak: 0, bestStreak: 0 };
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
export function useScore(engineElo: number | null, blitzEnabled: boolean, blitzSeconds: number) {
  // Store the last seen combo key to detect setting changes during render.
  const currentKey = scoreKey(engineElo, blitzEnabled, blitzSeconds);
  const [lastKey, setLastKey] = useState(currentKey);
  const [scoreState, setScoreState] = useState<ScoreState>(() =>
    loadState(currentKey),
  );
  const stateRef = useRef<ScoreState>(scoreState);
  const keyRef = useRef(currentKey);

  // React "derived state from props" pattern: update state during render
  // (guarded condition; no effect needed, no ref access).
  if (lastKey !== currentKey) {
    setLastKey(currentKey);
    setScoreState(loadState(currentKey));
  }

  // Sync refs after every render (ref mutations only — no setState).
  useEffect(() => {
    stateRef.current = scoreState;
    keyRef.current = currentKey;
  });


  const record = useCallback((points: number): number => {
    const prev = stateRef.current;
    const isScoring = points > 0;
    const streak = isScoring ? prev.streak + 1 : 0;

    // Streak bonus: +1 at streak 3–5, +2 at streak 6+
    const streakBonus = streak >= 6 ? 2 : streak >= 3 ? 1 : 0;
    // Off-book penalty is already encoded as −1 in scoreMove

    const delta = points + streakBonus;
    const newTotal = Math.max(0, prev.totalPoints + delta);
    const next: ScoreState = {
      totalPoints: newTotal,
      maxPoints: Math.max(prev.maxPoints, newTotal),
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
      maxPoints: 0,
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
      // maxPoints is not reduced by deductions
    };
    stateRef.current = next;
    setScoreState(next);
    saveState(keyRef.current, next);
  }, []);

  return { scoreState, record, reset, deductPoints };
}
