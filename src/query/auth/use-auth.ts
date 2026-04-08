import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { apiConfig } from '@/config/api.config'
import apiClient from '@/query/apiClient'
import { LoginPayload, LoginResponse } from '@/schemas/auth/login'
import { Meta } from '@/schemas/shared'
import { UserOutput } from '@/api/types.gen'
import { useAuthStore } from '@/stores/authStore'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from '@/hooks/use-toast'
import {
  authControllerChangePasswordMutation,
  authControllerLoginMutation,
  authControllerRegisterLocalMutation,
  authControllerResendVerificationMutation,
} from '../../api/@tanstack/react-query.gen'
import { auth } from '../shared/routes'

// Auth service functions
export const getProfile = async (): Promise<UserOutput> => {
  const response = await apiClient.get(auth.profile.path)
  const body = response?.data as
    | { data?: UserOutput; meta?: unknown }
    | UserOutput
    | undefined

  if (body && typeof body === 'object' && 'data' in body && body.data) {
    return body.data as UserOutput
  }
  if (body && typeof body === 'object' && 'id' in body && 'email' in body) {
    return body as UserOutput
  }

  throw new Error('Invalid profile response')
}

export const login = async (
  payload: LoginPayload
): Promise<{
  data: LoginResponse
  meta: Meta
}> => {
  const res = await apiClient.post(auth.login.path, payload)
  return res.data
}

// React Query hooks
export const useGetProfile = (enabled = true) => {
  return useQuery({
    queryKey: [auth.profile.key],
    queryFn: getProfile,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  })
}

export const useLogin = () => {
  const { setAccessToken, resetAuthStore } = useAuthStore()
  const navigate = useNavigate()

  const loginMutation = authControllerLoginMutation()

  return useMutation({
    mutationFn: loginMutation.mutationFn,
    onError: (err: unknown) => {
      // Check if it's an unverified account error
      if (err && typeof err === 'object' && 'error' in err) {
        const errorObj = err as any
        if (errorObj.error?.message === 'This account is not verified!') {
          // Redirect to OTP verification page with email
          const email = errorObj.error?.details?.email || ''
          navigate({
            to: '/verify-email',
            search: { email },
            replace: true,
          })
          return
        }
      }
      handleServerError(err)
    },
    onSuccess: (res) => {
      const { accessToken } = res.data
      console.log('accessToken', accessToken)
      if (accessToken) {
        setAccessToken(accessToken)
        // Update API client config with new token
        apiConfig()

        const decoded = JSON.parse(
          atob(accessToken.split('.')[1])
        ) as unknown as {
          role: string
        }

        const validRoles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN', 'USER']

        if (
          !decoded?.role ||
          !validRoles.includes(decoded?.role)
        ) {
          toast({
            title: 'Invalid Login',
            variant: 'destructive',
          })
          return
        } else {
          navigate({
            to: '/',
            replace: true,
            // @ts-ignore
            state: { role: decoded?.role },
          })
        }
      } else {
        resetAuthStore()
        // Update API client config to remove token
        apiConfig()
      }
    },
  })
}

export const useSignup = () => {
  const navigate = useNavigate()

  const signupMutation = authControllerRegisterLocalMutation()

  return useMutation({
    mutationFn: signupMutation.mutationFn,
    onError: (err: unknown) => {
      handleServerError(err)
    },
    onSuccess: (_, variables) => {
      // After successful registration, redirect to email verification page
      // Pass the email from the registration payload
      const email = variables.body.email
      navigate({
        to: '/verify-email',
        search: { email },
        replace: true,
      })
    },
  })
}

export const useLogout = () => {
  const { resetAuthStore } = useAuthStore()
  const navigate = useNavigate()

  return () => {
    // add required cleanups on logout
    resetAuthStore()
    // Update API client config to remove token
    apiConfig()
    navigate({
      to: '/login',
      replace: true,
    })
  }
}

export const useResendVerification = () => {
  return useMutation({
    mutationFn: authControllerResendVerificationMutation().mutationFn,
    onError: (error: unknown) => {
      handleServerError(error)
    },
    onSuccess: (res: any) => {
      return res.data.data.message
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authControllerChangePasswordMutation().mutationFn,
    onError: (error: unknown) => {
      handleServerError(error)
    },
    onSuccess: (res: any) => {
      console.log('Change password response:', res)
      const message = res?.data?.message || 'Password changed successfully!'
      toast({
        title: message,
        variant: 'default',
      })
    },
  })
}
