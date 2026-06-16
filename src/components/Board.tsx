import { useState } from 'react'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import type { Arrow, PieceDropHandlerArgs, PieceHandlerArgs, SquareHandlerArgs } from 'react-chessboard'
import type { Position } from '../types'

export interface BoardArrow {
  from: string
  to: string
  color: string
}

interface BoardProps {
  position: Position
  /** Called with the player's move in UCI form when a piece is dropped or clicked. */
  onMove: (uci: string) => void
  /** Whether the board is interactive (false during result phase). */
  interactive: boolean
  /** Optional decorative arrows to overlay (used in result phase). */
  arrows?: BoardArrow[]
  /** Optional square highlights (merged with internal selection highlights). */
  squareStyles?: Record<string, React.CSSProperties>
}

const SELECTED_STYLE: React.CSSProperties = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
const MOVE_DOT_STYLE: React.CSSProperties = {
  background: 'radial-gradient(circle, rgba(0,0,0,.18) 28%, transparent 28%)',
  cursor: 'pointer',
}
const CAPTURE_RING_STYLE: React.CSSProperties = {
  background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,.18) 60%)',
  cursor: 'pointer',
}

export function Board({
  position,
  onMove,
  interactive,
  arrows = [],
  squareStyles = {},
}: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalTargets, setLegalTargets] = useState<string[]>([])

  const rcbArrows: Arrow[] = arrows.map((a) => ({
    startSquare: a.from,
    endSquare: a.to,
    color: a.color,
  }))

  // pieceType format from react-chessboard is 'wP', 'bN', etc.
  function isCurrentPlayerPiece(pieceType: string): boolean {
    return position.sideToMove === 'white'
      ? pieceType.startsWith('w')
      : pieceType.startsWith('b')
  }

  function getLegalTargets(square: string): string[] {
    const chess = new Chess(position.fen)
    return chess
      .moves({ square: square as Square, verbose: true })
      .map((m) => m.to)
  }

  function commitMove(from: string, to: string) {
    setSelectedSquare(null)
    setLegalTargets([])
    // Emit a plain 4-char UCI. Promotion piece is intentionally omitted so
    // that any promotion to any square matches the GM move regardless of which
    // piece was chosen (the scoring only cares about the destination square).
    onMove(`${from}${to}`)
  }

  function handleSquareClick({ piece, square }: SquareHandlerArgs) {
    if (!interactive) return

    // Move to a legal target square.
    if (selectedSquare && legalTargets.includes(square)) {
      commitMove(selectedSquare, square)
      return
    }

    // Select a piece belonging to the side to move.
    if (piece && isCurrentPlayerPiece(piece.pieceType)) {
      const targets = getLegalTargets(square)
      setSelectedSquare(square)
      setLegalTargets(targets)
      return
    }

    // Deselect on any other click.
    setSelectedSquare(null)
    setLegalTargets([])
  }

  function handleSquareMouseDown({ piece, square }: SquareHandlerArgs) {
    if (!interactive) return
    if (piece && isCurrentPlayerPiece(piece.pieceType)) {
      const targets = getLegalTargets(square)
      setSelectedSquare(square)
      setLegalTargets(targets)
    }
  }

  function handlePieceDrag({ square }: PieceHandlerArgs) {
    if (!interactive || !square) return
    const targets = getLegalTargets(square)
    setSelectedSquare(square)
    setLegalTargets(targets)
  }

  function handleDrop({ sourceSquare, targetSquare, piece }: PieceDropHandlerArgs) {
    // Always clear highlights when a drop is attempted (valid or not).
    setSelectedSquare(null)
    setLegalTargets([])

    if (!interactive || targetSquare === null) return false

    // Validate the move with chess.js before accepting it.
    try {
      const chess = new Chess(position.fen)
      chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    } catch {
      return false
    }

    // Emit a plain 4-char UCI. Promotion piece is intentionally omitted (see commitMove).
    onMove(`${sourceSquare}${targetSquare}`)
    return true
  }

  // Build the merged square styles: internal highlights first, then external (result arrows etc.)
  const internalStyles: Record<string, React.CSSProperties> = {}
  if (selectedSquare) {
    internalStyles[selectedSquare] = SELECTED_STYLE
    const chess = new Chess(position.fen)
    for (const sq of legalTargets) {
      const hasPiece = !!chess.get(sq as Square)
      internalStyles[sq] = hasPiece ? CAPTURE_RING_STYLE : MOVE_DOT_STYLE
    }
  }
  const mergedSquareStyles = { ...internalStyles, ...squareStyles }

  return (
    <Chessboard
      options={{
        position: position.fen,
        boardOrientation: position.orientation,
        onPieceDrop: handleDrop,
        onPieceDrag: handlePieceDrag,
        onSquareClick: handleSquareClick,
        onSquareMouseDown: handleSquareMouseDown,
        allowDragging: interactive,
        canDragPiece: ({ piece }: PieceHandlerArgs) =>
          interactive && isCurrentPlayerPiece(piece.pieceType),
        arrows: rcbArrows,
        squareStyles: mergedSquareStyles,
        animationDurationInMs: 200,
        allowDrawingArrows: false,
      }}
    />
  )
}
