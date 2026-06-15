import { Chessboard } from 'react-chessboard'
import type { Arrow, PieceDropHandlerArgs } from 'react-chessboard'
import type { Position } from '../types'

export interface BoardArrow {
  from: string
  to: string
  color: string
}

interface BoardProps {
  position: Position
  /** Called with the player's move in UCI form when a piece is dropped. */
  onMove: (uci: string) => void
  /** Whether the board is interactive (false during result phase). */
  interactive: boolean
  /** Optional decorative arrows to overlay (used in result phase). */
  arrows?: BoardArrow[]
  /** Optional square highlights. */
  squareStyles?: Record<string, React.CSSProperties>
}

/**
 * Thin wrapper around react-chessboard v5.
 * All move normalization to UCI is done here so the rest of the app never
 * deals with chess.js directly for the player's input.
 */
export function Board({
  position,
  onMove,
  interactive,
  arrows = [],
  squareStyles = {},
}: BoardProps) {
  const rcbArrows: Arrow[] = arrows.map((a) => ({
    startSquare: a.from,
    endSquare: a.to,
    color: a.color,
  }))

  function handleDrop({ sourceSquare, targetSquare, piece }: PieceDropHandlerArgs) {
    if (!interactive || targetSquare === null) return false
    // Determine if this is a pawn promotion attempt.
    const isPromotion =
      piece.pieceType.toLowerCase() === 'p' &&
      ((position.sideToMove === 'white' && targetSquare[1] === '8') ||
        (position.sideToMove === 'black' && targetSquare[1] === '1'))
    // Always promote to queen in this trainer (no underpromotion UI needed).
    const uci = isPromotion
      ? `${sourceSquare}${targetSquare}q`
      : `${sourceSquare}${targetSquare}`
    onMove(uci)
    return true
  }

  return (
    <Chessboard
      options={{
        position: position.fen,
        boardOrientation: position.orientation,
        onPieceDrop: handleDrop,
        allowDragging: interactive,
        arrows: rcbArrows,
        squareStyles,
        animationDurationInMs: 200,
        allowDrawingArrows: false,
      }}
    />
  )
}
