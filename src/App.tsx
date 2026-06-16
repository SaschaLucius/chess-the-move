import { useCallback, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import type { EngineMove, Evaluation, MoveResult, Position } from "./types";
import { useStockfish } from "./hooks/useStockfish";
import { useLichess } from "./hooks/useLichess";
import { useScore } from "./hooks/useScore";
import { scoreMove } from "./utils/scoring";
import { Board } from "./components/Board";
import { FeedbackPanel } from "./components/FeedbackPanel";
import { buildResultArrows } from "./utils/arrows";
import { ScoreHeader } from "./components/ScoreHeader";
import type { BoardArrow } from "./components/Board";
import "./App.css";

type Phase = "loading" | "playing" | "result";

export default function App() {
  const { status: engineStatus, analyze, waitForReady } = useStockfish();
  const { fetchPosition } = useLichess();
  const { scoreState, record } = useScore();

  const [phase, setPhase] = useState<Phase>("loading");
  const [position, setPosition] = useState<Position | null>(null);
  const [engineMoves, setEngineMoves] = useState<EngineMove[]>([]);
  const [result, setResult] = useState<MoveResult | null>(null);
  const [lastDelta, setLastDelta] = useState<number>(0);
  const [resultArrows, setResultArrows] = useState<BoardArrow[]>([]);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [gmMoveEval, setGmMoveEval] = useState<Evaluation | undefined>(
    undefined,
  );

  // Prevent double-loading in React StrictMode or fast click.
  const loadingRef = useRef(false);
  // Keep a ref-copy of engineStatus so callbacks can read it without stale closures.
  const engineStatusRef = useRef(engineStatus);
  useEffect(() => { engineStatusRef.current = engineStatus; }, [engineStatus]);
  // Holds the pre-calculated analysis promise started as soon as a position
  // loads, so the engine has already been thinking while the user considers.
  const preAnalysisRef = useRef<Promise<EngineMove[]> | null>(null);
  // Prefetched next position (started during the result phase so the user
  // never waits for the network when they click "Next").
  const prefetchRef = useRef<Promise<Position | null> | null>(null);
  // Synchronously readable result of the prefetch:
  //   undefined = no prefetch started / still in flight
  //   null      = prefetch failed
  //   Position  = prefetch succeeded
  const prefetchResultRef = useRef<Position | null | undefined>(undefined);

  const loadNextPosition = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    // Always reset game state.
    setResult(null);
    setEngineMoves([]);
    setResultArrows([]);
    setEngineError(null);
    setGmMoveEval(undefined);

    try {
      let pos: Position | null = null;

      if (prefetchResultRef.current !== undefined) {
        // Prefetch already resolved — consume it and go straight to playing.
        pos = prefetchResultRef.current;
        prefetchRef.current = null;
        prefetchResultRef.current = undefined;
      } else if (prefetchRef.current) {
        // Prefetch still in flight — show loading and wait for it.
        setPhase("loading");
        pos = await prefetchRef.current;
        prefetchRef.current = null;
        prefetchResultRef.current = undefined;
      }

      // If the prefetch fell back to curated, discard it and try Lichess fresh
      // so we recover as soon as the API comes back up.
      if (pos?.source === 'curated') {
        preAnalysisRef.current = null;
        pos = null;
      }

      if (!pos) {
        // No prefetch or it failed — fetch now with loading indicator.
        setPhase("loading");
        pos = await fetchPosition();
        // Start pre-analysis only if engine is already ready; otherwise the
        // engineStatus effect below will kick it off once the engine is ready.
        if (engineStatusRef.current === 'ready') {
          preAnalysisRef.current = analyze(pos.fen);
        }
      }

      setPosition(pos);
      setPhase("playing");
    } finally {
      loadingRef.current = false;
    }
  }, [fetchPosition, analyze]);

  // Load the first position immediately on mount (engine loads in parallel).
  useEffect(() => {
    void loadNextPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once the engine becomes ready: if we already have a position but haven't
  // started pre-analysis yet (engine was still loading when position arrived),
  // kick it off now. Only fire in the 'playing' phase — during 'loading'
  // (i.e. handleMove is in flight) this would overwrite pendingRef mid-analysis
  // and cause the engine to get stuck in 'analyzing' forever.
  useEffect(() => {
    if (engineStatus === 'ready' && position !== null && preAnalysisRef.current === null && phase === 'playing') {
      preAnalysisRef.current = analyze(position.fen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineStatus, phase]);

  async function handleMove(uci: string) {
    if (phase !== "playing" || !position) return;
    setPhase("loading");

    // If the engine was still loading when this position arrived, pre-analysis
    // hasn't started yet. Wait for the engine, then start (or reuse) it.
    await waitForReady();
    if (!preAnalysisRef.current) {
      preAnalysisRef.current = analyze(position.fen);
    }

    let moves: EngineMove[] = [];
    try {
      // Await the analysis that started while the user was thinking.
      moves = await preAnalysisRef.current;
      preAnalysisRef.current = null;
      setEngineMoves(moves);
    } catch (err) {
      setEngineError(String(err));
    }

    // Helpers to analyze a position after a single UCI move and return the
    // evaluation from the moving side's perspective (negated from the engine's
    // opponent-to-move output).
    async function evalAfterMove(
      fen: string,
      move: string,
    ): Promise<Evaluation | undefined> {
      try {
        const chess = new Chess(fen);
        chess.move({
          from: move.slice(0, 2) as Square,
          to: move.slice(2, 4) as Square,
          promotion: move[4],
        });
        const followUp = await analyze(chess.fen(), 500);
        if (!followUp[0]) return undefined;
        const raw = followUp[0].evaluation;
        return raw.type === "cp"
          ? { type: "cp", value: -raw.value }
          : { type: "mate", value: -raw.value };
      } catch {
        return undefined;
      }
    }

    // For top-3 engine moves the eval is already known; for off-book moves
    // run a quick follow-up analysis on the resulting position.
    const inTop3 = moves.find((m) => m.uci === uci);
    const gmInTop3 = moves.find((m) => m.uci === position.gmMove);

    let userMoveEval: Evaluation | undefined = inTop3?.evaluation;
    if (!inTop3) {
      userMoveEval = await evalAfterMove(position.fen, uci);
    }

    // Eval for the GM move when it isn't covered by the top-3 analysis.
    let gmEval: Evaluation | undefined = gmInTop3?.evaluation;
    if (!gmInTop3) {
      // Reuse the result we already computed when the user played the GM move.
      gmEval =
        uci === position.gmMove
          ? userMoveEval
          : await evalAfterMove(position.fen, position.gmMove);
    }
    setGmMoveEval(gmEval);

    // Use UCI as the displayed SAN fallback. The FeedbackPanel shows UCI squares.
    const moveResult = scoreMove(
      uci,
      uci,
      position.gmMove,
      moves,
      userMoveEval,
      gmEval,
    );
    const delta = record(moveResult.points);
    setLastDelta(delta);
    setResult(moveResult);
    setResultArrows(buildResultArrows(position.gmMove, moves, uci));
    setPhase("result");

    // Start fetching the next position in the background while the user
    // reviews their result. Once the position arrives, kick off engine
    // analysis so both are ready when the user clicks "Next".
    prefetchResultRef.current = undefined;
    prefetchRef.current = fetchPosition()
      .then((pos) => {
        preAnalysisRef.current = analyze(pos.fen);
        prefetchResultRef.current = pos;
        return pos;
      })
      .catch(() => {
        prefetchResultRef.current = null;
        return null;
      });
  }

  return (
    <div className="app">
      <ScoreHeader scoreState={scoreState} />

      <main className="main">
        {phase === "loading" && !position && (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Loading position…</p>
          </div>
        )}

        {position && (
          <>
            <div className="position-label">
              <span className={`source-badge source-badge--${position.source}`}>
                {position.source === "lichess" ? "Lichess live" : "Classic"}
              </span>
              <span className="game-label">{position.label}</span>
            </div>

            <div className="board-wrapper">
              <Board
                key={position.fen}
                position={position}
                onMove={(uci) => void handleMove(uci)}
                interactive={phase === "playing"}
                arrows={phase === "result" ? resultArrows : []}
              />
            </div>

            <div className="side-to-move">
              <span
                className={`side-to-move__dot side-to-move__dot--${position.sideToMove}`}
              />
              {position.sideToMove === "white" ? "White" : "Black"} to move
            </div>

            {phase === "loading" && (
              <div className="analyzing-indicator">
                <div className="spinner spinner--sm" />
                <span>
                  {engineStatus === "loading"
                    ? "Loading Stockfish 18…"
                    : "Analyzing…"}
                </span>
              </div>
            )}
          </>
        )}

        {phase === "result" && result && position && (
          <>
            {engineError && (
              <p className="engine-error">Engine error: {engineError}</p>
            )}
            <FeedbackPanel
              result={result}
              gmMove={position.gmMove}
              gmMoveEval={gmMoveEval}
              engineMoves={engineMoves}
              pointsDelta={lastDelta}
              onNext={() => void loadNextPosition()}
            />
          </>
        )}
      </main>
    </div>
  );
}
