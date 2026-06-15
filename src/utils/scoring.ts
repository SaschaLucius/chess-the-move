import type { EngineMove, Evaluation, MoveResult, ScoreReason } from '../types'

/**
 * Score a player's move against the GM move and the engine's top-3.
 *
 * Rules:
 *  - Engine #1 (regardless of GM)  → 3 pts
 *  - Engine #2 + GM match          → 3 pts
 *  - Engine #2 only                → 2 pts
 *  - Engine #3 + GM match          → 2 pts
 *  - Engine #3 only                → 1 pt
 *  - GM only (not in top 3)        → 1 pt
 *  - Off-book                      → −1 pt
 *
 * All moves are compared in UCI/long-algebraic form (e.g. "e2e4", "e7e8q").
 */
export function scoreMove(
  playerUci: string,
  playerSan: string,
  gmUci: string,
  engineMoves: EngineMove[],
  userMoveEval?: Evaluation,
): MoveResult {
  const matchedGm = playerUci === gmUci
  const engineRankEntry = engineMoves.find((m) => m.uci === playerUci)
  const engineRank = engineRankEntry?.rank ?? null

  let points: number
  let reason: ScoreReason

  if (engineRank === 1) {
    points = 3
    reason = 'engine-best'
  } else if (engineRank === 2 && matchedGm) {
    points = 3
    reason = 'gm-and-engine-second'
  } else if (engineRank === 2) {
    points = 2
    reason = 'engine-second'
  } else if (engineRank === 3 && matchedGm) {
    points = 2
    reason = 'gm-and-engine-third'
  } else if (engineRank === 3) {
    points = 1
    reason = 'engine-third'
  } else if (matchedGm) {
    points = 1
    reason = 'gm-move'
  } else {
    points = -1
    reason = 'off-book'
  }

  return { playerMove: playerUci, playerSan, points, reason, matchedGm, engineRank, userMoveEval }
}
