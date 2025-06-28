import { parseAsString } from 'nuqs'

export const blogsFilterOptions = {
  title: parseAsString,
}

export type BlogsFilterOptions = typeof blogsFilterOptions
