import { parseAsString } from 'nuqs'

export const opportunitiesFilterOptions = {
  title: parseAsString,
}

export type OpportunitiesFilterOptions = typeof opportunitiesFilterOptions
