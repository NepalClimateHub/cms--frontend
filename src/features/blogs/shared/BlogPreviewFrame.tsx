import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/ui/shadcn/lib/utils'
import { Spinner } from '@/ui/shadcn/spinner'

export type PreviewView = 'desktop' | 'mobile'

type Props = {
  action: string
  payload: string
  view: PreviewView
  title: string
}

export function BlogPreviewFrame({ action, payload, view, title }: Props) {
  const name = `blog-preview-${useId()}`
  const formRef = useRef<HTMLFormElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const submitted = useRef(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const frame = frameRef.current
    const onLoad = () => submitted.current && setLoading(false)
    frame?.addEventListener('load', onLoad)
    return () => frame?.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    if (!action || !payload) return
    setLoading(true)
    submitted.current = true
    formRef.current?.submit()
  }, [action, payload])

  return (
    <div className='relative mx-auto h-full min-h-[480px] w-fit max-w-full'>
      <form ref={formRef} method='post' action={action} target={name} hidden>
        <input type='hidden' name='payload' value={payload} readOnly />
      </form>
      <iframe
        ref={frameRef}
        name={name}
        title={title}
        data-testid='blog-preview-frame'
        className={cn(
          'block h-full max-w-full rounded-md border bg-white',
          view === 'desktop' ? 'w-[1280px]' : 'w-[390px]'
        )}
      />
      {loading && (
        <div
          role='status'
          aria-live='polite'
          className='absolute inset-0 flex items-center justify-center rounded-md bg-background/70'
        >
          <Spinner size='large'>
            <span className='mt-2 text-sm text-muted-foreground'>
              Loading preview...
            </span>
          </Spinner>
        </div>
      )}
    </div>
  )
}
