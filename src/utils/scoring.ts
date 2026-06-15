import type { EngineMove, Evaluation, MoveResult, ScoreReason } from '../types'

/**
 * Score a player's move against the GM move and the engine's top-3.
 *
 * Rules (from the plan):
 *  - Player matched GM move AND engine's #1 → 3 pts, reason 'gm-and-engine-best'
 *  - Player matched GM move only               → 3 pts, reason 'gm-move'
 *  - Player matched engine #1 (not GM)         → 3 pts, reason 'engine-best'
 *  - Player matched engine #2                  → 2 pts, reason 'engine-second'
 *  - Player matched engine #3                  → 1 pt,  reason 'engine-third'
 *  - None of the above                         → 0 pts, reason 'off-book'
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

  const isEngineBest = engineRank === 1
  const matchedEngine2 = engineRank === 2
  const matchedEngine3 = engineRank === 3

  let points: number
  let reason: ScoreReason

  if (matchedGm && isEngineBest) {
    points = 3
    reason = 'gm-and-engine-best'
  } else if (matchedGm) {
    points = 3
    reason = 'gm-move'
  } else if (isEngineBest) {
    points = 3
    reason = 'engine-best'
  } else if (matchedEngine2) {
    points = 2
    reason = 'engine-second'
  } else if (matchedEngine3) {
    points = 1
    reason = 'engine-third'
  } else {
    points = 0
    reason = 'off-book'
  }

  return { playerMove: playerUci, playerSan, points, reason, matchedGm, engineRank, userMoveEval }
}
