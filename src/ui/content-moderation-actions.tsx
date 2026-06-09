import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, MessageSquareWarning } from 'lucide-react'
import apiClient from '@/query/apiClient'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isContentAdmin } from '@/utils/role-check.util'
import { useToast } from '@/hooks/use-toast'
import { Button } from './shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './shadcn/dialog'
import { Textarea } from './shadcn/textarea'

type EntityType = 'events' | 'news' | 'opportunity' | 'resource'

interface Props {
  entityId: string
  entityType: EntityType
}

export function ContentModerationActions({ entityId, entityType }: Props) {
  const role = getRoleFromToken()
  const canModerate = isContentAdmin(role)
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  if (!canModerate) return null

  const handleApprove = async () => {
    try {
      setIsLoading(true)
      await apiClient.patch(`/api/v1/${entityType}/${entityId}/moderate`, {
        action: 'APPROVE',
      })
      toast({ title: 'Approved', description: 'Content has been published.' })
      queryClient.invalidateQueries()
    } catch (_e) {
      toast({
        title: 'Moderation failed',
        description: 'Could not approve this content.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestImprovements = async () => {
    try {
      setIsLoading(true)
      await apiClient.patch(`/api/v1/${entityType}/${entityId}/moderate`, {
        action: 'REQUEST_IMPROVEMENTS',
        feedback,
      })
      toast({
        title: 'Feedback sent',
        description: 'Improvement request has been submitted.',
      })
      setOpen(false)
      setFeedback('')
      queryClient.invalidateQueries()
    } catch (_e) {
      toast({
        title: 'Moderation failed',
        description: 'Could not submit improvement request.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleApprove}
        size='sm'
        variant='default'
        className='h-6 bg-emerald-600 px-2 hover:bg-emerald-700'
        disabled={isLoading}
      >
        <CheckCircle2 className='h-4 w-4' />
      </Button>

      <Button
        onClick={() => setOpen(true)}
        size='sm'
        variant='outline'
        className='h-6 px-2'
        disabled={isLoading}
      >
        <MessageSquareWarning className='h-4 w-4' />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Improvements</DialogTitle>
            <DialogDescription>
              Provide clear feedback for the contributor.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder='Describe what should be improved...'
          />
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestImprovements}
              disabled={!feedback.trim() || isLoading}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
