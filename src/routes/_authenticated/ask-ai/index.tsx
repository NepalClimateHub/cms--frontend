import { useState, useRef, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { Textarea } from '@/ui/shadcn/textarea'
import { Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useClimateChat, useClimateHealth, ChatMessage as ChatMessageType } from '@/query/ask-ai/climate-api'
import { cn } from '@/ui/shadcn/lib/utils'

export const Route = createFileRoute('/_authenticated/ask-ai/')({
  component: AskAI,
})

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ source?: string; page?: number }>
  timestamp: Date
}

function AskAI() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatMutation = useClimateChat()
  const healthQuery = useClimateHealth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    try {
      const conversationHistory: ChatMessageType[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await chatMutation.mutateAsync({
        query: userMessage.content,
        conversation_history: conversationHistory,
        conversation_id: conversationId,
      })

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        sources: response.sources,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (response.conversation_id) {
        setConversationId(response.conversation_id)
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
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
        <div className='flex items-center justify-between gap-3'>
          <PageHeader
            title='Ask AI'
            description='Easily find Climate/Environment related research, news, policy and many more'
          />
          {/* Health Status Indicator */}
          <div className='flex items-center gap-2 text-sm'>
            {healthQuery.data?.status === 'healthy' ? (
              <span className='flex items-center gap-1 text-green-600'>
                <CheckCircle2 className='h-4 w-4' />
                Online
              </span>
            ) : (
              <span className='flex items-center gap-1 text-amber-600'>
                <AlertCircle className='h-4 w-4' />
                Checking...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='mx-auto max-w-4xl space-y-4'>
            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-4 py-12 text-center'>
                <div className='text-4xl'>🌍</div>
                <h3 className='text-lg font-medium'>Welcome to Climate Assistant</h3>
                <p className='text-muted-foreground'>
                  Ask me anything about climate change, environmental impacts, or Nepal's climate data.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}

            {chatMutation.isPending && (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className='flex-shrink-0 border-t bg-background p-4'>
          <div className='mx-auto max-w-4xl'>
            <div className='flex gap-2'>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='Ask anything about climate, environment, research, news, policy...'
                className='min-h-[60px] resize-none'
                rows={2}
                disabled={chatMutation.isPending}
              />
              <Button 
                onClick={handleSend} 
                disabled={chatMutation.isPending || !input.trim()} 
                className='h-auto px-4'
              >
                {chatMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Main>
  )
}

// Chat Message Component
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-4',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className='whitespace-pre-wrap'>{message.content}</p>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className='mt-3 border-t border-border/50 pt-3'>
            <p className='mb-1 text-xs font-medium opacity-70'>Sources:</p>
            <ul className='space-y-1 text-xs opacity-60'>
              {message.sources.map((source, idx) => (
                <li key={idx}>
                  📄 {source.source || 'Unknown'}
                  {source.page && ` (Page ${source.page})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className='mt-2 text-xs opacity-50'>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
