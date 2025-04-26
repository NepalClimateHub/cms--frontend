import { Meta } from '@/schemas/shared'
import apiClient from '../apiClient'
import { events } from '../shared/routes'
import { EventFormValues } from '@/schemas/event'

export const addEvent = async (
  payload: EventFormValues
): Promise<{
  data: {}
  meta: Meta
}> => {
  const response = await apiClient.post(events.add.path, payload)
  return response?.data
}
