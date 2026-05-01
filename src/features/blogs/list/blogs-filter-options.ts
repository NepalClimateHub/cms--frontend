import { parseAsString, parseAsBoolean } from 'nuqs'

export const blogsFilterOptions = {
  title: parseAsString,
  includeDrafts: parseAsBoolean.withDefault(true),
}

export type BlogsFilterOptions = typeof blogsFilterOptions
