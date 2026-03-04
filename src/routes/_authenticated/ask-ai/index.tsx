import { useState, useRef, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Main } from '@/ui/layouts/main'
import { Button } from '@/ui/shadcn/button'
import { Textarea } from '@/ui/shadcn/textarea'
import {
  Send,
  Loader2,
  ChevronRight,
  ChevronDown,
  Plus,
  BookOpen,
  ShieldCheck,
  FileText,
  Copy,
  Check,
} from 'lucide-react'
import { useClimateChat, useChatSession } from '@/query/ask-ai/climate-api'
import { cn } from '@/ui/shadcn/lib/utils'
import { ChatHistoryMenu } from '@/features/ask-ai/components/ChatHistoryMenu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/shadcn/dialog'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const Route = createFileRoute('/_authenticated/ask-ai/')({
  component: AskAI,
})

interface Source {
  source?: string
  page?: number
  score?: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  timestamp: Date
}


function parseContentAndSources(content: string, existing?: Source[]) {
  console.log('parseContentAndSources input:', { content: content.substring(0, 100), existing })
  // Strip any trailing "Sources:" section the LLM appends to the answer text
  const re = /\n*(?:\*{0,2}Sources:?\*{0,2})\s*\n([\s\S]*?)$/i
  const m = content.match(re)
  const cleaned = m ? content.slice(0, m.index).trimEnd() : content
  
  // Use structured API sources if available
  if (existing && existing.length > 0) {
    return { cleaned, sources: existing }
  }
  
  // Fallback: parse from text only if sources look valid (for chat history)
  let sources: Source[] = []
  if (m) {
    const parsed = m[1]
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => {
        let text = l.replace(/^[\s\-*•]+/, '').trim()
        let page: number | undefined
        
        // Match " (Page N)" or " - Page N"
        const pageMatch = text.match(/[(-]\s*Page\s+(\d+)\s*[)-]?/i)
        if (pageMatch) {
          page = parseInt(pageMatch[1], 10)
          text = text.replace(pageMatch[0], '').trim()
        }
        
        return { source: text, page }
      })
      // Filter out garbage: reject entries that look malformed
      .filter(s => {
        if (!s.source) return false
        // Reject obvious garbage like "Sources:**"
        if (s.source.includes('**') || s.source.includes('Sources:')) return false
        // Accept anything else (LLM writes clean names without .pdf)
        return true
      })
    
    if (parsed.length > 0) {
      sources = parsed
    }
  }
  
  console.log('📤 parseContentAndSources output:', { cleaned: cleaned.substring(0, 50), sources })
  return { cleaned, sources }
}



function AskAI() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatMutation = useClimateChat()

  const { data: sessionData, isLoading: isSessionLoading } = useChatSession(conversationId)




  useEffect(() => {
    if (sessionData && conversationId) {
      setMessages(
        sessionData.messages.map((msg) => ({
          id: crypto.randomUUID(),
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }))
      )
    }
  }, [sessionData, conversationId])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(scrollToBottom, [messages])

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages((p) => [...p, userMsg])
    setInput('')

    try {
      const res = await chatMutation.mutateAsync({
        query: userMsg.content,
        conversation_id: conversationId,
      })
      console.log('🔍 API Response:', { response: res.response?.substring(0, 50), sources: res.sources })
      setMessages((p) => [
        ...p,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: res.response,
          sources: res.sources,
          timestamp: new Date(),
        },
      ])
      if (res.conversation_id && !conversationId) setConversationId(res.conversation_id)
    } catch (err) {
      setMessages((p) => [
        ...p,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Sorry, something went wrong.',
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

      <div className='mb-4'>
        <h1 className='text-2xl font-bold tracking-tight'>Ask AI</h1>
        <p className='text-muted-foreground'>Get AI-powered answers from Nepal's climate documents</p>
      </div>

      <div className='flex-shrink-0 flex items-center justify-end gap-3 mb-1'>
        <ChatHistoryMenu
          onSelectSession={setConversationId}
          currentSessionId={conversationId}
          onNewChat={handleNewChat}
        />
      </div>


      <div className='flex flex-1 overflow-hidden'>

        <div className='flex flex-1 flex-col overflow-hidden min-w-0'>

          <div className='flex-1 overflow-y-auto px-2 py-4'>
            <div className='mx-auto max-w-3xl space-y-6'>
              {messages.length === 0 ? (
                <EmptyState onSuggestion={setInput} />
              ) : (
                messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
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


          <div className='flex-shrink-0 px-2 pb-4 pt-2'>
            <div className='mx-auto max-w-3xl'>
              <div className='relative flex items-center w-full shadow-sm rounded-2xl border bg-background focus-within:ring-1 focus-within:ring-ring px-2 py-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='flex-shrink-0 text-muted-foreground hover:text-foreground h-10 w-10 rounded-full'
                >
                  <Plus className='h-5 w-5' />
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Ask something...'
                  className='flex-1 border-none shadow-none focus-visible:ring-0 min-h-[44px] max-h-[200px] resize-none py-3 px-3 scrollbar-hide'
                  rows={1}
                  disabled={chatMutation.isPending}
                />
                <Button
                  onClick={handleSend}
                  disabled={chatMutation.isPending || !input.trim()}
                  size='icon'
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

      </div>
    </Main>
  )
}


function EmptyState({ onSuggestion }: { onSuggestion: (q: string) => void }) {
  const suggestions = [
    "Nepal's Mitigation Strategies",
    'Climate Impact on Agriculture',
    'Renewable Energy Policies',
    'Carbon Reduction Targets',
  ]

  return (
    <div className='flex flex-col items-center justify-center gap-6 py-12 text-center mt-10'>
      <div className='text-6xl'>🌍</div>
      <div className='space-y-2'>
        <h3 className='text-2xl font-semibold tracking-tight'>Welcome to Climate Assistant</h3>
        <p className='text-muted-foreground max-w-md mx-auto'>
          Easily find Climate/Environment related research, news, and policy.
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-4'>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className='text-sm bg-muted/50 hover:bg-muted text-foreground px-4 py-3 rounded-xl border border-border/50 transition-colors text-left font-medium'
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}


function SourceCard({ source, index }: { source: Source; index: number }) {
  const name = source.source || 'Unknown source'

  let filename = name.split('/').pop() || ''

  if (filename && !filename.includes('.')) filename += '.pdf'
  const ragApiUrl = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000'
  const documentUrl = filename ? `${ragApiUrl}/documents/${encodeURIComponent(filename)}` : ''

  return (
    <div className='flex items-center gap-3 rounded-lg border bg-card px-3 py-2 hover:shadow-sm transition-shadow'>
      <span className='flex items-center justify-center h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold flex-shrink-0'>
        {index}
      </span>

      <p className='text-sm font-medium truncate flex-1 min-w-0'>{filename}</p>

      {documentUrl && (
        <Dialog>
          <DialogTrigger asChild>
            <button className='flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors flex-shrink-0'>
              <BookOpen className='h-3.5 w-3.5' />
              View Document
            </button>
          </DialogTrigger>
          <DocumentViewerDialog filename={filename} documentUrl={documentUrl} page={source.page} />
        </Dialog>
      )}

      {source.page != null && (
        <span className='text-xs text-muted-foreground flex-shrink-0'>Page {source.page}</span>
      )}
    </div>
  )
}


function ChatMessage({ message }: { message: Message }) {
  console.log('💬 ChatMessage received:', { role: message.role, sources: message.sources })
  const isUser = message.role === 'user'
  const { cleaned, sources } = isUser
    ? { cleaned: message.content, sources: [] as Source[] }
    : parseContentAndSources(message.content, message.sources)

  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(cleaned)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>

      {isUser ? (
        <div className='max-w-[80%] rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-5 py-3'>
          <p className='whitespace-pre-wrap text-sm text-blue-800 dark:text-blue-200'>{message.content}</p>
        </div>
      ) : (

        <div className='w-full max-w-[95%]'>
          <div className='flex items-center justify-between px-4 py-2.5 rounded-t-xl border border-b-0 bg-muted/40'>
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Answer</span>
              {sources.length > 0 && (
                <div className='flex items-center gap-1 ml-1'>
                  {sources.map((s, i) => (
                    <SourceBubble key={i} source={s} index={i + 1} />
                  ))}
                </div>
              )}
            </div>
            <div className='flex items-center gap-1'>
              <button
                onClick={handleCopy}
                className='p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
                title='Copy answer'
              >
                {copied ? <Check className='h-4 w-4 text-green-500' /> : <Copy className='h-4 w-4' />}
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className='p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
                title={collapsed ? 'Expand' : 'Collapse'}
              >
                <ChevronDown className={cn('h-4 w-4 transition-transform', collapsed && '-rotate-90')} />
              </button>
            </div>
          </div>

          {!collapsed && (
            <div className='px-4 py-4 rounded-b-xl border'>
              <div className='markdown-content prose prose-sm dark:prose-invert max-w-none break-words [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:mb-2 [&>p:last-child]:mb-0'>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className='text-blue-500 hover:underline underline-offset-2'
                        target='_blank'
                        rel='noopener noreferrer'
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} className='list-disc pl-4 mb-2 space-y-1' />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol {...props} className='list-decimal pl-4 mb-2 space-y-1' />
                    ),
                    li: ({ node, ...props }) => <li {...props} className='mb-0.5' />,
                    h1: ({ node, ...props }) => (
                      <h1 {...props} className='text-lg font-bold mb-2' />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 {...props} className='text-base font-bold mb-2' />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} className='text-sm font-bold mb-1' />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong {...props} className='font-semibold' />
                    ),
                  }}
                >
                  {cleaned}
                </ReactMarkdown>
              </div>

              <div className='flex items-center gap-3 mt-3 text-xs text-muted-foreground'>
                {sources.length > 0 && (
                  <span className='flex items-center gap-1 text-green-600 dark:text-green-400'>
                    <ShieldCheck className='h-3.5 w-3.5' />
                    Answer grounded in sources
                  </span>
                )}
                <span>{message.timestamp.toLocaleTimeString()}</span>
              </div>

              {sources.length > 0 && (
                <div className='mt-4 pt-3 border-t'>
                  <div className='flex items-center gap-2 mb-2'>
                    <BookOpen className='h-3.5 w-3.5 text-muted-foreground' />
                    <span className='text-xs font-medium text-muted-foreground'>Sources ({sources.length})</span>
                  </div>
                  <div className='flex flex-col gap-2'>
                    {sources.map((src, idx) => (
                      <SourceCard key={idx} source={src} index={idx + 1} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SourceBubble({ source, index }: { source: Source; index: number }) {
  const name = source.source || 'Unknown source'
  let filename = name.split('/').pop() || ''
  if (filename && !filename.includes('.')) filename += '.pdf'
  const ragApiUrl = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000'
  const documentUrl = filename ? `${ragApiUrl}/documents/${encodeURIComponent(filename)}` : ''

  if (!documentUrl) {
    return (
      <span className='inline-flex items-center justify-center h-5 w-5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold cursor-default'>
        {index}
      </span>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className='inline-flex items-center justify-center h-5 w-5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors'
          title={`View ${filename}`}
        >
          {index}
        </button>
      </DialogTrigger>
      <DocumentViewerDialog filename={filename} documentUrl={documentUrl} page={source.page} />
    </Dialog>
  )
}

function DocumentViewerDialog({ filename, documentUrl, page }: { filename: string, documentUrl: string, page?: number }) {
  return (
    <DialogContent className='max-w-5xl w-[90vw] h-[85vh] p-0 gap-0'>
      <DialogHeader className='px-6 py-4 border-b flex flex-row items-center justify-between'>
        <DialogTitle className='text-sm font-medium truncate flex-1'>
          {filename}
          {page != null && (
            <span className='ml-2 text-muted-foreground font-normal'>
              — Page {page}
            </span>
          )}
        </DialogTitle>
        <a 
          href={documentUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center gap-1 ml-4"
        >
          Open in New Tab <ChevronRight className="h-3 w-3" />
        </a>
      </DialogHeader>
      <iframe
        src={`${documentUrl}${page ? `#page=${page}` : ''}`}
        className='w-full flex-1 border-0'
        style={{ height: 'calc(85vh - 65px)' }}
        title={`PDF: ${filename}`}
      />
    </DialogContent>
  )
}
