import { parseAsString } from 'nuqs'

export const opportunitiesFilterOptions = {
  tag: parseAsString,
}

export type OpportunitiesFilterOptions = typeof opportunitiesFilterOptions
