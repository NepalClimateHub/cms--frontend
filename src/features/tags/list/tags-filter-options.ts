import { parseAsString } from "nuqs";

export const tagsFilterOptions = {
  tag: parseAsString,
}

export type TagsFilterOptions = typeof tagsFilterOptions
