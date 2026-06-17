import type { EngineMove } from "../types";
import type { BoardArrow } from "../components/Board";

/**
 * Build arrow overlays for the result phase:
 *  - Green  → engine #1
 *  - Yellow → engine #2
 *  - Orange → engine #3
 *  - Blue   → GM move (if not already in engine top-3)
 *  - Red    → player's move (if none of the above)
 */
export function buildResultArrows(
  gmMove: string,
  engineMoves: EngineMove[],
  playerMove: string,
): BoardArrow[] {
  const arrows: BoardArrow[] = [];
  const uciToArrow = (uci: string, color: string): BoardArrow => ({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    color,
  });

  for (const em of engineMoves) {
    const color =
      em.rank === 1 ? "#22c55e" : em.rank === 2 ? "#eab308" : "#f97316";
    arrows.push(uciToArrow(em.uci, color));
  }

  // GM in blue if it wasn't already shown as an engine top-3 move
  const gmInTop3 = engineMoves.some((em) => em.uci === gmMove);
  if (!gmInTop3) {
    arrows.push(uciToArrow(gmMove, "#3b82f6")); // blue
  }

  // Only show player arrow when it's a miss (not covered by engine or GM arrow)
  const inEngine = engineMoves.some((m) => m.uci === playerMove);
  const isMiss = !inEngine && playerMove !== gmMove;
  if (isMiss) {
    arrows.push(uciToArrow(playerMove, "#ef4444")); // red — matches badge--miss
  }

  return arrows;
}
