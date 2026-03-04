import { useState, useMemo } from 'react'
import { useChatHistory, ChatSession } from '@/query/ask-ai/climate-api'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/shadcn/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/shadcn/command'
import { Button } from '@/ui/shadcn/button'
import { ScrollArea } from '@/ui/shadcn/scroll-area'
import { History, MessageSquare, ChevronDown, Loader2 } from 'lucide-react'
import { isToday, isYesterday, subDays, isAfter } from 'date-fns'
import { cn } from '@/ui/shadcn/lib/utils'

interface ChatHistoryMenuProps {
  currentSessionId?: string
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
}

export function ChatHistoryMenu({ currentSessionId, onSelectSession, onNewChat }: ChatHistoryMenuProps) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useChatHistory()
  const sessions = data?.conversations || []

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: Record<string, ChatSession[]> = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      'Older': []
    }

    sessions.forEach(session => {
      const date = new Date(session.created_at) // Assuming created_at is available
      
      if (isToday(date)) {
        groups['Today'].push(session)
      } else if (isYesterday(date)) {
        groups['Yesterday'].push(session)
      } else if (isAfter(date, subDays(new Date(), 7))) {
        groups['Previous 7 Days'].push(session)
      } else if (isAfter(date, subDays(new Date(), 30))) {
        groups['Previous 30 Days'].push(session)
      } else {
        groups['Older'].push(session)
      }
    })

    // Remove empty groups
    return Object.entries(groups).filter(([_, group]) => group.length > 0)
  }, [sessions])

  const handleSelect = (sessionId: string) => {
    onSelectSession(sessionId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 h-9">
          <History className="h-4 w-4" />
          <span>History</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <div className="p-2 border-b">
            <Button 
                variant="default" 
                className="w-full justify-start" 
                onClick={() => {
                    onNewChat()
                    setOpen(false)
                }}
            >
                <MessageSquare className="mr-2 h-4 w-4" />
                New Chat
            </Button>
        </div>
        <Command>
            <CommandInput placeholder="Search history..." className="h-9 border-none focus:ring-0 shadow-none" />
          
          <CommandList className="max-h-[400px]">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading history...
              </div>
            ) : sessions.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No chat history found.
              </CommandEmpty>
            ) : (
                <ScrollArea className="h-[300px]">
                    {groupedSessions.map(([groupName, groupMessages]) => (
                        <CommandGroup key={groupName} heading={groupName} className="text-muted-foreground">
                        {groupMessages.map((session) => (
                            <CommandItem
                            key={session.id}
                            value={`${session.title} ${session.id}`} // Search by title and ID to ensure uniqueness in search index if needed, primarily title
                            onSelect={() => handleSelect(session.id)}
                            className={cn(
                                "cursor-pointer rounded-md px-2 py-2 aria-selected:bg-accent aria-selected:text-accent-foreground",
                                currentSessionId === session.id && "bg-accent text-accent-foreground font-medium"
                            )}
                            >
                            <MessageSquare className="mr-2 h-4 w-4 opacity-70" />
                            <span className="truncate flex-1">{session.title || 'New Chat'}</span>
                            {currentSessionId === session.id && (
                                <div className="ml-auto w-1 h-1 rounded-full bg-primary" />
                            )}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    ))}
                </ScrollArea>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
