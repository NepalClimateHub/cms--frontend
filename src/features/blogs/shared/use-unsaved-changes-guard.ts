import { useBlocker } from '@tanstack/react-router'
import { useRef } from 'react'
import {
  type NavigationGuardState,
  shouldBlockNavigation,
} from './unsaved-changes'

export const useUnsavedChangesGuard = ({
  isDirty,
  isSaving,
}: Pick<NavigationGuardState, 'isDirty' | 'isSaving'>) => {
  const state = useRef<NavigationGuardState>({
    isDirty,
    isSaving,
    isSaved: false,
  })
  state.current.isDirty = isDirty
  state.current.isSaving = isSaving

  const shouldBlock = () => shouldBlockNavigation(state.current)

  const blocker = useBlocker({
    shouldBlockFn: shouldBlock,
    enableBeforeUnload: shouldBlock,
    withResolver: true,
  })

  return {
    open: blocker.status === 'blocked',
    onStay: () => blocker.reset?.(),
    onLeave: () => blocker.proceed?.(),
    markSaved: () => {
      state.current.isSaved = true
    },
  }
}

export type UnsavedChangesGuard = ReturnType<typeof useUnsavedChangesGuard>
