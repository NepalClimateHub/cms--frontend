import type { AutosaveTarget } from './autosave-policy'
import type { AutosaveOutcome } from './autosave-runner'

export const AUTOSAVE_DELAY_MS = 2000

export type AutosavePhase =
  | 'idle'
  | 'pending'
  | 'saving'
  | 'saved'
  | 'failed'
  | 'conflict'

export type AutosaveStatus = {
  phase: AutosavePhase
  scope: AutosaveTarget | null
  savedAt: number | null
  conflictUpdatedAt: string | null
}

export const INITIAL_AUTOSAVE_STATUS: AutosaveStatus = {
  phase: 'idle',
  scope: null,
  savedAt: null,
  conflictUpdatedAt: null,
}

type Options = {
  delayMs?: number
  canRun: () => boolean
  run: () => Promise<AutosaveOutcome>
  onStatus: (status: AutosaveStatus) => void
  now?: () => number
}

export const createAutosaveScheduler = ({
  delayMs = AUTOSAVE_DELAY_MS,
  canRun,
  run,
  onStatus,
  now = Date.now,
}: Options) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  let inFlight: Promise<void> | null = null
  let rerun = false
  let stopped = false
  let disposed = false
  let status = INITIAL_AUTOSAVE_STATUS

  const emit = (next: Partial<AutosaveStatus>) => {
    status = { ...status, ...next }
    if (!disposed) onStatus(status)
  }

  const clearTimer = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }

  const apply = (outcome: AutosaveOutcome) => {
    if (outcome.kind === 'saved') {
      emit({ phase: 'saved', scope: outcome.scope, savedAt: now() })
    } else if (outcome.kind === 'conflict') {
      stopped = true
      emit({ phase: 'conflict', conflictUpdatedAt: outcome.latestUpdatedAt })
    } else {
      emit({ phase: 'failed' })
    }
  }

  const execute = () => {
    emit({ phase: 'saving' })
    inFlight = Promise.resolve()
      .then(run)
      .catch((): AutosaveOutcome => ({ kind: 'failed' }))
      .then((outcome) => {
        inFlight = null
        apply(outcome)
        if (rerun) {
          rerun = false
          if (!stopped && !disposed) schedule()
        }
      })
  }

  const tick = () => {
    timer = null
    if (stopped || disposed) return
    if (inFlight) {
      rerun = true
      return
    }
    if (!canRun()) {
      if (status.phase === 'pending') emit({ phase: 'idle' })
      return
    }
    execute()
  }

  const schedule = () => {
    clearTimer()
    timer = setTimeout(tick, delayMs)
  }

  const notifyChange = () => {
    if (stopped || disposed) return
    if (inFlight) {
      rerun = true
      return
    }
    if (status.phase !== 'pending') emit({ phase: 'pending' })
    schedule()
  }

  return {
    notifyChange,
    retry() {
      if (stopped || disposed || inFlight) return
      clearTimer()
      if (canRun()) execute()
    },
    resume() {
      stopped = false
      emit({ phase: 'idle', conflictUpdatedAt: null })
      notifyChange()
    },
    settle(): Promise<void> {
      clearTimer()
      rerun = false
      return inFlight ?? Promise.resolve()
    },
    dispose() {
      disposed = true
      clearTimer()
    },
    getStatus: () => status,
  }
}

export type AutosaveScheduler = ReturnType<typeof createAutosaveScheduler>
