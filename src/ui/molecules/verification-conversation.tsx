import { Building2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/ui/shadcn/button'
import { cn } from '@/ui/shadcn/lib/utils'

export type VerificationMessage = {
  id: string
  senderType: 'ORGANIZATION' | 'ADMIN'
  senderUserId?: string | null
  message: string
  createdAt: string
}

function MessageCard({ message }: { message: VerificationMessage }) {
  const isAdmin = message.senderType === 'ADMIN'

  return (
    <li className='flex items-start gap-2.5 text-sm'>
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          isAdmin
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            : 'bg-primary/10 text-primary'
        )}
        aria-hidden
      >
        {isAdmin ? (
          <ShieldCheck className='size-4' />
        ) : (
          <Building2 className='size-4' />
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5 leading-tight'>
          <span className='font-semibold text-foreground'>
            {isAdmin ? 'Verification team' : 'Organization'}
          </span>
          <time
            className='text-xs text-muted-foreground'
            dateTime={message.createdAt}
          >
            {new Date(message.createdAt).toLocaleString()}
          </time>
        </div>
        <p className='mt-0.5 whitespace-pre-wrap text-foreground'>
          {message.message}
        </p>
      </div>
    </li>
  )
}

export function VerificationConversation({
  messages,
  className,
}: {
  messages: VerificationMessage[] | null | undefined
  className?: string
}) {
  const [showHistory, setShowHistory] = useState(false)
  const orderedMessages = [...(messages ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  if (!orderedMessages.length) {
    return <p className='text-sm text-muted-foreground'>No messages yet.</p>
  }

  const latestMessage = orderedMessages.at(-1)!
  const earlierMessages = orderedMessages.slice(0, -1)
  const hasHistory = earlierMessages.length > 0

  return (
    <section
      className={cn('space-y-3', className)}
      aria-label='Verification conversation'
    >
      <div className='flex items-center justify-between gap-3'>
        <h3 className='text-sm font-medium text-foreground'>
          Verification conversation
        </h3>
        <span className='text-xs text-muted-foreground'>
          {orderedMessages.length} message
          {orderedMessages.length === 1 ? '' : 's'}
        </span>
      </div>

      {hasHistory ? (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-auto px-0 py-0.5 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground'
          onClick={() => setShowHistory((visible) => !visible)}
          aria-expanded={showHistory}
        >
          {showHistory ? (
            <>
              Hide earlier messages
              <ChevronUp className='ml-1 h-3.5 w-3.5' />
            </>
          ) : (
            <>
              View {earlierMessages.length} earlier message
              {earlierMessages.length === 1 ? '' : 's'}
              <ChevronDown className='ml-1 h-3.5 w-3.5' />
            </>
          )}
        </Button>
      ) : null}

      <ol className='space-y-3'>
        {showHistory
          ? earlierMessages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))
          : null}
        <MessageCard message={latestMessage} />
      </ol>
    </section>
  )
}
