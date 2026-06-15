import type { EngineMove, Evaluation, MoveResult } from "../types";
import type { BoardArrow } from "./Board";

interface FeedbackPanelProps {
  result: MoveResult;
  gmMove: string;
  gmMoveEval?: Evaluation;
  engineMoves: EngineMove[];
  onNext: () => void;
}

function formatEval(ev: Evaluation): string {
  if (ev.type === "mate") {
    return ev.value > 0 ? `M${ev.value}` : `−M${Math.abs(ev.value)}`;
  }
  const pawns = ev.value / 100;
  return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
}

function pointsClass(points: number): string {
  if (points === 3) return "pts pts--3";
  if (points === 2) return "pts pts--2";
  if (points === 1) return "pts pts--1";
  return "pts pts--0";
}

/**
 * Build arrow overlays for the result phase:
 *  - Green  → engine #1
 *  - Yellow → engine #2
 *  - Orange → engine #3
 *  - Blue   → GM move (if not already in engine top-3)
 *  - Red    → player's move (if none of the above)
 */
export function buildResultArrows(
  gmMove: string,
  engineMoves: EngineMove[],
  playerMove: string,
): BoardArrow[] {
  const arrows: BoardArrow[] = [];
  const uciToArrow = (uci: string, color: string): BoardArrow => ({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    color,
  });

  for (const em of engineMoves) {
    const color =
      em.rank === 1 ? "#22c55e" : em.rank === 2 ? "#eab308" : "#f97316";
    arrows.push(uciToArrow(em.uci, color));
  }

  // GM in blue if it wasn't already shown as an engine top-3 move
  const gmInTop3 = engineMoves.some((em) => em.uci === gmMove);
  if (!gmInTop3) {
    arrows.push(uciToArrow(gmMove, "#3b82f6")); // blue
  }

  const inEngine = engineMoves.some((m) => m.uci === playerMove);
  if (playerMove !== gmMove && !inEngine) {
    arrows.push(uciToArrow(playerMove, "#ef4444")); // red — missed entirely
  }

  return arrows;
}

export function FeedbackPanel({
  result,
  gmMove,
  gmMoveEval,
  engineMoves,
  onNext,
}: FeedbackPanelProps) {
  const gmInTop3 = engineMoves.some((em) => em.uci === gmMove);

  return (
    <div className="feedback-panel">
      <div className={pointsClass(result.points)}>
        {result.points === 0 ? "0 pts" : `+${result.points} pts`}
      </div>

      <div className="feedback-moves">
        {!gmInTop3 && (
          <div
            className={`feedback-move feedback-move--gm${result.playerMove === gmMove ? " feedback-move--player" : ""}`}
          >
            <span className="badge badge--gm">GM</span>
            {result.playerMove === gmMove && (
              <span className="badge badge--you">YOU</span>
            )}
            <span className="move-san">
              {gmMove.slice(0, 2)}→{gmMove.slice(2, 4)}
            </span>
            {gmMoveEval !== undefined && (
              <span className="move-eval">{formatEval(gmMoveEval)}</span>
            )}
          </div>
        )}

        {engineMoves.map((em) => (
          <div
            key={em.rank}
            className={`feedback-move feedback-move--engine${em.rank}${
              em.uci === result.playerMove ? " feedback-move--player" : ""
            }${em.uci === gmMove ? " feedback-move--gm-merged" : ""}`}
          >
            <span className={`badge badge--engine${em.rank}`}>#{em.rank}</span>
            {em.uci === gmMove && <span className="badge badge--gm">GM</span>}
            {em.uci === result.playerMove && (
              <span className="badge badge--you">YOU</span>
            )}
            <span className="move-san">
              {em.uci.slice(0, 2)}→{em.uci.slice(2, 4)}
            </span>
            <span className="move-eval">{formatEval(em.evaluation)}</span>
          </div>
        ))}

        {result.engineRank === null && result.playerMove !== gmMove && (
          <div className="feedback-move feedback-move--miss">
            <span className="badge badge--miss">You</span>
            <span className="move-san">{result.playerSan}</span>
            {result.userMoveEval !== undefined && (
              <span className="move-eval">
                {formatEval(result.userMoveEval)}
              </span>
            )}
          </div>
        )}
      </div>

      <button className="btn-next" onClick={onNext}>
        Next Position →
      </button>
    </div>
  );
}
