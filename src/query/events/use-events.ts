import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EventFormValues } from '@/schemas/event'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from '@/hooks/use-toast'
import { events } from '../shared/routes'
import { addEvent } from './events-service'

export const useAddEvents = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EventFormValues) => addEvent(payload),
    mutationKey: [events.add.key],
    onError: (err: Error) => {
      handleServerError(err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [events.getall.key],
        exact: false,
      })
      toast({
        variant: 'default',
        title: 'Event added successfully.',
      })
    },
  })
}
