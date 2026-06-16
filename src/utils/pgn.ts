import { Chess } from 'chess.js'
import type { Position } from '../types'

// Speelman's endgame threshold: a player is in the endgame when they have
// ≤ 13 material points (Q=9, R=5, B=3, N=3, P=1, king excluded).
// Middlegame requires both sides to exceed this threshold.
const PIECE_VALUES: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 }

function materialPoints(fenBoard: string, color: 'white' | 'black'): number {
  const pieces = color === 'white' ? fenBoard.match(/[QRBNP]/g) : fenBoard.match(/[qrbnp]/g)
  if (!pieces) return 0
  return pieces.reduce((sum, p) => sum + (PIECE_VALUES[p.toLowerCase()] ?? 0), 0)
}

/**
 * Parse a PGN string and extract a random middlegame position from it.
 *
 * "Middlegame" is defined as: full-move number ≥ 12 and both sides have more
 * than 13 material points (Speelman's threshold: Q=9, R=5, B=3, N=3, P=1,
 * king excluded), and not the very last move of the game (so there is always
 * a next move to guess). Returns null when the PGN is invalid or no
 * qualifying ply is found.
 */
export function pickPositionFromPgn(
  pgn: string,
  label: string,
  gmColor?: 'white' | 'black',
): Position | null {
  const chess = new Chess()
  try {
    chess.loadPgn(pgn)
  } catch {
    return null
  }

  const fullHistory = chess.history({ verbose: true })
  // Candidate plies: not the last move (we need the GM move to be playable),
  // at a middlegame depth, and with enough material on the board.
  const candidates = fullHistory
    .slice(0, -1) // exclude final move so the GM move is always full history[i+1]
    .map((m, i) => ({ move: fullHistory[i + 1], fen: m.after }))
    .filter(({ fen }) => {
      const fields = fen.split(' ')
      const fullmove = Number(fields[5])
      const board = fields[0]
      const side = fields[1] === 'w' ? 'white' : 'black'
      const whiteMat = materialPoints(board, 'white')
      const blackMat = materialPoints(board, 'black')
      return fullmove >= 12 && whiteMat > 13 && blackMat > 13 && (gmColor === undefined || side === gmColor)
    })

  if (candidates.length === 0) return null

  const pick = candidates[Math.floor(Math.random() * candidates.length)]
  const sideToMove = pick.fen.split(' ')[1] === 'w' ? 'white' : 'black'

  return {
    fen: pick.fen,
    gmMove: pick.move.lan,
    gmSan: pick.move.san,
    orientation: sideToMove,
    sideToMove,
    label,
    source: 'curated',
  }
}

/**
 * Build a human-readable game label from PGN header tags.
 * Falls back gracefully when tags are missing.
 */
export function labelFromPgn(pgn: string): string {
  const get = (tag: string) => {
    const m = pgn.match(new RegExp(`\\[${tag}\\s+"([^"]+)"\\]`))
    return m ? m[1] : '?'
  }
  const white = get('White')
  const black = get('Black')
  const event = get('Event')
  const date = get('Date').replace(/\.\?\?/, '').replace(/\..*$/, '')
  return `${white} vs ${black} — ${event} ${date}`.trim().replace(/\s+—\s+$/, '')
}
