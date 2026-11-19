import { describe, expect, it, type Mock, vi } from 'vitest'
import { makeValues } from './autosave-fixtures'
import { type AutosaveRunnerDeps, runAutosave } from './autosave-runner'

const BASE = '2026-01-01T10:00:00.000Z'
const NEWER = '2026-01-01T10:05:00.000Z'

type Fn<K extends keyof AutosaveRunnerDeps> = AutosaveRunnerDeps[K]

type Deps = AutosaveRunnerDeps & {
  fetchLatestUpdatedAt: Mock<Fn<'fetchLatestUpdatedAt'>>
  saveDraft: Mock<Fn<'saveDraft'>>
  writeSnapshot: Mock<Fn<'writeSnapshot'>>
  clearSnapshot: Mock<Fn<'clearSnapshot'>>
}

const makeDeps = (overrides: Partial<Deps> = {}): Deps => ({
  target: 'server',
  getValues: () => makeValues(),
  getBaseUpdatedAt: () => BASE,
  fetchLatestUpdatedAt: vi.fn<Fn<'fetchLatestUpdatedAt'>>(async () => BASE),
  saveDraft: vi.fn<Fn<'saveDraft'>>(async () => ({ updatedAt: NEWER })),
  writeSnapshot: vi.fn<Fn<'writeSnapshot'>>(() => true),
  clearSnapshot: vi.fn<Fn<'clearSnapshot'>>(),
  ...overrides,
})

describe('runAutosave', () => {
  it('saves a draft to the server and clears the local snapshot', async () => {
    const deps = makeDeps()
    const outcome = await runAutosave(deps)
    expect(outcome).toEqual({
      kind: 'saved',
      scope: 'server',
      updatedAt: NEWER,
    })
    expect(deps.clearSnapshot).toHaveBeenCalledTimes(1)
  })

  it('never sends a publish flag to the server', async () => {
    const deps = makeDeps({ getValues: () => makeValues({ isDraft: false }) })
    await runAutosave(deps)
    const body = deps.saveDraft.mock.calls[0]?.[0]
    expect(body?.isDraft).toBe(true)
    expect(body).not.toHaveProperty('status')
  })

  it('writes published-like targets to the local snapshot only', async () => {
    const deps = makeDeps({ target: 'local' })
    const outcome = await runAutosave(deps)
    expect(outcome).toEqual({ kind: 'saved', scope: 'local', updatedAt: null })
    expect(deps.fetchLatestUpdatedAt).not.toHaveBeenCalled()
    expect(deps.saveDraft).not.toHaveBeenCalled()
    expect(deps.writeSnapshot).toHaveBeenCalledTimes(1)
  })

  it('keeps invalid drafts local instead of sending them', async () => {
    const deps = makeDeps({ getValues: () => makeValues({ title: '' }) })
    const outcome = await runAutosave(deps)
    expect(outcome).toMatchObject({ kind: 'saved', scope: 'local' })
    expect(deps.saveDraft).not.toHaveBeenCalled()
  })

  it('stops with a conflict when the server copy is newer', async () => {
    const deps = makeDeps({
      fetchLatestUpdatedAt: vi.fn<Fn<'fetchLatestUpdatedAt'>>(
        async () => NEWER
      ),
    })
    const outcome = await runAutosave(deps)
    expect(outcome).toEqual({ kind: 'conflict', latestUpdatedAt: NEWER })
    expect(deps.saveDraft).not.toHaveBeenCalled()
    expect(deps.writeSnapshot).toHaveBeenCalledTimes(1)
  })

  it('does not write when versions cannot be compared', async () => {
    const deps = makeDeps({ getBaseUpdatedAt: () => null })
    expect(await runAutosave(deps)).toEqual({ kind: 'failed' })
    expect(deps.saveDraft).not.toHaveBeenCalled()
  })

  it('reports failure and preserves work locally when the request fails', async () => {
    const deps = makeDeps({
      saveDraft: vi.fn<Fn<'saveDraft'>>(async () => {
        throw new Error('503')
      }),
    })
    expect(await runAutosave(deps)).toEqual({ kind: 'failed' })
    expect(deps.writeSnapshot).toHaveBeenCalledTimes(1)
    expect(deps.clearSnapshot).not.toHaveBeenCalled()
  })

  it('fails visibly when local storage is unavailable', async () => {
    const deps = makeDeps({
      target: 'local',
      writeSnapshot: vi.fn<Fn<'writeSnapshot'>>(() => false),
    })
    expect(await runAutosave(deps)).toEqual({ kind: 'failed' })
  })
})
