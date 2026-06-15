import { Chess } from 'chess.js'
import type { Position } from '../types'

/**
 * Parse a PGN string and extract a random middlegame position from it.
 *
 * "Middlegame" is defined as: full-move number ≥ 8, ≥ 14 pieces still on the
 * board, and not the very last move of the game (so there is always a next
 * move to guess). Returns null when the PGN is invalid or no qualifying ply
 * is found.
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
  // at a middlegame depth, and with enough pieces still on the board.
  const candidates = fullHistory
    .slice(0, -1) // exclude final move so the GM move is always full history[i+1]
    .map((m, i) => ({ move: fullHistory[i + 1], fen: m.after, index: i + 1 }))
    .filter(({ fen, index: _index }) => {
      const fields = fen.split(' ')
      const fullmove = Number(fields[5])
      const pieces = (fields[0].match(/[a-zA-Z]/g) ?? []).length
      const side = fields[1] === 'w' ? 'white' : 'black'
      return fullmove >= 8 && pieces >= 14 && (gmColor === undefined || side === gmColor)
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
