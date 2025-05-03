import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EventFormValues } from '@/schemas/event'
import { handleServerError } from '@/utils/handle-server-error'
import { cleanObj } from '@/utils/obj-utils'
import { toast } from '@/hooks/use-toast'
import { events } from '../shared/routes'
import {
  addEvent,
  deleteEvent,
  getEvents,
  updateEventStatus,
} from './events-service'

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

// export const useAddEventsV2 = () => {
//   const queryClient = useQueryClient()
//   return useMutation({
//     ...eventsControllerAddEventMutation(),
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: [events.getall.key],
//         exact: false,
//       })
//       toast({
//         variant: 'default',
//         title: 'Event added successfully.',
//       })
//     },
//   })
// }

export const useGetEvents = (
  query: { [k: string]: string | number | string[] | number[] } = {},
  enabled = true
) => {
  const cleanQuery = cleanObj(query)
  return useQuery({
    queryKey: [events.getall.key, query],
    queryFn: () => getEvents(cleanQuery),
    enabled,
  })
}

export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { eventId: string; isDraft: boolean }) =>
      updateEventStatus(payload.eventId, payload.isDraft),
    mutationKey: [events.update.key],
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
        title: 'Event updated successfully.',
      })
    },
  })
}

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { eventId: string }) => deleteEvent(payload.eventId),
    mutationKey: [events.update.key],
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
        title: 'Event deleted successfully.',
      })
    },
  })
}
