import { parseAsString } from 'nuqs'

export const opportunitiesFilterOptions = {
  title: parseAsString,
  status: parseAsString,
}

export type OpportunitiesFilterOptions = typeof opportunitiesFilterOptions
