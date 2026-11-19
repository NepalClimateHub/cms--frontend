import type { BlogFormValues } from '@/schemas/blog'
import { checkVersion } from './autosave-conflict'
import {
  type AutosaveTarget,
  buildAutosaveBody,
  isServerSendable,
} from './autosave-policy'

export type AutosaveOutcome =
  | { kind: 'saved'; scope: AutosaveTarget; updatedAt: string | null }
  | { kind: 'conflict'; latestUpdatedAt: string }
  | { kind: 'failed' }

export type AutosaveRunnerDeps = {
  target: AutosaveTarget
  getValues: () => BlogFormValues
  getBaseUpdatedAt: () => string | null
  fetchLatestUpdatedAt: () => Promise<string>
  saveDraft: (body: Record<string, unknown>) => Promise<{ updatedAt: string }>
  writeSnapshot: (values: BlogFormValues) => boolean
  clearSnapshot: () => void
}

const saveLocally = (
  values: BlogFormValues,
  deps: AutosaveRunnerDeps
): AutosaveOutcome =>
  deps.writeSnapshot(values)
    ? { kind: 'saved', scope: 'local', updatedAt: null }
    : { kind: 'failed' }

export const runAutosave = async (
  deps: AutosaveRunnerDeps
): Promise<AutosaveOutcome> => {
  const values = deps.getValues()
  if (deps.target === 'local' || !isServerSendable(values)) {
    return saveLocally(values, deps)
  }
  try {
    const latestUpdatedAt = await deps.fetchLatestUpdatedAt()
    const check = checkVersion(deps.getBaseUpdatedAt(), latestUpdatedAt)
    if (check !== 'ok') {
      deps.writeSnapshot(values)
      return check === 'conflict'
        ? { kind: 'conflict', latestUpdatedAt }
        : { kind: 'failed' }
    }
    const saved = await deps.saveDraft(buildAutosaveBody(values))
    deps.clearSnapshot()
    return { kind: 'saved', scope: 'server', updatedAt: saved.updatedAt }
  } catch {
    deps.writeSnapshot(values)
    return { kind: 'failed' }
  }
}
