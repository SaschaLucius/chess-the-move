import { useCallback, useEffect, useRef, useState } from 'react'
import type { EngineMove, Evaluation } from '../types'

// The engine is served as a static asset from public/engine/. BASE_URL is
// '/chess-the-move/' in the production build and '/' (or the configured base)
// in dev, and always ends with a trailing slash.
const ENGINE_URL = `${import.meta.env.BASE_URL}engine/stockfish-18-lite-single.js`
const MULTI_PV = 3
const MOVE_TIME_MS = 1500

export type EngineStatus = 'loading' | 'ready' | 'analyzing' | 'error'

/** How long to wait for the engine to become ready before giving up (ms). */
const LOAD_TIMEOUT_MS = 15_000

interface PendingAnalysis {
  resolve: (moves: EngineMove[]) => void
  reject: (reason: Error) => void
  /** Latest candidate per MultiPV rank, keyed by rank (1..MULTI_PV). */
  lines: Map<number, EngineMove>
}

interface ReadyWaiter {
  resolve: () => void
  reject: (reason: Error) => void
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
  // Normalise to 4-char UCI so promotion moves (e7e8q) compare equal to the
  // 4-char UCIs emitted by Board and stored in position.gmMove.
  return { uci: uci.slice(0, 4), rank, evaluation }
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
  const errorRef = useRef(false)
  const waitersRef = useRef<ReadyWaiter[]>([])
  const [status, setStatus] = useState<EngineStatus>('loading')

  useEffect(() => {
    let cancelled = false
    const worker = new Worker(ENGINE_URL)
    workerRef.current = worker

    /** Shared failure path — sets error status and unblocks all waiters. */
    const handleEngineError = (msg: string) => {
      if (cancelled) return
      errorRef.current = true
      setStatus('error')
      const err = new Error(msg)
      // Reject any in-flight analysis.
      if (pendingRef.current) {
        pendingRef.current.reject(err)
        pendingRef.current = null
      }
      // Reject all waiters so waitForReady() doesn't hang.
      waitersRef.current.forEach(w => w.reject(err))
      waitersRef.current = []
    }

    // Worker-level errors (WASM load failure, JS syntax error, etc.).
    worker.onerror = (event: ErrorEvent) => {
      handleEngineError(`Engine worker error: ${event.message}`)
    }

    // Timeout guard: if the engine isn't ready within LOAD_TIMEOUT_MS, give up.
    const loadTimer = setTimeout(() => {
      if (!readyRef.current) {
        handleEngineError('Engine failed to load within timeout')
      }
    }, LOAD_TIMEOUT_MS)

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
          clearTimeout(loadTimer)
          setStatus('ready')
          waitersRef.current.forEach(w => w.resolve())
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
      clearTimeout(loadTimer)
      readyRef.current = false
      errorRef.current = false
      waitersRef.current = []
      // Reject any in-flight analysis so its awaiter doesn't hang.
      if (pendingRef.current) {
        pendingRef.current.reject(new Error('Engine terminated'))
        pendingRef.current = null
      }
      worker.onerror = null
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const analyze = useCallback((fen: string, moveTimeMs = MOVE_TIME_MS): Promise<EngineMove[]> => {
    return new Promise<EngineMove[]>((resolve, reject) => {
      const worker = workerRef.current
      if (!worker || !readyRef.current) {
        reject(new Error(errorRef.current ? 'Engine failed to load' : 'Engine is not ready yet'))
        return
      }
      // Abort any currently-running search before starting a new one.
      if (pendingRef.current) {
        worker.postMessage('stop')
        pendingRef.current.reject(new Error('Analysis superseded'))
        pendingRef.current = null
      }
      pendingRef.current = { resolve, reject, lines: new Map() }
      setStatus('analyzing')
      worker.postMessage('ucinewgame')
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go movetime ${moveTimeMs}`)
    })
  }, [])

  const waitForReady = useCallback((): Promise<void> => {
    if (readyRef.current) return Promise.resolve()
    if (errorRef.current) return Promise.reject(new Error('Engine failed to load'))
    return new Promise((resolve, reject) => {
      waitersRef.current.push({ resolve, reject })
    })
  }, [])

  return { status, analyze, waitForReady }
}
