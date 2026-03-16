import { useState, useRef, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/ui/shadcn/sheet'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { ScrollArea } from '@/ui/shadcn/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/shadcn/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/shadcn/alert-dialog'
import { Loader2, MessageSquare, Trash2, Plus, MoreHorizontal, Pencil } from 'lucide-react'
import { useChatHistory, useDeleteSession, useRenameSession, ChatSession } from '@/query/ask-ai/climate-api'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/ui/shadcn/lib/utils'
import { useToast } from '@/hooks/use-toast'

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
  const renameSession = useRenameSession()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering rename mode
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    setDeleteId(sessionId)
  }

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteSession.mutate(deleteId, {
        onSuccess: () => {
          toast({
            title: 'Chat deleted',
            description: 'The conversation has been successfully deleted.',
          })
        },
      })
      if (currentSessionId === deleteId) {
        onNewChat()
      }
    }
    setDeleteId(null)
  }

  const handleStartRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation()
    setEditingId(session.id)
    setEditTitle(session.title || '')
  }

  const handleSaveRename = (sessionId: string) => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== '') {
      renameSession.mutate({ sessionId, title: trimmed })
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveRename(sessionId)
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }

  const handleNewChat = () => {
    onNewChat()
    onOpenChange(false)
  }

  const handleSelectSession = (sessionId: string) => {
    // Don't navigate if we're in rename mode
    if (editingId) return
    onSelectSession(sessionId)
    onOpenChange(false)
  }

  const formatDate = (session: ChatSession) => {
    const raw = session.updatedAt || (session as any).updated_at || session.createdAt || (session as any).created_at
    const d = raw ? new Date(raw) : null
    return d && !isNaN(d.getTime())
      ? formatDistanceToNow(d, { addSuffix: true })
      : ''
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
          <div className="p-4 space-y-1">
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
                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                    <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                      {editingId === session.id ? (
                        <Input
                          ref={inputRef}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveRename(session.id)}
                          onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                          className="h-7 text-sm px-2 py-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <span className="truncate">{session.title || 'Untitled Chat'}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(session)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {editingId !== session.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={(e) => handleStartRename(e as any, session)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => handleDeleteClick(e as any, session.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}
