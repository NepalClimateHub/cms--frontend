import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { BlogFormValues } from '@/schemas/blog'
import type { BlogStatus } from '../blog-status'
import { getAutosaveTarget } from './autosave-policy'
import { runAutosave } from './autosave-runner'
import {
  type AutosaveScheduler,
  type AutosaveStatus,
  createAutosaveScheduler,
  INITIAL_AUTOSAVE_STATUS,
} from './autosave-scheduler'
import { getAutosaveStatusView } from './autosave-status'
import { blogSnapshotStore, createSnapshot } from './snapshot-store'
import { useDraftRecovery } from './use-draft-recovery'

export type BlogAutosaveApi = {
  fetchLatestUpdatedAt: () => Promise<string>
  saveDraft: (body: Record<string, unknown>) => Promise<{ updatedAt: string }>
  reload: () => Promise<string | null>
}

export type BlogAutosaveConfig = {
  blogId: string | null
  status?: BlogStatus
  loadedUpdatedAt: string | null
  api?: BlogAutosaveApi
}

type Options = {
  form: UseFormReturn<BlogFormValues>
  config: BlogAutosaveConfig
  isBusy: boolean
  canSaveToServer?: () => boolean
}

export const useBlogAutosave = ({
  form,
  config,
  isBusy,
  canSaveToServer = () => true,
}: Options) => {
  const { isDirty } = form.formState
  const live = useRef({ isDirty, isBusy, config, canSaveToServer })
  live.current = { isDirty, isBusy, config, canSaveToServer }
  const baseRef = useRef(config.loadedUpdatedAt)
  const scheduler = useRef<AutosaveScheduler | null>(null)
  const [status, setStatus] = useState<AutosaveStatus>(INITIAL_AUTOSAVE_STATUS)
  const [formKey, setFormKey] = useState(0)
  const bumpFormKey = useCallback(() => setFormKey((key) => key + 1), [])

  useEffect(() => {
    const instance = createAutosaveScheduler({
      canRun: () => live.current.isDirty && !live.current.isBusy,
      onStatus: setStatus,
      run: async () => {
        const { config: current, canSaveToServer: canSave } = live.current
        const { blogId, status: blogStatus, api } = current
        const outcome = await runAutosave({
          target:
            api && canSave()
              ? getAutosaveTarget({ blogId, status: blogStatus })
              : 'local',
          getValues: form.getValues,
          getBaseUpdatedAt: () => baseRef.current,
          fetchLatestUpdatedAt: () =>
            api?.fetchLatestUpdatedAt() ?? Promise.reject(new Error('no api')),
          saveDraft: (body) =>
            api?.saveDraft(body) ?? Promise.reject(new Error('no api')),
          writeSnapshot: (values) =>
            blogSnapshotStore.write(
              blogId,
              createSnapshot(values, baseRef.current, Date.now())
            ),
          clearSnapshot: () => blogSnapshotStore.clear(blogId),
        })
        if (outcome.kind === 'saved' && outcome.updatedAt) {
          baseRef.current = outcome.updatedAt
        }
        return outcome
      },
    })
    scheduler.current = instance
    const subscription = form.watch(() => instance.notifyChange())
    return () => {
      subscription.unsubscribe()
      instance.dispose()
      scheduler.current = null
    }
  }, [form])

  useEffect(() => {
    if (isDirty && !isBusy) scheduler.current?.notifyChange()
  }, [isDirty, isBusy])

  const recovery = useDraftRecovery({
    form,
    blogId: config.blogId,
    loadedUpdatedAt: config.loadedUpdatedAt,
    onApplied: bumpFormKey,
  })

  const reload = async () => {
    try {
      const updatedAt = await config.api?.reload()
      if (updatedAt) baseRef.current = updatedAt
      blogSnapshotStore.clear(config.blogId)
      bumpFormKey()
      scheduler.current?.resume()
    } catch {
      return
    }
  }

  const keepMine = () => {
    if (status.conflictUpdatedAt) baseRef.current = status.conflictUpdatedAt
    scheduler.current?.resume()
  }

  return {
    statusView: getAutosaveStatusView(status),
    formKey,
    recovery,
    conflict: status.phase === 'conflict' ? { reload, keepMine } : null,
    retry: () => scheduler.current?.retry(),
    settle: () => scheduler.current?.settle() ?? Promise.resolve(),
  }
}

export type BlogAutosave = ReturnType<typeof useBlogAutosave>
