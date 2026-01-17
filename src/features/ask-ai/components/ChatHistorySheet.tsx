import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/ui/shadcn/sheet'
import { Button } from '@/ui/shadcn/button'
import { ScrollArea } from '@/ui/shadcn/scroll-area'
import { Loader2, MessageSquare, Trash2, Plus } from 'lucide-react'
import { useChatHistory, useDeleteSession, ChatSession } from '@/query/ask-ai/climate-api'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/ui/shadcn/lib/utils'

interface ChatHistorySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectSession: (sessionId: string) => void
  currentSessionId?: string
  onNewChat: () => void
}

export function ChatHistorySheet({
  open,
  onOpenChange,
  onSelectSession,
  currentSessionId,
  onNewChat,
}: ChatHistorySheetProps) {
  const { data: history, isLoading } = useChatHistory()
  const deleteSession = useDeleteSession()

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteSession.mutate(sessionId)
      if (currentSessionId === sessionId) {
        onNewChat()
      }
    }
  }

  const handleNewChat = () => {
    onNewChat()
    onOpenChange(false)
  }

  const handleSelectSession = (sessionId: string) => {
    onSelectSession(sessionId)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Chat History</SheetTitle>
          <SheetDescription>
            Your past conversations with Climate Assistant
          </SheetDescription>
          <Button onClick={handleNewChat} className="mt-4 w-full gap-2" variant="outline">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : history?.conversations.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No chat history yet.
              </div>
            ) : (
              history?.conversations.map((session: ChatSession) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors",
                    currentSessionId === session.id && "bg-muted font-medium"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate">{session.title || 'Untitled Chat'}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(e, session.id)}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
