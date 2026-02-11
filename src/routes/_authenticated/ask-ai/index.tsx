import { useState, useRef, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { Textarea } from '@/ui/shadcn/textarea'
import { Send, Loader2, AlertCircle, CheckCircle2, Paperclip } from 'lucide-react'
import { useClimateChat, useClimateHealth, useChatSession } from '@/query/ask-ai/climate-api'
import { cn } from '@/ui/shadcn/lib/utils'
import { ChatHistoryMenu } from '@/features/ask-ai/components/ChatHistoryMenu'
// React Markdown
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
  const { data: sessionData, isLoading: isSessionLoading } = useChatSession(conversationId)

  // Load messages when conversationId changes (switching sessions)
  useEffect(() => {
    if (sessionData && conversationId) {
      const loadedMessages: Message[] = sessionData.messages.map((msg) => ({
        id: crypto.randomUUID(),
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }))
      setMessages(loadedMessages)
    }
  }, [sessionData, conversationId])

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
      const response = await chatMutation.mutateAsync({
        query: userMessage.content,
        // conversation_history: conversationHistory, 
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

      if (response.conversation_id && !conversationId) {
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

  const handleNewChat = () => {
    setConversationId(undefined)
    setMessages([])
    setInput('')
  }

  return (
    <Main className='flex flex-col bg-background' fixed>
      <div className='flex-shrink-0'>
        <div className='flex items-center justify-between gap-3'>
          <PageHeader
            title='Ask AI'
            description=''
          />
          <div className='flex items-center gap-4'>
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

            <ChatHistoryMenu
              onSelectSession={setConversationId}
              currentSessionId={conversationId}
              onNewChat={handleNewChat}
            />
          </div>
        </div>
      </div>

      <div className='flex flex-1 flex-col overflow-hidden relative'>
        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='mx-auto max-w-3xl space-y-6'>
            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-6 py-12 text-center mt-10'>
                <div className='text-6xl'>🌍</div>
                <div className="space-y-2">
                    <h3 className='text-2xl font-semibold tracking-tight'>Welcome to Climate Assistant</h3>
                    <p className='text-muted-foreground max-w-md mx-auto'>
                    Easily find Climate/Environment related research, news, and policy.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-4">
                    {[
                        "Nepal's Mitigation Strategies",
                        "Climate Impact on Agriculture",
                        "Renewable Energy Policies",
                        "Carbon Reduction Targets"
                    ].map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => {
                                setInput(suggestion);
                                // Optional: auto-send
                                // handleSend(); 
                            }}
                            className="text-sm bg-muted/50 hover:bg-muted text-foreground px-4 py-3 rounded-xl border border-border/50 transition-colors text-left font-medium"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}

            {(chatMutation.isPending || isSessionLoading) && (
              <div className='flex items-center gap-2 text-muted-foreground animate-pulse'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>{isSessionLoading ? 'Loading chat...' : 'Thinking...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className='flex-shrink-0 p-4 pb-6'>
          <div className='mx-auto max-w-3xl'>
            <div className="relative flex items-center w-full shadow-sm rounded-2xl border bg-background focus-within:ring-1 focus-within:ring-ring px-2 py-2">
                <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground hover:text-foreground h-10 w-10 rounded-full">
                    <Paperclip className="h-5 w-5" />
                </Button>
                
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder='Ask anything...'
                    // Remove default border and ring as we handle it in parent container
                    className='flex-1 border-none shadow-none focus-visible:ring-0 min-h-[44px] max-h-[200px] resize-none py-3 px-3 scrollbar-hide'
                    rows={1}
                    disabled={chatMutation.isPending}
                />
                
                <Button 
                    onClick={handleSend} 
                    disabled={chatMutation.isPending || !input.trim()} 
                    size="icon"
                    className='h-10 w-10 rounded-xl flex-shrink-0'
                >
                    {chatMutation.isPending ? (
                    <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                    <Send className='h-5 w-5' />
                    )}
                </Button>
            </div>
            
          </div>
        </div>
      </div>
    </Main>
  )
}


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
        <div className="markdown-content prose prose-sm dark:prose-invert max-w-none break-words [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:mb-2 [&>p:last-child]:mb-0">
            {isUser ? (
                <p className='whitespace-pre-wrap'>{message.content}</p>
            ) : (
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        a: ({node, ...props}) => <a {...props} className="text-blue-500 hover:underline underline-offset-2" target="_blank" rel="noopener noreferrer" />,
                        ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 mb-2 space-y-1" />,
                        ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 mb-2 space-y-1" />,
                        li: ({node, ...props}) => <li {...props} className="mb-0.5" />,
                        h1: ({node, ...props}) => <h1 {...props} className="text-lg font-bold mb-2" />,
                        h2: ({node, ...props}) => <h2 {...props} className="text-base font-bold mb-2" />,
                        h3: ({node, ...props}) => <h3 {...props} className="text-sm font-bold mb-1" />,
                    }}
                >
                    {message.content}
                </ReactMarkdown>
            )}
        </div>

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
