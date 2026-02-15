import { parseAsString } from 'nuqs'

export const eventsFilterOptions = {
  title: parseAsString,
  status: parseAsString,
}

export type EventsFilterOptions = typeof eventsFilterOptions
