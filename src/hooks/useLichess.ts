import { useCallback } from 'react'
import type { Position } from '../types'
import { curatedGames } from '../data/curatedGames'
import { pickPositionFromPgn, labelFromPgn } from '../utils/pgn'

// Active titled players with public rated games on Lichess (verified 2025-06).
const TITLED_PLAYERS = [
  'DrNykterstein',    // Magnus Carlsen, GM
  'nihalsarin2004',   // Nihal Sarin, GM
  'AnishGiri',        // Anish Giri, GM
  'Konevlad',         // Vladislav Artemiev, GM
  'Lintchevski_Daniil', // Daniil Lintchevski, GM
  'Abik02',           // Abdulla Gadimbayli, GM – World Junior Champion 2022
  'Zkid',             // Steven Zierk, GM
  'RealDavidNavara',  // David Navara, GM
  'penguingim1',      // Andrew Tang, GM
  'EricRosen',        // Eric Rosen, IM
]

const PERF_TYPES = 'blitz,rapid'
const GAMES_TO_FETCH = 20

/**
 * Fetch up to GAMES_TO_FETCH recent blitz/rapid games from a random titled
 * Lichess user, pick a random game, and extract a middlegame position via the
 * curated PGN logic.
 *
 * Falls back to the curated game list on any network error, 429, or when no
 * qualifying position is found in the live games.
 */
export function useLichess() {
  const fetchPosition = useCallback(async (): Promise<Position> => {
    try {
      const player =
        TITLED_PLAYERS[Math.floor(Math.random() * TITLED_PLAYERS.length)]
      const url =
        `https://lichess.org/api/games/user/${encodeURIComponent(player)}` +
        `?max=${GAMES_TO_FETCH}&perfType=${PERF_TYPES}&rated=true&opening=false&pgnInJson=true`

      const response = await fetch(url, {
        headers: { Accept: 'application/x-ndjson' },
        signal: AbortSignal.timeout(8000),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const text = await response.text()
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      if (lines.length === 0) throw new Error('empty response')

      // Shuffle so we do not always pick game #0.
      const shuffled = [...lines].sort(() => Math.random() - 0.5)

      for (const line of shuffled) {
        let game: { pgn?: string } | null = null
        try {
          game = JSON.parse(line) as { pgn?: string }
        } catch {
          continue
        }
        const pgn = game?.pgn
        if (!pgn) continue

        const label = labelFromPgn(pgn)
        const pos = pickPositionFromPgn(pgn, label)
        if (!pos) continue

        return { ...pos, source: 'lichess' }
      }

      throw new Error('no qualifying position in live games')
    } catch {
      // --- Curated fallback ---
      return pickFromCurated()
    }
  }, [])

  return { fetchPosition }
}

/** Pick a random position from the curated game list (always succeeds). */
export function pickFromCurated(): Position {
  const shuffled = [...curatedGames].sort(() => Math.random() - 0.5)
  for (const game of shuffled) {
    const label = labelFromPgn(game.pgn)
    const pos = pickPositionFromPgn(game.pgn, label)
    if (pos) return pos
  }
  // Absolute fallback: this cannot happen because all curated PGNs are pre-validated.
  throw new Error('All curated games exhausted — this should never happen.')
}
