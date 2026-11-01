import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AutosaveOutcome } from './autosave-runner'
import {
  AUTOSAVE_DELAY_MS,
  type AutosaveStatus,
  createAutosaveScheduler,
} from './autosave-scheduler'

const SAVED: AutosaveOutcome = {
  kind: 'saved',
  scope: 'server',
  updatedAt: 'u',
}

const deferred = () => {
  let resolve!: (outcome: AutosaveOutcome) => void
  const promise = new Promise<AutosaveOutcome>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

const setup = (
  run: () => Promise<AutosaveOutcome>,
  canRun: () => boolean = () => true
) => {
  const statuses: AutosaveStatus[] = []
  const scheduler = createAutosaveScheduler({
    canRun,
    run,
    onStatus: (status) => statuses.push(status),
    now: () => 1234,
  })
  const phases = () => statuses.map((status) => status.phase)
  return { scheduler, statuses, phases }
}

describe('autosave scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces bursts of changes into one run after idle', async () => {
    const run = vi.fn(async () => SAVED)
    const { scheduler, phases } = setup(run)
    scheduler.notifyChange()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS - 500)
    scheduler.notifyChange()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS - 1)
    expect(run).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(run).toHaveBeenCalledTimes(1)
    expect(phases()).toEqual(['pending', 'saving', 'saved'])
    expect(scheduler.getStatus().savedAt).toBe(1234)
  })

  it('skips the run when the form is clean or busy', async () => {
    const run = vi.fn(async () => SAVED)
    const { scheduler, phases } = setup(run, () => false)
    scheduler.notifyChange()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
    expect(run).not.toHaveBeenCalled()
    expect(phases()).toEqual(['pending', 'idle'])
  })

  it('never overlaps requests and re-runs after in-flight edits', async () => {
    const first = deferred()
    let active = 0
    let maxActive = 0
    const run = vi.fn(() => {
      active += 1
      maxActive = Math.max(maxActive, active)
      const outcome =
        run.mock.calls.length === 1 ? first.promise : Promise.resolve(SAVED)
      return outcome.finally(() => {
        active -= 1
      })
    })
    const { scheduler } = setup(run)
    scheduler.notifyChange()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
    expect(run).toHaveBeenCalledTimes(1)

    scheduler.notifyChange()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS * 3)
    expect(run).toHaveBeenCalledTimes(1)

    first.resolve(SAVED)
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
    expect(run).toHaveBeenCalledTimes(2)
    expect(maxActive).toBe(1)
  })

  it('surfaces failure, then retries on demand', async () => {
    const run = vi
      .fn<() => Promise<AutosaveOutcome>>()
      .mockResolvedValueOnce({ kind: 'failed' })
      .mockResolvedValueOnce(SAVED)
    const { scheduler } = setup(run)
    scheduler.notifyChange()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
    expect(scheduler.getStatus().phase).toBe('failed')

    scheduler.retry()
    await vi.advanceTimersByTimeAsync(0)
    expect(run).toHaveBeenCalledTimes(2)
    expect(scheduler.getStatus().phase).toBe('saved')
  })

  it('treats a thrown run as a failure', async () => {
    const run = vi.fn(async (): Promise<AutosaveOutcome> => {
      throw new Error('boom')
    })
    const { scheduler } = setup(run)
    scheduler.notifyChange()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
    expect(scheduler.getStatus().phase).toBe('failed')
  })

  it('stops on conflict until resumed', async () => {
    const run = vi
      .fn<() => Promise<AutosaveOutcome>>()
      .mockResolvedValueOnce({ kind: 'conflict', latestUpdatedAt: 'newer' })
      .mockResolvedValue(SAVED)
    const { scheduler } = setup(run)
    scheduler.notifyChange()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
    expect(scheduler.getStatus()).toMatchObject({
      phase: 'conflict',
      conflictUpdatedAt: 'newer',
    })

    scheduler.notifyChange()
    scheduler.retry()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS * 3)
    expect(run).toHaveBeenCalledTimes(1)

    scheduler.resume()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
    expect(run).toHaveBeenCalledTimes(2)
    expect(scheduler.getStatus().phase).toBe('saved')
  })

  it('settle cancels a pending run and waits for the one in flight', async () => {
    const pending = deferred()
    const run = vi.fn(() => pending.promise)
    const { scheduler } = setup(run)
    scheduler.notifyChange()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)

    scheduler.notifyChange()
    let settled = false
    const settling = scheduler.settle().then(() => {
      settled = true
    })
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS * 2)
    expect(settled).toBe(false)
    expect(run).toHaveBeenCalledTimes(1)

    pending.resolve(SAVED)
    await settling
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS * 2)
    expect(settled).toBe(true)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('stops emitting after dispose', async () => {
    const run = vi.fn(async () => SAVED)
    const { scheduler, statuses } = setup(run)
    scheduler.notifyChange()
    scheduler.dispose()
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS * 2)
    expect(run).not.toHaveBeenCalled()
    expect(statuses).toHaveLength(1)
  })
})
