import { parseAsString } from 'nuqs'

export const NewsListFilterOptions = {
  tag: parseAsString,
}

export type NewsListFilterOptions = typeof NewsListFilterOptions
