import { parseAsString } from 'nuqs'

export const eventsFilterOptions = {
  tag: parseAsString,
}

export type EventsFilterOptions = typeof eventsFilterOptions
