import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { BlogFormValues } from '@/schemas/blog'
import { getRecoveryOffer } from './autosave-recovery'
import { blogSnapshotStore, snapshotToFormValues } from './snapshot-store'

type Options = {
  form: UseFormReturn<BlogFormValues>
  blogId: string | null
  loadedUpdatedAt: string | null
  onApplied: () => void
}

export const useDraftRecovery = ({
  form,
  blogId,
  loadedUpdatedAt,
  onApplied,
}: Options) => {
  const [offer, setOffer] = useState(() =>
    getRecoveryOffer(blogSnapshotStore.read(blogId), loadedUpdatedAt)
  )

  if (!offer) return null

  return {
    savedAt: offer.savedAt,
    restore: () => {
      form.reset(snapshotToFormValues(offer), { keepDefaultValues: true })
      setOffer(null)
      onApplied()
    },
    discard: () => {
      blogSnapshotStore.clear(blogId)
      setOffer(null)
    },
  }
}

export type DraftRecovery = NonNullable<ReturnType<typeof useDraftRecovery>>
