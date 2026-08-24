import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  VacancyFormValues,
  VacancyApplyFormValues,
  VacancyQuestion,
  VacancyAnswer,
} from '@/schemas/vacancy'
import { Meta } from '@/schemas/shared'
import { toast } from 'sonner'
import { client } from '@/api/client.gen'

export interface VacancyApplicationResponseDto {
  id: string
  vacancyId: string
  fullName: string
  email: string
  contact: string
  currentAddress?: string
  /** Legacy free-text cover letter — no longer collected, still rendered if present. */
  message?: string
  answers?: VacancyAnswer[]
  cvUrl: string
  cvFileId?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface VacancyResponseDto {
  id: string
  title: string
  openings: number
  duration?: string
  hoursPerWeek?: string
  overview?: string
  responsibilities: string[]
  requirements: string[]
  location?: string
  type?: string
  deadline?: string
  isActive: boolean
  isDraft: boolean
  questions?: VacancyQuestion[]
  createdAt: string
  updatedAt: string
  _count?: {
    applications: number
  }
}

export const useGetVacancies = (params: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: ['vacancies', params],
    queryFn: async () => {
      const response = await client.get({
        url: '/api/v1/vacancies',
        query: params,
      })
      return response.data as {
        data: VacancyResponseDto[]
        meta: Meta
      }
    },
  })
}

export const useGetVacancy = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: async () => {
      const response = await client.get({ url: `/api/v1/vacancies/${id}` })
      return response.data as { data: VacancyResponseDto }
    },
    enabled: Boolean(id) && enabled,
  })
}

export const useCreateVacancy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: VacancyFormValues) => {
      const response = await client.post({
        url: '/api/v1/vacancies',
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      toast.success('Vacancy created successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create vacancy'
      )
    },
  })
}

export const useUpdateVacancy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: VacancyFormValues
    }) => {
      const response = await client.patch({
        url: `/api/v1/vacancies/${id}`,
        body: data,
      })
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      queryClient.invalidateQueries({ queryKey: ['vacancy', id] })
      toast.success('Vacancy updated successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update vacancy'
      )
    },
  })
}

export const useDeleteVacancy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete({ url: `/api/v1/vacancies/${id}` })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      toast.success('Vacancy deleted successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete vacancy'
      )
    },
  })
}

export const useApplyVacancy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      vacancyId,
      data,
    }: {
      vacancyId: string
      data: VacancyApplyFormValues
    }) => {
      // confirmEmail is a client-side guard only.
      const { confirmEmail: _confirmEmail, ...payload } = data
      const response = await client.post({
        url: `/api/v1/vacancies/${vacancyId}/apply`,
        body: payload,
      })
      return response.data
    },
    onSuccess: (_, { vacancyId }) => {
      queryClient.invalidateQueries({ queryKey: ['vacancy-applications', vacancyId] })
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      toast.success('Application submitted successfully!')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit application'
      )
    },
  })
}

export const useGetVacancyApplications = (
  vacancyId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['vacancy-applications', vacancyId],
    queryFn: async () => {
      const response = await client.get({
        url: `/api/v1/vacancies/${vacancyId}/applications`,
      })
      return response.data as { data: VacancyApplicationResponseDto[] }
    },
    enabled: Boolean(vacancyId) && enabled,
  })
}

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      vacancyId,
    }: {
      applicationId: string
      status: string
      vacancyId: string
    }) => {
      const response = await client.patch({
        url: `/api/v1/vacancies/applications/${applicationId}/status`,
        body: { status },
      })
      return { data: response.data, vacancyId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['vacancy-applications', result.vacancyId],
      })
      toast.success('Application status updated')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update application status'
      )
    },
  })
}

export const useDeleteApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      applicationId,
      vacancyId,
    }: {
      applicationId: string
      vacancyId: string
    }) => {
      await client.delete({
        url: `/api/v1/vacancies/applications/${applicationId}`,
      })
      return { vacancyId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['vacancy-applications', result.vacancyId],
      })
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      toast.success('Application deleted')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete application'
      )
    },
  })
}
