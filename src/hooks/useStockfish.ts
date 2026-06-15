import { useCallback, useEffect, useRef, useState } from 'react'
import type { EngineMove, Evaluation } from '../types'

// The engine is served as a static asset from public/engine/. BASE_URL is
// '/chess-the-move/' in the production build and '/' (or the configured base)
// in dev, and always ends with a trailing slash.
const ENGINE_URL = `${import.meta.env.BASE_URL}engine/stockfish-18-lite-single.js`
const MULTI_PV = 3
const MOVE_TIME_MS = 1500

export type EngineStatus = 'loading' | 'ready' | 'analyzing'

interface PendingAnalysis {
  resolve: (moves: EngineMove[]) => void
  /** Latest candidate per MultiPV rank, keyed by rank (1..MULTI_PV). */
  lines: Map<number, EngineMove>
}

/**
 * Parse a UCI `info ... multipv N ... score ... pv <move> ...` line into a
 * single ranked candidate. Returns null for info lines without a full pv/score
 * (e.g. `info string ...` or `info depth N currmove ...`).
 */
function parseInfoLine(line: string): EngineMove | null {
  const tokens = line.split(/\s+/)
  let rank = 0
  let evaluation: Evaluation | null = null
  let uci = ''

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === 'multipv') {
      rank = Number(tokens[i + 1])
    } else if (token === 'score') {
      const kind = tokens[i + 1]
      const value = Number(tokens[i + 2])
      if (kind === 'cp') {
        evaluation = { type: 'cp', value }
      } else if (kind === 'mate') {
        evaluation = { type: 'mate', value }
      }
    } else if (token === 'pv') {
      // The first move of the principal variation is the candidate move.
      uci = tokens[i + 1] ?? ''
      break
    }
  }

  if (!rank || !uci || !evaluation) return null
  return { uci, rank, evaluation }
}

/**
 * Loads the single-threaded Stockfish 18 (lite) engine in a classic Web Worker
 * and exposes a promise-based `analyze(fen)` that resolves with the engine's
 * top-3 moves (MultiPV 3, fixed 1.5s think time).
 *
 * The worker is created in an effect and terminated on cleanup, which is safe
 * under React StrictMode's double-invoke in development: the throwaway worker is
 * terminated before the second one is created, so only one live engine exists at
 * a time and stale messages are ignored via the `cancelled` guard.
 */
export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<PendingAnalysis | null>(null)
  const readyRef = useRef(false)
  const waitersRef = useRef<Array<() => void>>([])
  const [status, setStatus] = useState<EngineStatus>('loading')

  useEffect(() => {
    let cancelled = false
    const worker = new Worker(ENGINE_URL)
    workerRef.current = worker

    const handleLine = (line: string) => {
      // --- UCI handshake ---
      if (line.startsWith('uciok')) {
        worker.postMessage(`setoption name MultiPV value ${MULTI_PV}`)
        worker.postMessage('isready')
        return
      }
      if (line.startsWith('readyok')) {
        if (!readyRef.current) {
          readyRef.current = true
          setStatus('ready')
          waitersRef.current.forEach(r => r())
          waitersRef.current = []
        }
        return
      }

      // --- Analysis stream ---
      const pending = pendingRef.current
      if (!pending) return

      if (line.startsWith('info ')) {
        const candidate = parseInfoLine(line)
        if (candidate) pending.lines.set(candidate.rank, candidate)
        return
      }

      if (line.startsWith('bestmove')) {
        pendingRef.current = null
        const moves = [...pending.lines.values()]
          .sort((a, b) => a.rank - b.rank)
          .slice(0, MULTI_PV)
        setStatus('ready')
        pending.resolve(moves)
      }
    }

    worker.onmessage = (event: MessageEvent) => {
      if (cancelled) return
      const data = event.data
      if (typeof data === 'string') handleLine(data)
    }

    // Kick off the handshake. The loader buffers input until the WASM is ready.
    worker.postMessage('uci')

    return () => {
      cancelled = true
      readyRef.current = false
      waitersRef.current = []
      // Reject nothing here: the app only analyzes in response to user actions,
      // so no analysis is in flight across mount/unmount in normal use.
      pendingRef.current = null
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const analyze = useCallback((fen: string, moveTimeMs = MOVE_TIME_MS): Promise<EngineMove[]> => {
    return new Promise<EngineMove[]>((resolve, reject) => {
      const worker = workerRef.current
      if (!worker || !readyRef.current) {
        reject(new Error('Engine is not ready yet'))
        return
      }
      pendingRef.current = { resolve, lines: new Map() }
      setStatus('analyzing')
      worker.postMessage('ucinewgame')
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go movetime ${moveTimeMs}`)
    })
  }, [])

  const waitForReady = useCallback((): Promise<void> => {
    if (readyRef.current) return Promise.resolve()
    return new Promise(resolve => {
      waitersRef.current.push(resolve)
    })
  }, [])

  return { status, analyze, waitForReady }
}
