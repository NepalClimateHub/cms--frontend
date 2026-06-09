import { parseAsString } from 'nuqs'

export const organizationFilterOptions = {
  tag: parseAsString,
}

export type OrganizationFilterOptions = typeof organizationFilterOptions
