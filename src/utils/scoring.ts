import type { EngineMove, Evaluation, MoveResult, ScoreReason } from "../types";

/**
 * Score a player's move against the GM move and the engine's top-3.
 *
 * Rules:
 *  - Engine #1 (regardless of GM)              → 3 pts
 *  - Engine #2 + GM match                      → 3 pts
 *  - Engine #2 only                            → 2 pts
 *  - Engine #3 + GM match                      → 2 pts
 *  - Engine #3 only                            → 1 pt
 *  - GM only (not in top 3)                    → 1 pt
 *  - Off-book but better eval than GM           → 1 pt
 *  - Off-book                                  → −1 pt
 *
 * All moves are compared in UCI/long-algebraic form (e.g. "e2e4", "e7e8q").
 */

/** Convert an Evaluation to a single comparable number (higher = better for side to move). */
function evalToNumber(ev: Evaluation): number {
  if (ev.type === "mate")
    return ev.value > 0 ? 1_000_000 - ev.value : -1_000_000 - ev.value;
  return ev.value;
}

export function scoreMove(
  playerUci: string,
  playerSan: string,
  gmUci: string,
  engineMoves: EngineMove[],
  userMoveEval?: Evaluation,
  gmMoveEval?: Evaluation,
): MoveResult {
  const matchedGm = playerUci === gmUci;
  const engineRankEntry = engineMoves.find((m) => m.uci === playerUci);
  const engineRank = engineRankEntry?.rank ?? null;

  let points: number;
  let reason: ScoreReason;

  if (engineRank === 1) {
    points = 3;
    reason = "engine-best";
  } else if (engineRank === 2 && matchedGm) {
    points = 3;
    reason = "gm-and-engine-second";
  } else if (engineRank === 2) {
    points = 2;
    reason = "engine-second";
  } else if (engineRank === 3 && matchedGm) {
    points = 2;
    reason = "gm-and-engine-third";
  } else if (engineRank === 3) {
    points = 1;
    reason = "engine-third";
  } else {
    // Check if the player's move is stronger than any of the engine's top suggestions.
    const playerNum =
      userMoveEval !== undefined ? evalToNumber(userMoveEval) : null;
    const e1 = engineMoves.find((m) => m.rank === 1);
    const e2 = engineMoves.find((m) => m.rank === 2);
    const e3 = engineMoves.find((m) => m.rank === 3);

    if (playerNum !== null && e1 && playerNum > evalToNumber(e1.evaluation)) {
      points = 3;
      reason = "beat-engine-first";
    } else if (
      playerNum !== null &&
      e2 &&
      playerNum > evalToNumber(e2.evaluation)
    ) {
      points = 2;
      reason = "beat-engine-second";
    } else if (
      playerNum !== null &&
      e3 &&
      playerNum > evalToNumber(e3.evaluation)
    ) {
      points = 1;
      reason = "beat-engine-third";
    } else if (matchedGm) {
      points = 1;
      reason = "gm-move";
    } else if (
      playerNum !== null &&
      gmMoveEval !== undefined &&
      playerNum > evalToNumber(gmMoveEval)
    ) {
      points = 1;
      reason = "beat-gm";
    } else {
      points = -1;
      reason = "off-book";
    }
  }

  return {
    playerMove: playerUci,
    playerSan,
    points,
    reason,
    matchedGm,
    engineRank,
    userMoveEval,
  };
}
