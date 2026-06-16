import { Chess } from "chess.js";
import type { Square } from "chess.js";
import type { EngineMove, Evaluation, MoveResult } from "../types";

interface FeedbackPanelProps {
  result: MoveResult;
  fen: string;
  gmMove: string;
  gmSan: string;
  gmMoveEval?: Evaluation;
  engineMoves: EngineMove[];
  pointsDelta: number;
  onNext: () => void;
}

/** Convert a UCI move to SAN given the position FEN. Falls back to "a1→b2" on error. */
function uciToSan(fen: string, uci: string): string {
  try {
    const chess = new Chess(fen);
    const result = chess.move({
      from: uci.slice(0, 2) as Square,
      to: uci.slice(2, 4) as Square,
      promotion: (uci[4] as "q" | "r" | "b" | "n" | undefined) ?? "q",
    });
    return result.san;
  } catch {
    return `${uci.slice(0, 2)}→${uci.slice(2, 4)}`;
  }
}

function formatEval(ev: Evaluation): string {
  if (ev.type === "mate") {
    return ev.value > 0 ? `M${ev.value}` : `−M${Math.abs(ev.value)}`;
  }
  const pawns = ev.value / 100;
  return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
}

function pointsClass(delta: number): string {
  if (delta < 0) return "pts pts--negative";
  if (delta >= 3) return "pts pts--3";
  if (delta === 2) return "pts pts--2";
  if (delta === 1) return "pts pts--1";
  return "pts pts--0";
}

/** Convert an evaluation to a numeric score for sorting (higher = better). */
function evalScore(
  ev: Evaluation | undefined,
  unknownFallback = Infinity,
): number {
  if (ev === undefined) return unknownFallback;
  if (ev.type === "mate")
    return ev.value > 0 ? 100000 - ev.value : -100000 - ev.value;
  return ev.value;
}

type ListItem =
  | { kind: "gm" }
  | { kind: "engine"; move: EngineMove }
  | { kind: "miss" };

export function FeedbackPanel({
  result,
  fen,
  gmMove,
  gmSan,
  gmMoveEval,
  engineMoves,
  pointsDelta,
  onNext,
}: FeedbackPanelProps) {
  const gmInTop3 = engineMoves.some((em) => em.uci === gmMove);
  const streakBonus = pointsDelta > 0 ? pointsDelta - result.points : 0;

  const isPlayerMiss =
    result.engineRank === null && result.playerMove !== gmMove;

  // Build a sorted list of moves (engine + GM if separate + player miss), best first.
  const sortedItems: ListItem[] = [
    ...engineMoves.map((move): ListItem => ({ kind: "engine", move })),
    ...(!gmInTop3 ? [{ kind: "gm" } as ListItem] : []),
    ...(isPlayerMiss ? [{ kind: "miss" } as ListItem] : []),
  ].sort((a, b) => {
    // Engine moves are ranked by Stockfish itself; use that rank directly so
    // that small cross-depth evaluation differences don't re-order #1/#2/#3.
    if (a.kind === "engine" && b.kind === "engine") {
      return a.move.rank - b.move.rank;
    }
    const sa =
      a.kind === "gm"
        ? evalScore(gmMoveEval, Infinity)
        : a.kind === "miss"
          ? evalScore(result.userMoveEval, -Infinity)
          : evalScore(a.move.evaluation);
    const sb =
      b.kind === "gm"
        ? evalScore(gmMoveEval, Infinity)
        : b.kind === "miss"
          ? evalScore(result.userMoveEval, -Infinity)
          : evalScore(b.move.evaluation);
    return sb - sa;
  });

  return (
    <div className="feedback-panel">
      <div className={pointsClass(pointsDelta)}>
        {pointsDelta < 0
          ? `${pointsDelta} pt`
          : pointsDelta === 0
            ? "0 pts"
            : `+${pointsDelta} pts`}
        {streakBonus > 0 && (
          <span className="pts__streak-bonus"> (+{streakBonus}🔥)</span>
        )}
      </div>

      <div className="feedback-moves">
        {sortedItems.map((item) =>
          item.kind === "gm" ? (
            <div
              key="gm"
              className={`feedback-move feedback-move--gm${result.playerMove === gmMove ? " feedback-move--player" : ""}`}
            >
              <span className="badge badge--gm">GM</span>
              {result.playerMove === gmMove && (
                <span className="badge badge--you">YOU</span>
              )}
              <span className="move-san">{gmSan}</span>
              {gmMoveEval !== undefined && (
                <span className="move-eval">{formatEval(gmMoveEval)}</span>
              )}
            </div>
          ) : item.kind === "miss" ? (
            <div key="miss" className="feedback-move feedback-move--miss">
              <span className="badge badge--miss">You</span>
              <span className="move-san">{result.playerSan}</span>
              {result.userMoveEval !== undefined && (
                <span className="move-eval">
                  {formatEval(result.userMoveEval)}
                </span>
              )}
            </div>
          ) : (
            <div
              key={item.move.rank}
              className={`feedback-move feedback-move--engine${item.move.rank}${
                item.move.uci === result.playerMove
                  ? " feedback-move--player"
                  : ""
              }${item.move.uci === gmMove ? " feedback-move--gm-merged" : ""}`}
            >
              <span className={`badge badge--engine${item.move.rank}`}>
                #{item.move.rank}
              </span>
              {item.move.uci === gmMove && (
                <span className="badge badge--gm">GM</span>
              )}
              {item.move.uci === result.playerMove && (
                <span className="badge badge--you">YOU</span>
              )}
              <span className="move-san">{uciToSan(fen, item.move.uci)}</span>
              <span className="move-eval">
                {formatEval(item.move.evaluation)}
              </span>
            </div>
          ),
        )}
      </div>

      <button className="btn-next" onClick={onNext}>
        Next Position →
      </button>
    </div>
  );
}
