import { parseAsString } from 'nuqs'

export const eventsFilterOptions = {
  title: parseAsString,
}

export type EventsFilterOptions = typeof eventsFilterOptions
