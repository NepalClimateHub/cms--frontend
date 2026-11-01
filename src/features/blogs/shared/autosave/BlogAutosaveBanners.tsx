import type { FC } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/ui/shadcn/alert'
import { Button } from '@/ui/shadcn/button'
import type { BlogAutosave } from './use-blog-autosave'

type Props = Pick<BlogAutosave, 'recovery' | 'conflict'>

export const BlogAutosaveBanners: FC<Props> = ({ recovery, conflict }) => (
  <>
    {recovery && (
      <Alert role='status'>
        <AlertTitle>Unsaved draft found</AlertTitle>
        <AlertDescription className='flex flex-wrap items-center gap-3'>
          <span>
            A copy saved {new Date(recovery.savedAt).toLocaleString()} is newer
            than the saved version.
          </span>
          <Button type='button' size='sm' onClick={recovery.restore}>
            Restore
          </Button>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={recovery.discard}
          >
            Discard
          </Button>
        </AlertDescription>
      </Alert>
    )}
    {conflict && (
      <Alert variant='destructive'>
        <AlertTitle>Newer version on the server</AlertTitle>
        <AlertDescription className='flex flex-wrap items-center gap-3'>
          <span>Autosave is paused so your edits do not overwrite it.</span>
          <Button type='button' size='sm' onClick={conflict.reload}>
            Reload
          </Button>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={conflict.keepMine}
          >
            Keep mine
          </Button>
        </AlertDescription>
      </Alert>
    )}
  </>
)
