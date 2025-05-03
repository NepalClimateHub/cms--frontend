import { Meta } from '@/schemas/shared'
import apiClient from '../apiClient'
import { events } from '../shared/routes'
import { EventFormValues } from '@/schemas/event'
import { buildQueryParams } from '@/utils/query-params'

export const addEvent = async (
  payload: EventFormValues
): Promise<{
  data: {}
  meta: Meta
}> => {
  const response = await apiClient.post(events.add.path, payload)
  return response?.data
}

export const getEvents = async (
  query: { [k: string]: string | number | string[] | number[] } = {}
): Promise<{
  data: EventFormValues[]
  meta: Meta
}> => {
  const queryParams = buildQueryParams(query)
  const response = await apiClient.get(events.getall.path, {
    params: queryParams,
  })
  return response?.data
}

export const updateEventStatus = async (
  eventId: string,
  isDraft: boolean
): Promise<{
  data: {}
  meta: Meta
}> => {
  const response = await apiClient.patch(`${events.update.path}/${eventId}`, {
    isDraft
  })
  return response?.data
}