import { parseAsString } from 'nuqs'

export const NewsListFilterOptions = {
  title: parseAsString,
}

export type NewsListFilterOptions = typeof NewsListFilterOptions
