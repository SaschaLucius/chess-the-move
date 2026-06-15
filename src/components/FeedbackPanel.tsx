import type { EngineMove, Evaluation, MoveResult, ScoreReason } from '../types'
import type { BoardArrow } from './Board'

interface FeedbackPanelProps {
  result: MoveResult
  gmMove: string
  engineMoves: EngineMove[]
  onNext: () => void
}

function formatEval(ev: Evaluation): string {
  if (ev.type === 'mate') {
    return ev.value > 0 ? `M${ev.value}` : `−M${Math.abs(ev.value)}`
  }
  const pawns = ev.value / 100
  return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2)
}

function reasonLabel(reason: ScoreReason): string {
  switch (reason) {
    case 'gm-and-engine-best':
      return "Matched the GM and engine's best!"
    case 'gm-move':
      return "Matched the GM's move!"
    case 'engine-best':
      return "Engine's top choice!"
    case 'engine-second':
      return "Engine's 2nd choice"
    case 'engine-third':
      return "Engine's 3rd choice"
    case 'off-book':
      return 'Not in the engine top 3'
  }
}

function pointsClass(points: number): string {
  if (points === 3) return 'pts pts--3'
  if (points === 2) return 'pts pts--2'
  if (points === 1) return 'pts pts--1'
  return 'pts pts--0'
}

/**
 * Build arrow overlays for the result phase:
 *  - Green   → GM move
 *  - Blue    → engine #1 (if different from GM)
 *  - Yellow  → engine #2
 *  - Orange  → engine #3
 *  - Red     → player's move (if none of the above)
 */
export function buildResultArrows(
  gmMove: string,
  engineMoves: EngineMove[],
  playerMove: string,
): BoardArrow[] {
  const arrows: BoardArrow[] = []
  const uciToArrow = (uci: string, color: string): BoardArrow => ({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    color,
  })

  arrows.push(uciToArrow(gmMove, '#22c55e')) // green

  for (const em of engineMoves) {
    if (em.uci === gmMove) continue
    const color = em.rank === 1 ? '#3b82f6' : em.rank === 2 ? '#eab308' : '#f97316'
    arrows.push(uciToArrow(em.uci, color))
  }

  const inEngine = engineMoves.some((m) => m.uci === playerMove)
  if (playerMove !== gmMove && !inEngine) {
    arrows.push(uciToArrow(playerMove, '#ef4444')) // red — missed entirely
  }

  return arrows
}

export function FeedbackPanel({ result, gmMove, engineMoves, onNext }: FeedbackPanelProps) {
  return (
    <div className="feedback-panel">
      <div className={pointsClass(result.points)}>
        {result.points === 0 ? '0 pts' : `+${result.points} pts`}
      </div>
      <p className="feedback-reason">{reasonLabel(result.reason)}</p>

      <div className="feedback-moves">
        <div className="feedback-move feedback-move--gm">
          <span className="badge badge--gm">GM</span>
          <span className="move-san">{gmMove.slice(0, 2)}→{gmMove.slice(2, 4)}</span>
        </div>

        {engineMoves.map((em) => (
          <div
            key={em.rank}
            className={`feedback-move feedback-move--engine${em.rank}${
              em.uci === result.playerMove ? ' feedback-move--player' : ''
            }`}
          >
            <span className="badge badge--engine">#{em.rank}</span>
            <span className="move-san">{em.uci.slice(0, 2)}→{em.uci.slice(2, 4)}</span>
            <span className="move-eval">{formatEval(em.evaluation)}</span>
          </div>
        ))}

        {result.engineRank === null && result.playerMove !== gmMove && (
          <div className="feedback-move feedback-move--miss">
            <span className="badge badge--miss">You</span>
            <span className="move-san">{result.playerSan}</span>
          </div>
        )}
      </div>

      <button className="btn-next" onClick={onNext}>
        Next Position →
      </button>
    </div>
  )
}
