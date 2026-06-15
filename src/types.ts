// Shared domain types for the GM Move Trainer.
//
// NOTE: tsconfig.app.json enables `erasableSyntaxOnly`, so this file uses
// union string literals instead of `enum`s, and `verbatimModuleSyntax`, so any
// consumer importing these must use `import type { ... }`.

/** Engine evaluation from the side-to-move's perspective. */
export type Evaluation =
  | { type: 'cp'; value: number }
  | { type: 'mate'; value: number }

/** A single ranked engine candidate move. */
export interface EngineMove {
  /** Move in UCI/long-algebraic form, e.g. "e2e4" or "e7e8q". */
  uci: string
  /** Rank within the MultiPV output; 1 is the engine's best move. */
  rank: number
  /** Evaluation reported for this line. */
  evaluation: Evaluation
}

/** Where a puzzle position was sourced from. */
export type PositionSource = 'lichess' | 'curated'

/** A puzzle position extracted from a real game. */
export interface Position {
  /** FEN of the position the player must find a move in. */
  fen: string
  /** The move actually played in the game, in UCI form. */
  gmMove: string
  /** The played move in SAN, for display. */
  gmSan: string
  /** Board orientation so the side to move sits at the bottom. */
  orientation: 'white' | 'black'
  /** Side to move in this position. */
  sideToMove: 'white' | 'black'
  /** Human-readable game label, e.g. "Kasparov vs Topalov — Wijk aan Zee 1999". */
  label: string
  /** Origin of the position. */
  source: PositionSource
}

/** Why a given number of points was awarded. */
export type ScoreReason =
  | 'engine-best'           // engine #1 (always 3 pts)
  | 'gm-and-engine-second'  // engine #2 + GM match → 3 pts
  | 'engine-second'         // engine #2, no GM match → 2 pts
  | 'gm-and-engine-third'   // engine #3 + GM match → 2 pts
  | 'engine-third'          // engine #3, no GM match → 1 pt
  | 'gm-move'               // GM match, not in top 3 → 1 pt
  | 'off-book'              // none of the above → −1 pt

/** Outcome of scoring a player's guess against the GM and the engine. */
export interface MoveResult {
  /** The player's move in UCI form. */
  playerMove: string
  /** The player's move in SAN, for display. */
  playerSan: string
  /** Points awarded: −1, 1, 2, or 3. */
  points: number
  /** Explanation for the awarded points. */
  reason: ScoreReason
  /** True when the player matched the played GM move exactly. */
  matchedGm: boolean
  /** The player's rank in the engine top-3 (1–3), or null if absent. */
  engineRank: number | null
  /**
   * Evaluation of the position after the player's move, from the player's
   * perspective (positive = good for the player). Only set for off-book moves
   * where the top-3 analysis does not already carry an evaluation.
   */
  userMoveEval?: Evaluation
}

/** Running score persisted to localStorage. */
export interface ScoreState {
  /** Total points earned across all positions. */
  totalPoints: number
  /** Number of positions the player has answered. */
  movesPlayed: number
  /** Current consecutive streak of point-scoring guesses. */
  streak: number
  /** Best streak achieved so far. */
  bestStreak: number
}
