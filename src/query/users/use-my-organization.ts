import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserOutput } from '@/api/types.gen'
import apiClient from '@/query/apiClient'
import { auth } from '@/query/shared/routes'
import { handleServerError } from '@/utils/handle-server-error'

export type UpdateMyOrganizationBody = {
  logoImageUrl?: string
  logoImageId?: string
  verificationDocumentUrl?: string
  verificationDocumentId?: string
  verificationRequestRemarks?: string
}

export function usePatchMyOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: UpdateMyOrganizationBody) => {
      const res = await apiClient.patch<{ data: UserOutput }>(
        '/api/v1/users/me/organization',
        body
      )
      return res.data.data as UserOutput
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [auth.profile.key] })
    },
    onError: handleServerError,
  })
}
