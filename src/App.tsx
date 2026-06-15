import { useCallback, useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import type { EngineMove, Evaluation, MoveResult, Position } from './types'
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
  const [gmMoveEval, setGmMoveEval] = useState<Evaluation | undefined>(undefined)

  // Prevent double-loading in React StrictMode or fast click.
  const loadingRef = useRef(false)
  // Holds the pre-calculated analysis promise started as soon as a position
  // loads, so the engine has already been thinking while the user considers.
  const preAnalysisRef = useRef<Promise<EngineMove[]> | null>(null)

  const loadNextPosition = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setPhase('loading')
    setResult(null)
    setEngineMoves([])
    setResultArrows([])
    setEngineError(null)
    setGmMoveEval(undefined)

    try {
      const pos = await fetchPosition()
      setPosition(pos)
      setPhase('playing')
      // Start engine analysis immediately while the user is reading the position.
      preAnalysisRef.current = analyze(pos.fen)
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
    setPhase('loading')

    let moves: EngineMove[] = []
    try {
      // Await the analysis that started while the user was thinking.
      // Falls back to a fresh analysis if the pre-calc promise is missing.
      moves = await (preAnalysisRef.current ?? analyze(position.fen))
      preAnalysisRef.current = null
      setEngineMoves(moves)
    } catch (err) {
      setEngineError(String(err))
    }

    // Helpers to analyze a position after a single UCI move and return the
    // evaluation from the moving side's perspective (negated from the engine's
    // opponent-to-move output).
    async function evalAfterMove(fen: string, move: string): Promise<Evaluation | undefined> {
      try {
        const chess = new Chess(fen)
        chess.move({ from: move.slice(0, 2) as Square, to: move.slice(2, 4) as Square, promotion: move[4] })
        const followUp = await analyze(chess.fen(), 500)
        if (!followUp[0]) return undefined
        const raw = followUp[0].evaluation
        return raw.type === 'cp'
          ? { type: 'cp', value: -raw.value }
          : { type: 'mate', value: -raw.value }
      } catch {
        return undefined
      }
    }

    // For top-3 engine moves the eval is already known; for off-book moves
    // run a quick follow-up analysis on the resulting position.
    const inTop3 = moves.find((m) => m.uci === uci)
    const gmInTop3 = moves.find((m) => m.uci === position.gmMove)

    let userMoveEval: Evaluation | undefined = inTop3?.evaluation
    if (!inTop3) {
      userMoveEval = await evalAfterMove(position.fen, uci)
    }

    // Eval for the GM move when it isn't covered by the top-3 analysis.
    let gmEval: Evaluation | undefined = gmInTop3?.evaluation
    if (!gmInTop3) {
      // Reuse the result we already computed when the user played the GM move.
      gmEval = uci === position.gmMove ? userMoveEval : await evalAfterMove(position.fen, position.gmMove)
    }
    setGmMoveEval(gmEval)

    // Use UCI as the displayed SAN fallback. The FeedbackPanel shows UCI squares.
    const moveResult = scoreMove(uci, uci, position.gmMove, moves, userMoveEval)
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
              gmMoveEval={gmMoveEval}
              engineMoves={engineMoves}
              onNext={() => void loadNextPosition()}
            />
          </>
        )}
      </main>
    </div>
  )
}
