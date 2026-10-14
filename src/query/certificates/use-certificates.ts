import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from '@/api/client.gen'
import { Meta } from '@/schemas/shared'
import { toast } from 'sonner'

export interface PublicCertificateDetails {
  certificateNumber: string
  name: string
  role: string
  teamName?: string | null
  dateJoined: string
  dateEnded: string | null
  duration: string
  certificateType: string
  profilePicture: string | null
  issuedAt?: string
  organization: string
}

export interface PublicVerificationResponse {
  valid: boolean
  status: 'VERIFIED' | 'NOT_FOUND' | 'REVOKED'
  message?: string
  certificate?: PublicCertificateDetails
}

export interface AdminCertificateResponse {
  id: string
  certificateNumber: string
  verificationCode?: string
  certificateType: string
  role: string
  teamName?: string | null
  dateJoined: string
  dateEnded: string | null
  duration: string
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED'
  issuedAt: string
  revokedAt?: string | null
  revocationReason?: string | null
  volunteer: {
    id: string
    fullName: string
    email?: string | null
    profilePictureUrl?: string | null
  }
  verificationCount: number
  createdAt: string
}

export interface CertificateLog {
  id: string
  result: string
  requestedAt: string
  ipHash?: string | null
  userAgent?: string | null
}

export interface CreateCertificatePayload {
  volunteerId?: string
  fullName?: string
  email?: string
  profilePictureUrl?: string
  certificateType: string
  role: string
  teamName?: string
  dateJoined: string
  dateEnded?: string
  issuedAt?: string
}

export const useVerifyCertificate = () => {
  return useMutation({
    mutationFn: async (code: string): Promise<PublicVerificationResponse> => {
      try {
        const response = await client.post({
          url: '/api/v1/public/certificates/verify',
          body: { code },
        })
        return response.data as PublicVerificationResponse
      } catch (err: any) {
        // Handle structured API error or status
        if (err?.response?.data) {
          return err.response.data as PublicVerificationResponse
        }
        if (err?.error?.message) {
          throw new Error(err.error.message)
        }
        if (err?.message) {
          throw new Error(err.message)
        }
        throw new Error('We could not verify the certificate right now. Please try again later.')
      }
    },
  })
}

export const useGetCertificates = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['certificates', params],
    queryFn: async () => {
      const response = await client.get({
        url: '/api/v1/admin/certificates',
        query: params,
      })
      return response.data as {
        data: AdminCertificateResponse[]
        meta: Meta
      }
    },
  })
}

export const useGetCertificate = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => {
      const response = await client.get({
        url: `/api/v1/admin/certificates/${id}`,
      })
      return response.data as { data: AdminCertificateResponse }
    },
    enabled: Boolean(id) && enabled,
  })
}

export const useCreateCertificate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCertificatePayload) => {
      const response = await client.post({
        url: '/api/v1/admin/certificates',
        body: data,
      })
      return response.data as { data: AdminCertificateResponse }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
      toast.success('Certificate created successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create certificate')
    },
  })
}

export const useRegenerateCertificateCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.post({
        url: `/api/v1/admin/certificates/${id}/regenerate-code`,
      })
      return response.data as {
        data: {
          certificateId: string
          certificateNumber: string
          verificationCode: string
        }
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
      queryClient.invalidateQueries({ queryKey: ['certificate', id] })
      toast.success('Verification code regenerated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to regenerate verification code')
    },
  })
}

export const useRevokeCertificate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await client.post({
        url: `/api/v1/admin/certificates/${id}/revoke`,
        body: { reason },
      })
      return response.data as { data: AdminCertificateResponse }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
      queryClient.invalidateQueries({ queryKey: ['certificate', id] })
      toast.success('Certificate revoked successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to revoke certificate')
    },
  })
}

export const useGetCertificateLogs = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['certificate-logs', id],
    queryFn: async () => {
      const response = await client.get({
        url: `/api/v1/admin/certificates/${id}/logs`,
      })
      return response.data as { data: CertificateLog[] }
    },
    enabled: Boolean(id) && enabled,
  })
}
