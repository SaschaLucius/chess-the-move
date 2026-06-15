import { useCallback, useEffect, useRef, useState } from 'react'
import type { EngineMove, MoveResult, Position } from './types'
import { useStockfish } from './hooks/useStockfish'
import { useLichess } from './hooks/useLichess'
import { useScore } from './hooks/useScore'
import { scoreMove } from './utils/scoring'
import { Board } from './components/Board'
import { FeedbackPanel, buildResultArrows } from './components/FeedbackPanel'
import { ScoreHeader } from './components/ScoreHeader'
import type { BoardArrow } from './components/Board'
import './App.css'

type Phase = 'loading' | 'playing' | 'result'

export default function App() {
  const { status: engineStatus, analyze } = useStockfish()
  const { fetchPosition } = useLichess()
  const { scoreState, record } = useScore()

  const [phase, setPhase] = useState<Phase>('loading')
  const [position, setPosition] = useState<Position | null>(null)
  const [engineMoves, setEngineMoves] = useState<EngineMove[]>([])
  const [result, setResult] = useState<MoveResult | null>(null)
  const [resultArrows, setResultArrows] = useState<BoardArrow[]>([])
  const [engineError, setEngineError] = useState<string | null>(null)

  // Prevent double-loading in React StrictMode or fast click.
  const loadingRef = useRef(false)

  const loadNextPosition = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setPhase('loading')
    setResult(null)
    setEngineMoves([])
    setResultArrows([])
    setEngineError(null)

    try {
      const pos = await fetchPosition()
      setPosition(pos)
      setPhase('playing')
    } finally {
      loadingRef.current = false
    }
  }, [fetchPosition])

  // Load the first position once the engine is ready.
  useEffect(() => {
    if (engineStatus === 'ready' && phase === 'loading' && position === null) {
      void loadNextPosition()
    }
  }, [engineStatus, phase, position, loadNextPosition])

  async function handleMove(uci: string) {
    if (phase !== 'playing' || !position) return
    setPhase('loading') // show spinner during engine analysis

    let moves: EngineMove[] = []
    try {
      moves = await analyze(position.fen)
      setEngineMoves(moves)
    } catch (err) {
      setEngineError(String(err))
    }

    // Use UCI as the displayed SAN fallback. The FeedbackPanel shows UCI squares.
    const moveResult = scoreMove(uci, uci, position.gmMove, moves)
    record(moveResult.points)
    setResult(moveResult)
    setResultArrows(buildResultArrows(position.gmMove, moves, uci))
    setPhase('result')
  }

  return (
    <div className="app">
      <ScoreHeader scoreState={scoreState} />

      <main className="main">
        {phase === 'loading' && (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>
              {engineStatus === 'loading'
                ? 'Loading Stockfish 18…'
                : engineStatus === 'analyzing'
                  ? 'Analyzing…'
                  : 'Loading position…'}
            </p>
          </div>
        )}

        {position && (
          <>
            <div className="position-label">
              <span className={`source-badge source-badge--${position.source}`}>
                {position.source === 'lichess' ? 'Lichess live' : 'Classic'}
              </span>
              <span className="game-label">{position.label}</span>
              <span className="side-to-move">
                {position.sideToMove === 'white' ? '⬜' : '⬛'} to move
              </span>
            </div>

            <div className="board-wrapper">
              <Board
                position={position}
                onMove={(uci) => void handleMove(uci)}
                interactive={phase === 'playing'}
                arrows={phase === 'result' ? resultArrows : []}
              />
            </div>
          </>
        )}

        {phase === 'result' && result && position && (
          <>
            {engineError && (
              <p className="engine-error">Engine error: {engineError}</p>
            )}
            <FeedbackPanel
              result={result}
              gmMove={position.gmMove}
              engineMoves={engineMoves}
              onNext={() => void loadNextPosition()}
            />
          </>
        )}
      </main>
    </div>
  )
}
