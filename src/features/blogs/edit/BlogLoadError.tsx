import type { FC } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/ui/shadcn/alert'
import { Button } from '@/ui/shadcn/button'

type Props = {
  message: string
  onRetry: () => void
}

export const BlogLoadError: FC<Props> = ({ message, onRetry }) => (
  <div className='mx-4 px-4 py-6'>
    <Alert variant='destructive' role='alert'>
      <AlertTitle>Could not load this blog</AlertTitle>
      <AlertDescription className='mt-2 flex items-center justify-between gap-4'>
        {message}
        <Button type='button' variant='outline' size='sm' onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  </div>
)
