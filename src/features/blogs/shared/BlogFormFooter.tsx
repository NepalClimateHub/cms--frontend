import { Eye } from 'lucide-react'
import type { FC } from 'react'
import { Button } from '@/ui/shadcn/button'
import type { FormStatus } from './blog-status'
import type { SaveGate } from './save-gate'

type Props = {
  status: FormStatus | null
  gate: SaveGate
  submitLabel: string
  isSaving: boolean
  isSubmitDisabled: boolean
  onCancel: () => void
  onPreview: () => void
  onRetryAutosave: () => void
}

export const BlogFormFooter: FC<Props> = ({
  status,
  gate,
  submitLabel,
  isSaving,
  isSubmitDisabled,
  onCancel,
  onPreview,
  onRetryAutosave,
}) => (
  <section
    aria-label='Blog actions'
    className='sticky bottom-0 z-40 -mx-4 md:-mx-8 border-t bg-background/95 py-4 px-6 md:px-8 flex items-center gap-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md'
  >
    <div className='mr-auto space-y-1'>
      <p
        data-testid='blog-save-status'
        role={status?.tone === 'error' ? 'alert' : 'status'}
        className={`text-sm ${status?.tone === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}
      >
        {status?.action === 'retry' ? (
          <button
            type='button'
            className='underline underline-offset-2'
            onClick={onRetryAutosave}
          >
            {status.text}
          </button>
        ) : (
          status?.text
        )}
      </p>
      <p
        role='status'
        aria-live='polite'
        className={`text-sm ${gate.allowed ? 'text-amber-600 dark:text-amber-400' : 'text-destructive'}`}
      >
        {gate.message}
      </p>
    </div>
    <Button type='button' variant='outline' onClick={onCancel}>
      Cancel
    </Button>
    <Button
      type='button'
      variant='outline'
      onClick={onPreview}
      className='gap-2'
    >
      <Eye className='h-4 w-4' aria-hidden='true' />
      Preview
    </Button>
    <Button
      type='submit'
      data-testid='blog-submit'
      loading={isSaving}
      disabled={isSubmitDisabled || !gate.allowed}
    >
      {isSaving ? 'Saving...' : submitLabel}
    </Button>
  </section>
)
