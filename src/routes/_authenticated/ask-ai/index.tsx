import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { Textarea } from '@/ui/shadcn/textarea'
import { Send } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/ask-ai/')({
  component: AskAI,
})

function AskAI() {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement AI chat functionality
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Main className='flex flex-col' fixed>
      <div className='flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <PageHeader
            title='Ask AI'
            description='Easily find Climate/Environment related researchs, news, policy and many more'
          />
        </div>
      </div>

      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Main content area - can be used for chat messages in the future */}
        <div className='flex-1 overflow-y-auto p-4'>
          {/* Chat messages will go here */}
          <div className='mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 py-12'>
            <Badge variant='outline' className='bg-muted px-4 py-2 text-base'>
              Coming Soon
            </Badge>
            <p className='text-center text-lg text-muted-foreground'>
              This feature is currently under development. Stay tuned for
              updates!
            </p>
          </div>
        </div>

        {/* Fixed chat bar at bottom */}
        <div className='flex-shrink-0 border-t bg-background p-4'>
          <div className='mx-auto max-w-4xl'>
            <div className='flex gap-2'>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='Ask anything about climate, environment, research, news, policy...'
                className='min-h-[60px] resize-none'
                rows={2}
                disabled
              />
              <Button onClick={handleSend} disabled className='h-auto px-4'>
                <Send className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Main>
  )
}
