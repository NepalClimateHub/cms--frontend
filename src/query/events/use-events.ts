import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EventFormValues } from '@/schemas/event'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from '@/hooks/use-toast'
import { events } from '../shared/routes'
import { addEvent, getEvents } from './events-service'
import { cleanObj } from '@/utils/obj-utils'

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