import type { BaseSyntheticEvent } from 'react'
import { useState } from 'react'
import { type UseFormReturn, useWatch } from 'react-hook-form'
import type { BlogFormValues } from '@/schemas/blog'
import type { BlogAutosaveConfig } from './autosave/use-blog-autosave'
import { useBlogAutosave } from './autosave/use-blog-autosave'
import {
  type BlogState,
  getFormStatus,
  getSubmitOutcome,
  isPublishedAndApproved,
} from './blog-status'
import { getSaveGate, isServerSaveBlocked } from './save-gate'
import { useBlogRole } from './use-blog-role'
import { useEditorSaveBlockers } from './use-editor-save-blockers'

type Options = {
  form: UseFormReturn<BlogFormValues>
  isEdit: boolean
  isSaving: boolean
  blogState?: BlogState
  submitError?: string | null
  autosaveConfig: BlogAutosaveConfig
  handleFormSubmit: (values: BlogFormValues) => Promise<void>
}

export const useBlogFormState = ({
  form,
  isEdit,
  isSaving,
  blogState,
  submitError = null,
  autosaveConfig,
  handleFormSubmit,
}: Options) => {
  const { canAutoPublish } = useBlogRole()
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const isDraft = useWatch({ control: form.control, name: 'isDraft' })
  const { isDirty, errors } = form.formState
  const { blockers, readBlockers, editorProps } = useEditorSaveBlockers()
  const autosave = useBlogAutosave({
    form,
    config: autosaveConfig,
    isBusy: isSaving || isUploadingBanner,
    canSaveToServer: () => !isServerSaveBlocked(readBlockers()),
  })

  const outcome = getSubmitOutcome({
    isDraft: !!isDraft,
    canAutoPublish,
    alreadyPublished: isEdit && isPublishedAndApproved(blogState),
  })
  const gate = getSaveGate({ blockers, action: outcome.action })
  const status = getFormStatus({
    isSaving,
    isUploadingBanner,
    isDirty,
    errorCount: Object.keys(errors).length,
    submitError,
    autosave: autosave.statusView,
  })

  const submit = form.handleSubmit(async (values) => {
    await autosave.settle()
    await handleFormSubmit(values)
  })

  const onSubmit = async (event?: BaseSyntheticEvent) => {
    const fresh = getSaveGate({
      blockers: readBlockers(),
      action: outcome.action,
    })
    if (!fresh.allowed) {
      event?.preventDefault()
      return
    }
    await submit(event)
  }

  return {
    autosave,
    outcome,
    status,
    gate,
    editorProps,
    onSubmit,
    isUploadingBanner,
    setIsUploadingBanner,
  }
}
