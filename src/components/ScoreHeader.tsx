import type { ScoreState } from "../types";

interface ScoreHeaderProps {
  scoreState: ScoreState;
}

export function ScoreHeader({ scoreState }: ScoreHeaderProps) {
  const { totalPoints, movesPlayed, streak } = scoreState;
  return (
    <header className="score-header">
      <div className="score-header__inner">
      <span className="score-header__title">Chess the Move</span>
      <div className="score-header__stats">
        <span className="stat">
          <span className="stat__label">Score</span>
          <span className="stat__value">{totalPoints}</span>
        </span>
        <span className="stat">
          <span className="stat__label">Moves</span>
          <span className="stat__value">{movesPlayed}</span>
        </span>
        {streak >= 2 && (
          <span className="stat stat--streak">
            <span className="stat__label">Streak</span>
            <span className="stat__value">{streak}🔥</span>
          </span>
        )}
      </div>
      </div>
    </header>
  );
}
