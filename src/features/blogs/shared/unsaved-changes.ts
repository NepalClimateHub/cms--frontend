export type NavigationGuardState = {
  isDirty: boolean
  isSaving: boolean
  isSaved: boolean
}

export const shouldBlockNavigation = ({
  isDirty,
  isSaving,
  isSaved,
}: NavigationGuardState) => isDirty && !isSaving && !isSaved
