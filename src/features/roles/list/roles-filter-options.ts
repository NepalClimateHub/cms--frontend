import { parseAsString } from "nuqs";

export const rolesFilterOptions = {
  name: parseAsString,
  organizationId: parseAsString
}

export type RolesFilterOptions = typeof rolesFilterOptions
